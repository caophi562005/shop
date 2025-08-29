# ---- Stage 1: Build (Vite output: dist) ----
FROM node:22-alpine3.19 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY .env ./
COPY . .
RUN npm run build

# ---- Stage 2: Runtime (Nginx serve static) ----
FROM nginx:1.27-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
