#!/usr/bin/env python3
"""Gera contexto Docker sem segredos e backup privado separado. Não publica nada."""
import argparse
from contextlib import closing
import hashlib
import json
import os
from pathlib import Path
import secrets
import shutil
import sqlite3
import tarfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
SOURCE = [
    '.dockerignore', 'index.html', 'app.html', 'app.js', 'chat.js', 'app.css',
    'painel.html', 'painel.js', 'redefinir.html', 'redefinir.js', 'acervo', 'cursos', 'qualifica', 'produtos',
    'assets/lucide.svg', 'assets/lucide-LICENSE.txt',
    'backend/Dockerfile', 'backend/package.json', 'backend/package-lock.json',
    'backend/src', 'backend/seeds', 'backend/scripts/backup.mjs',
    'backend/scripts/criar-admin.mjs', 'backend/scripts/importar-equipe.mjs',
    'backend/scripts/restaurar-volume.mjs',
]


def sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def source_files():
    entries = SOURCE + [p.name for p in ROOT.glob('logo_*.png')] + ['logo_nepes.jpg']
    for entry in entries:
        path = ROOT / entry
        candidates = sorted(path.rglob('*')) if path.is_dir() else [path]
        for file in candidates:
            if file.is_symlink():
                raise ValueError(f'Link simbólico não permitido: {file.relative_to(ROOT)}')
            if file.is_dir():
                continue
            relative = file.relative_to(ROOT)
            if file.name.startswith('.') and relative.as_posix() != '.dockerignore':
                continue
            if file.suffix in {'.db', '.eml'} or any(p in {'node_modules', 'data', '__pycache__'} for p in relative.parts):
                raise ValueError(f'Arquivo privado no contexto: {relative}')
            yield file, relative.as_posix()


def add_file(archive, path, name):
    # Metadados independentes da conta do desenvolvedor; sem atributos do macOS.
    info = archive.gettarinfo(str(path), arcname=name)
    info.uid = info.gid = 10001 if name.startswith('backup/') else 0
    info.uname = info.gname = ''
    info.mode = 0o600 if name.startswith('backup/') else 0o644
    with path.open('rb') as stream:
        archive.addfile(info, stream)


def prepare(output, image):
    os.umask(0o077)
    output.mkdir(parents=True, exist_ok=False)
    source = output / 'maternar-build.tar.gz'
    with tarfile.open(source, 'w:gz') as archive:
        for file, relative in source_files():
            add_file(archive, file, relative)

    database = ROOT / 'backend/data/maternar.db'
    if not database.is_file():
        raise ValueError('Banco local ausente. Nenhum banco vazio será criado para publicação.')
    backup = output / 'backup'
    backup.mkdir()
    # API SQLite incorpora WAL e preserva usuários, hashes e dados relacionais.
    with closing(sqlite3.connect(database.as_uri() + '?mode=ro', uri=True)) as live:
        with closing(sqlite3.connect(backup / 'maternar.db')) as snapshot:
            live.backup(snapshot)
            snapshot.execute('PRAGMA journal_mode=DELETE')
            if snapshot.execute('PRAGMA integrity_check').fetchone()[0] != 'ok' or snapshot.execute('PRAGMA foreign_key_check').fetchall():
                raise ValueError('Backup SQLite inválido.')
            users = snapshot.execute('SELECT COUNT(*) FROM usuarios').fetchone()[0]
            roles = dict(snapshot.execute('SELECT perfil, COUNT(*) FROM usuarios GROUP BY perfil').fetchall())
            registered_uploads = [row[0] for row in snapshot.execute('SELECT armazenado FROM arquivos')]
    uploads = ROOT / 'backend/data/uploads'
    (backup / 'uploads').mkdir()
    if uploads.exists():
        for file in sorted(uploads.iterdir()):
            if not file.is_file() or file.is_symlink():
                raise ValueError('Uploads devem conter apenas arquivos regulares.')
            shutil.copyfile(file, backup / 'uploads' / file.name)
    if any(Path(name).name != name or not (backup / 'uploads' / name).is_file() for name in registered_uploads):
        raise ValueError('Um upload referenciado pelo banco está ausente; repita com as escritas pausadas.')
    manifest = {'format': 1, 'created_at': datetime.now(timezone.utc).isoformat(), 'users': users, 'roles': roles, 'files': []}
    for file in sorted(backup.rglob('*')):
        if file.is_file():
            file.chmod(0o600)
            manifest['files'].append({'path': file.relative_to(backup).as_posix(), 'size': file.stat().st_size, 'sha256': sha256(file)})
    (backup / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    private = output / 'maternar-dados-PRIVADO.tar.gz'
    with tarfile.open(private, 'w:gz') as archive:
        for file in sorted(backup.rglob('*')):
            if file.is_file():
                add_file(archive, file, 'backup/' + file.relative_to(backup).as_posix())
    env = (ROOT / 'deploy/portainer/stack.env.example').read_text()
    env = env.replace('MATERNAR_IMAGE=maternar:20260929-portainer1', 'MATERNAR_IMAGE=' + image)
    env = env.replace('JWT_SECRET=\n', 'JWT_SECRET=' + secrets.token_hex(32) + '\n')
    (output / 'stack.env').write_text(env)
    shutil.copyfile(ROOT / 'deploy/portainer/stack.yml', output / 'stack.yml')
    files = [source, private, output / 'stack.env', output / 'stack.yml']
    (output / 'SHA256SUMS').write_text(''.join(f'{sha256(file)}  {file.name}\n' for file in files))
    (output / 'release.json').write_text(json.dumps({
        'image': image, 'domain': 'maternarsantamariense.app.ufn.edu.br',
        'source_bytes': source.stat().st_size, 'source_sha256': sha256(source),
        'users': users, 'roles': roles,
        'note': 'Pacote privado: banco e stack.env não podem ser incluídos em imagens ou repositórios.',
    }, indent=2) + '\n')
    print(json.dumps({'directory': str(output), 'image': image, 'users': users, 'roles': roles, 'source_bytes': source.stat().st_size}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='Diretório novo; jamais sobrescreve uma entrega anterior.')
    parser.add_argument('--image', default='maternar:20260929-portainer1')
    args = parser.parse_args()
    prepare(args.output.resolve(), args.image)
