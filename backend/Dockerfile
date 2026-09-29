# API + frontend estático da plataforma Maternar Santa-mariense
FROM node:22-bookworm-slim AS build
WORKDIR /app/backend
# better-sqlite3 compila módulo nativo
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-fund --no-audit

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
# frontend estático (index.html, acervo/, logos) na raiz; backend em /app/backend
COPY index.html app.html app.js chat.js app.css mobile-navigation.js mobile-navigation.css painel.html painel.js redefinir.html redefinir.js logo_*.png logo_nepes.jpg ./
COPY cursos ./cursos
COPY qualifica ./qualifica
COPY produtos ./produtos
COPY acervo ./acervo
COPY assets/lucide.svg assets/lucide-LICENSE.txt ./assets/
COPY backend/package.json backend/package-lock.json ./backend/
COPY backend/src ./backend/src
COPY backend/seeds ./backend/seeds
COPY backend/scripts/backup.mjs backend/scripts/criar-admin.mjs backend/scripts/importar-equipe.mjs backend/scripts/restaurar-volume.mjs ./backend/scripts/
COPY --from=build /app/backend/node_modules ./backend/node_modules
RUN groupadd --gid 10001 maternar \
 && useradd --uid 10001 --gid 10001 --no-create-home --shell /usr/sbin/nologin maternar \
 && mkdir -p /app/backend/data/uploads \
 && chown -R 10001:10001 /app/backend/data \
 && chmod 700 /app/backend/data
USER 10001:10001
WORKDIR /app/backend
ENV PORT=3000 HOST=0.0.0.0 DB_PATH=/app/backend/data/maternar.db STATIC_DIR=/app UPLOAD_DIR=/app/backend/data/uploads
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/saude',{signal:AbortSignal.timeout(3000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
