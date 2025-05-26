#!/bin/sh

echo "🔥 Running prisma migrate deploy..."
npx prisma migrate deploy

echo "🚀 Starting NestJS app..."
exec node dist/src/main.js
