# Build context: repository root (the API imports ../shared).
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace backend --omit=dev --include-workspace-root=false

COPY shared ./shared
COPY database ./database
COPY backend ./backend

WORKDIR /app/backend
USER node
EXPOSE 5000
# Apply migrations, load the demo seed, then start the API.
CMD ["sh", "-c", "node src/database/migrate.js && node src/database/seed.js && node src/server.js"]
