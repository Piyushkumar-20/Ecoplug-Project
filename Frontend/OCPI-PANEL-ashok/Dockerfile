# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder

WORKDIR /app

ENV CI=true

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

LABEL org.opencontainers.image.title="ocpi-frontend" \
      org.opencontainers.image.description="Production Nginx image for the OCPI frontend"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

USER nginx

CMD ["nginx", "-g", "daemon off;"]