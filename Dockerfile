
FROM node:20
WORKDIR /usr/src/app

RUN apk add --no-cache libc6-compat

COPY package*.json ./

RUN npm ci --omit=dev

COPY prisma ./prisma

RUN npx prisma generate

COPY src ./src

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]


