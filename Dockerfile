# ---------- Etapa 1: Build ----------
FROM node:18-slim AS builder

# Instalar herramientas de compilación
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ---------- Etapa 2: Production ----------
FROM node:18-slim

WORKDIR /app
ENV NODE_ENV=production

# Instalar solo las librerías runtime necesarias para bcrypt
RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]