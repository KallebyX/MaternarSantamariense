#!/usr/bin/env bash
# Deploy/atualização da plataforma Maternar em uma VM Debian/Ubuntu (sem Docker).
# Uso: sudo bash deploy/deploy.sh
set -euo pipefail

DESTINO=/opt/maternar
REPO_URL=https://github.com/KallebyX/MaternarSantamariense.git

echo "== Dependências do sistema =="
apt-get update -qq
apt-get install -y -qq git nginx nodejs npm build-essential python3 >/dev/null
node -v | grep -qE 'v(2[0-9]|[3-9][0-9])' || {
  echo "Node >= 20 é necessário. Instale via NodeSource:";
  echo "  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs";
  exit 1;
}

echo "== Código =="
if [ -d "$DESTINO/.git" ]; then
  git -C "$DESTINO" pull --ff-only
else
  git clone "$REPO_URL" "$DESTINO"
fi

echo "== Usuário de serviço e segredo =="
id -u maternar &>/dev/null || useradd -r -s /usr/sbin/nologin maternar
mkdir -p /etc/maternar "$DESTINO/backend/data"
if [ ! -f /etc/maternar/env ]; then
  echo "JWT_SECRET=$(openssl rand -hex 32)" > /etc/maternar/env
  chmod 600 /etc/maternar/env
fi
chown -R maternar:maternar "$DESTINO/backend/data"

echo "== Dependências do backend =="
cd "$DESTINO/backend"
sudo -u maternar npm install --omit=dev --no-fund --no-audit

echo "== systemd + nginx =="
cp "$DESTINO/deploy/maternar.service" /etc/systemd/system/maternar.service
systemctl daemon-reload
systemctl enable --now maternar
cp "$DESTINO/deploy/nginx.conf" /etc/nginx/sites-available/maternar
ln -sf /etc/nginx/sites-available/maternar /etc/nginx/sites-enabled/maternar
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "== Verificação =="
sleep 2
curl -sf http://127.0.0.1:3000/api/saude >/dev/null && echo "API ok" || { echo "API FALHOU"; journalctl -u maternar -n 20 --no-pager; exit 1; }
curl -sf http://127.0.0.1/ >/dev/null && echo "nginx ok"
echo "Deploy concluído. Acesse pelo IP da VM (na VPN)."
