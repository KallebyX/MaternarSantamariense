#!/usr/bin/env python3
"""Converte os oito originais DOCX do acervo sem modificar os arquivos-fonte.

Requer LibreOffice (SOFFICE pode apontar para o executável) e pypdf para conferir
que a saída tem páginas e texto. A ficha produzida é PDF comum, não preenchível.
"""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
BASES = [
    'acervo/mulher/protocolos/ficha-de-compartilhamento-de-informacao',
    'acervo/crianca/links-uteis/guia-para-encontrar-os-laudos-do-evoya',
    'acervo/saude-bucal/protocolos/protocolo-cirurgia-2018-1',
    'acervo/saude-bucal/protocolos/protocolo-endo-2018-1',
    'acervo/saude-bucal/protocolos/protocolo-pediatria-2019-1',
    'acervo/saude-bucal/protocolos/protocolo-perio-2018-1',
    'acervo/saude-bucal/protocolos/protocolo-pne-2018-1',
    'acervo/pics/material-curso-introdutorio',
]
soffice = os.environ.get('SOFFICE') or shutil.which('soffice') or shutil.which('libreoffice')
if not soffice:
    raise SystemExit('Instale LibreOffice ou defina SOFFICE com o caminho do executável.')
with tempfile.TemporaryDirectory(prefix='maternar-pdfs-') as pasta:
    temp = Path(pasta)
    subprocess.run([soffice, '-env:UserInstallation=' + (temp / 'perfil').as_uri(),
                    '--headless', '--convert-to', 'pdf', '--outdir', str(temp),
                    *[str(ROOT / (base + '.docx')) for base in BASES]], check=True)
    for base in BASES:
        saida = temp / (Path(base).name + '.pdf')
        pdf = PdfReader(saida)
        if not pdf.pages or not any((p.extract_text() or '').strip() for p in pdf.pages):
            raise SystemExit('PDF vazio ou sem texto: ' + str(saida))
        shutil.copyfile(saida, ROOT / (base + '.pdf'))
        print(base + '.pdf: ' + str(len(pdf.pages)) + ' páginas')
