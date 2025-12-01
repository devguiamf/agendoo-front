# ===========================================
# Frontend Ionic/Angular - Multi-stage Build
# ===========================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Argumento para URL da API (pode ser sobrescrito no build)
ARG API_URL=http://localhost:3000

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia código fonte
COPY . .

# Substitui a URL da API no environment de produção
RUN sed -i "http://localhost:3000" src/environments/environment.prod.ts

# Build da aplicação para produção
RUN npm run build -- --configuration=production

# ===========================================
# Stage 2: Nginx para servir arquivos estáticos
# ===========================================
FROM nginx:alpine AS production

# Remove configuração padrão do nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia arquivos buildados do Angular
COPY --from=builder /app/www /usr/share/nginx/html

# Cria usuário não-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Expõe porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:80/ || exit 1

# Inicia nginx
CMD ["nginx", "-g", "daemon off;"]

