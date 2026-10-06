FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY tailwind.config.js ./
COPY angular.json ./

RUN npm ci

COPY src ./src

RUN npm run build -- --configuration production

# ── Image Nginx pour servir le frontend ──
FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers compilés (gère le répertoire standard ou /browser de l'application builder)
COPY --from=builder /app/dist/moyo-web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
