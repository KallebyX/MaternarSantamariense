#!/usr/bin/env python3
"""Prepara imagem/volume via HTTPS. Usa auxiliar temporário; não publica a aplicação."""
import argparse
from email import policy
from email.parser import BytesParser
import getpass
import json
from pathlib import Path
import re
import ssl
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid


class Client:
    def __init__(self, url, endpoint, username=None, credentials_eml=None):
        if not url.startswith('https://'):
            raise ValueError('Use HTTPS com certificado válido.')
        self.url = url.rstrip('/')
        self.endpoint = endpoint
        self.docker = f'/api/endpoints/{endpoint}/docker'
        self.context = ssl.create_default_context()
        if sys.platform == 'darwin' and Path('/etc/ssl/cert.pem').exists():
            self.context.load_verify_locations('/etc/ssl/cert.pem')
        self.token = None
        if credentials_eml:
            email = BytesParser(policy=policy.default).parsebytes(Path(credentials_eml).read_bytes())
            body = email.get_body(preferencelist=('plain',)).get_content()
            match = re.search(r'Acesso Portainer\s*-\s*(https://\S+)\s+user:\s*([^\r\n]+)\s+pass:\s*([^\r\n]+)', body)
            if not match or match[1].rstrip('/') != self.url:
                raise ValueError('O e-mail não contém credenciais para este endereço de Portainer.')
            username, password = match[2].strip(), match[3].strip()
        else:
            username = username or input('Usuário Portainer: ')
            password = getpass.getpass('Senha Portainer: ')
        self.token = self.request('/api/auth', 'POST', {'Username': username, 'Password': password})['jwt']
        self.user = self.request('/api/users/me')['Id']

    def open(self, path, method='GET', data=None, headers=None, timeout=60):
        headers = dict(headers or {})
        if self.token:
            headers['Authorization'] = 'Bearer ' + self.token
        if isinstance(data, dict):
            headers['Content-Type'] = 'application/json'
            data = json.dumps(data).encode()
        elif data is None and method in {'POST', 'PUT'}:
            headers['Content-Type'] = 'application/json'
            headers['Content-Length'] = '0'
            data = b''
        request = urllib.request.Request(self.url + path, data=data, headers=headers, method=method)
        try:
            return urllib.request.urlopen(request, timeout=timeout, context=self.context)
        except urllib.error.HTTPError as error:
            if error.code >= 500 or (path.startswith(self.docker) and error.code != 404):
                raw = error.read(4096).decode(errors='replace')
                if self.token:
                    raw = raw.replace(self.token, '[redigido]')
                raw = re.sub(r'JWT_SECRET=[^\s"\\]+', 'JWT_SECRET=[redigido]', raw)
                raise RuntimeError(f'Portainer HTTP {error.code}: {raw[:1000]}') from None
            raise

    def request(self, path, method='GET', data=None):
        with self.open(path, method, data) as response:
            raw = response.read()
            return json.loads(raw) if raw else None

    def engine(self, path, method='GET', data=None):
        return self.request(self.docker + path, method, data)

    def create_stack(self, name, content, variables=None):
        return self.request(f'/api/stacks/create/standalone/string?endpointId={self.endpoint}', 'POST', {
            'Name': name, 'StackFileContent': content,
            'Env': [{'name': key, 'value': str(value)} for key, value in (variables or {}).items()],
        })

    def stack_container(self, name):
        query = urllib.parse.urlencode({'all': '1', 'filters': json.dumps({'label': ['com.docker.compose.project=' + name]})})
        deadline = time.monotonic() + 30
        while True:
            containers = self.engine('/containers/json?' + query)
            if len(containers) == 1:
                return containers[0]['Id']
            if len(containers) > 1:
                raise RuntimeError('A stack deve ter exatamente um contêiner; encontrados vários.')
            if time.monotonic() >= deadline:
                raise RuntimeError('O contêiner da stack não apareceu em 30 segundos.')
            # Portainer pode devolver a stack antes de o Compose criar o contêiner.
            time.sleep(1)

    def remove_stack(self, stack_id):
        self.request(f'/api/stacks/{stack_id}?endpointId={self.endpoint}', 'DELETE')

    def private(self, resource, kind):
        # O Portainer pode já ter associado controle privado à criação via proxy.
        self.request('/api/resource_controls', 'POST', {
            'ResourceID': resource, 'Type': kind, 'Users': [self.user], 'Teams': [],
            'Public': False, 'AdministratorsOnly': False,
        })

    def exec(self, container, command):
        execution = self.engine(f'/containers/{container}/exec', 'POST', {
            'Cmd': command, 'AttachStdout': True, 'AttachStderr': True, 'Tty': False,
        })['Id']
        with self.open(self.docker + f'/exec/{execution}/start', 'POST', {'Detach': False, 'Tty': False}, timeout=120) as response:
            raw = response.read()
        # Docker multiplexa stdout/stderr com cabeçalhos de 8 bytes.
        output = bytearray()
        while raw:
            if len(raw) < 8 or raw[0] not in (0, 1, 2) or raw[1:4] != b'\0\0\0':
                raise ValueError('Resposta de execução Docker inválida.')
            length = struct.unpack('>I', raw[4:8])[0]
            output.extend(raw[8:8 + length])
            raw = raw[8 + length:]
        status = self.engine(f'/exec/{execution}/json')
        if status['Running'] or status['ExitCode'] != 0:
            raise RuntimeError('Comando no contêiner falhou: ' + output.decode(errors='replace')[:1000])
        return output.decode(errors='replace').strip()

    def upload(self, container, archive, destination='/tmp'):
        with Path(archive).open('rb') as stream:
            with self.open(self.docker + f'/containers/{container}/archive?' + urllib.parse.urlencode({'path': destination, 'copyUIDGID': 'true', 'noOverwriteDirNonDir': 'true'}), 'PUT', stream,
                           {'Content-Type': 'application/x-tar', 'Content-Length': str(Path(archive).stat().st_size)}, timeout=600) as response:
                response.read()


def build(client, archive, image):
    try:
        client.engine('/images/' + urllib.parse.quote(image, safe='') + '/json')
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
    else:
        raise ValueError('A tag já existe. Escolha outra versão; a imagem anterior foi preservada.')
    query = urllib.parse.urlencode({'dockerfile': 'backend/Dockerfile', 't': image, 'rm': '1', 'forcerm': '1', 'memory': str(2 * 1024**3), 'cpuperiod': '100000', 'cpuquota': '150000'})
    with Path(archive).open('rb') as stream:
        with client.open(client.docker + '/build?' + query, 'POST', stream,
                         {'Content-Type': 'application/x-tar', 'Content-Length': str(Path(archive).stat().st_size)}, timeout=1800) as response:
            for line in response:
                item = json.loads(line)
                if item.get('error'):
                    raise RuntimeError(item['error'])
                if 'stream' in item:
                    print(item['stream'], end='', flush=True)
    result = client.engine('/images/' + urllib.parse.quote(image, safe='') + '/json')
    print(json.dumps({k: result[k] for k in ['Id', 'RepoTags', 'Architecture', 'Os', 'Size']}))


def restore(client, archive, image, volume):
    quoted = urllib.parse.quote(volume, safe='')
    try:
        client.engine('/volumes/' + quoted)
    except urllib.error.HTTPError as error:
        if error.code != 404:
            raise
    else:
        raise ValueError('Volume já existe. Use um nome novo; nenhum dado existente será sobrescrito.')
    marker = uuid.uuid4().hex
    created = client.engine('/volumes/create', 'POST', {'Name': volume, 'Labels': {'app': 'maternar', 'maternar.restore': marker}})
    if created.get('Labels', {}).get('maternar.restore') != marker:
        raise ValueError('Conflito de nome de volume. Nenhum dado enviado.')
    info = client.engine('/volumes/' + quoted)
    control = info.get('Portainer', {}).get('ResourceControl')
    if not control:
        if not info.get('ResourceID'):
            raise ValueError('Portainer não identificou o controle do volume. Nenhum dado enviado.')
        client.private(info['ResourceID'], 3)
        control = client.engine('/volumes/' + quoted).get('Portainer', {}).get('ResourceControl')
    if not control or control.get('Public') or not (control.get('AdministratorsOnly') or any(u.get('UserId') == client.user for u in control.get('UserAccesses', []))):
        raise ValueError('Não foi possível confirmar acesso restrito ao volume. Nenhum dado enviado.')
    stack = None
    try:
        name = 'maternar-restaurar-' + marker[:12]
        content = json.dumps({
            'services': {'restore': {
                'image': image, 'pull_policy': 'never', 'user': '10001:10001',
                # Docker archive PUT não escreve em rootfs read-only mesmo com tmpfs.
                # Só este auxiliar sem rede tem camada temporária gravável.
                'command': ['sleep', '600'], 'network_mode': 'none',
                'cap_drop': ['ALL'], 'mem_limit': '256m', 'restart': 'no',
                'healthcheck': {'disable': True},
                'volumes': ['dados:/app/backend/data'],
            }},
            'volumes': {'dados': {'external': True, 'name': volume}},
        })
        stack = client.create_stack(name, content)['Id']
        container = client.stack_container(name)
        client.upload(container, archive)
        print(client.exec(container, ['node', 'scripts/restaurar-volume.mjs', '/tmp/backup', '/app/backend/data']))
        verify = "const Database=require('better-sqlite3');const fs=require('fs');const db=new Database('/app/backend/data/maternar.db',{readonly:true});console.log(JSON.stringify({integrity:db.pragma('integrity_check',{simple:true}),roles:db.prepare('SELECT perfil,COUNT(*) total FROM usuarios GROUP BY perfil').all(),uid:fs.statSync('/app/backend/data/maternar.db').uid,mode:(fs.statSync('/app/backend/data/maternar.db').mode&511).toString(8)}));db.close();"
        print(client.exec(container, ['node', '-e', verify]))
        print(json.dumps({'volume': volume, 'restricted': True, 'published': False}))
    finally:
        if stack is not None:
            client.remove_stack(stack)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', default='https://app.ufn.edu.br')
    parser.add_argument('--endpoint', type=int, default=5)
    parser.add_argument('--username')
    parser.add_argument('--credentials-eml', type=Path, help='E-mail privado fornecido pela TI; a senha nunca é impressa ou salva.')
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('inspect')
    builder = sub.add_parser('build')
    builder.add_argument('--archive', type=Path, required=True)
    builder.add_argument('--image', required=True)
    restorer = sub.add_parser('restore')
    restorer.add_argument('--archive', type=Path, required=True)
    restorer.add_argument('--image', required=True)
    restorer.add_argument('--volume', default='maternar-dados')
    args = parser.parse_args()
    client = Client(args.url, args.endpoint, args.username, args.credentials_eml)
    if args.action == 'build':
        build(client, args.archive, args.image)
    elif args.action == 'restore':
        restore(client, args.archive, args.image, args.volume)
    else:
        info = client.engine('/info')
        print(json.dumps({k: info.get(k) for k in ['Name', 'ServerVersion', 'Architecture', 'Swarm']}))
        print(json.dumps([{'name': c['Names'], 'ports': c['Ports']} for c in client.engine('/containers/json?all=1')]))


if __name__ == '__main__':
    try:
        main()
    except urllib.error.HTTPError as error:
        print(f'Portainer recusou a operação (HTTP {error.code}). Nenhuma credencial foi registrada.', file=sys.stderr)
        sys.exit(1)
    except (ValueError, RuntimeError, OSError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
