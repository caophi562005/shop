FROM node:22-alpine3.19

WORKDIR /app

COPY . .

RUN npm i --force
RUN npx prisma generate
RUN npm run build

CMD ["node", "dist/src/main"]