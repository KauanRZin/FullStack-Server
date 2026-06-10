FROM node:20-alpine AS dev 
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS prod
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/ ./
CMD ["node", "src/server.js"]

