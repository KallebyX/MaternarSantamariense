# API + frontend estático da plataforma Maternar Santa-mariense
FROM node:22-bookworm-slim AS build
WORKDIR /app/backend
# better-sqlite3 compila módulo nativo
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY backend/package.json ./
RUN npm install --omit=dev --no-fund --no-audit

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
# frontend estático (index.html, acervo/, logos) na raiz; backend em /app/backend
COPY index.html logo_*.png logo_nepes.jpg ./
COPY acervo ./acervo
COPY backend ./backend
COPY --from=build /app/backend/node_modules ./backend/node_modules
RUN useradd -r -s /usr/sbin/nologin maternar \
 && mkdir -p /app/backend/data \
 && chown -R maternar:maternar /app/backend/data
USER maternar
WORKDIR /app/backend
ENV PORT=3000 HOST=0.0.0.0 DB_PATH=/app/backend/data/maternar.db STATIC_DIR=/app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:3000/api/saude').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
