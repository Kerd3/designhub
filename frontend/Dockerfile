# Build context: repository root (the app imports ../shared).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci --workspace frontend --include-workspace-root=false
COPY shared ./shared
COPY frontend ./frontend
ARG VITE_DATA_SOURCE=api
ARG VITE_API_BASE_URL=http://localhost:5000/api
ENV VITE_DATA_SOURCE=$VITE_DATA_SOURCE VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
