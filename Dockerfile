# -------- Build stage --------
FROM node:18-bullseye AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ---------- Production stage ----------
FROM node:18-bullseye

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV production

CMD ["node", "dist/src/main.js"]
