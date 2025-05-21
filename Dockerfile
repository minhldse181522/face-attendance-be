# -------- Build stage --------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# COPY tsconfig.json ./
# COPY src ./src

COPY . .
RUN npx prisma generate

RUN npm run build

# ---------- Production stage ----------
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV production

CMD ["node", "dist/main.js"]
