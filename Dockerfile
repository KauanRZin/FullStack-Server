FROM node:20-alpine AS prod
WORKDIR /app/backend
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm install 
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/ ./
CMD sh -c "npx prisma migrate deploy && node prisma/seed.js && npm run start"