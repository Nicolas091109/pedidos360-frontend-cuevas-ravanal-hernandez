FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && rm -rf node_modules

FROM nginx:alpine
RUN apk add --no-cache curl && rm -rf /var/cache/apk/*
COPY --from=build /app/dist/frontend-pedidos/browser /usr/share/nginx/html
RUN cat > /etc/nginx/nginx.conf << 'EOF'
worker_processes auto;
pid /tmp/nginx.pid;
events {
    worker_connections 1024;
}
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    server {
        listen 8080;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        location /api/ {
            proxy_pass http://host.docker.internal:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    access_log /tmp/access.log;
    error_log /tmp/error.log;
}
EOF
RUN addgroup -S webgroup && adduser -S webuser -G webgroup \
  && chown -R webuser:webgroup /usr/share/nginx/html /var/cache/nginx /tmp /etc/nginx
EXPOSE 8080
ENV PORT=8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1
USER webuser
CMD ["nginx", "-g", "daemon off;"]
