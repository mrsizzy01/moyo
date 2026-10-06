FROM node:20-alpine AS builder

WORKDIR /app

# Dépendances système pour compiler les modules natifs (argon2)
RUN apk add --no-cache python3 make g++ openssl

# Copier les fichiers de manifestes
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Installation des dépendances et génération du client Prisma
RUN npm ci
RUN npx prisma generate

# Copier le code source
COPY src ./src

# Compiler l'application NestJS
RUN npm run build

# ── Image d'exécution légère ──
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["node", "dist/main"]
