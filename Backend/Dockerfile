
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY src ./src
COPY openapi.json ./openapi.json

EXPOSE 5000

CMD ["node", "src/server.js"]