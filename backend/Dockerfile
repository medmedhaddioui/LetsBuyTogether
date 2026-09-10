FROM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY tsconfig.json eslint.config.js ./
COPY src ./src
RUN npm run build
FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --include=dev && npx prisma generate
COPY --from=build /app/dist ./dist
CMD ["sh","-c","npx prisma migrate deploy && node dist/src/server.js"]
