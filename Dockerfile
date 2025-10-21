# Build frontend
FROM node:22-alpine AS frontend
WORKDIR /front
COPY front/package*.json ./
RUN npm install
COPY front/ .
RUN npm run build

# Build backend
FROM node:22-alpine AS backend
WORKDIR /app
COPY back/services/package*.json ./
RUN npm install --omit=dev
COPY back/services/ .
COPY --from=frontend /front/dist ./public

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
