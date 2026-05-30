FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN sed -i 's/\r$//' docker-entrypoint.sh && npm run build

EXPOSE 3001

CMD ["sh", "./docker-entrypoint.sh"]
