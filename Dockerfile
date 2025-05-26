# -------- Build stage --------
FROM node:18-bullseye AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ---------- Production stage ----------
FROM node:18-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

ENV NODE_ENV production

CMD ["./start.sh"]
