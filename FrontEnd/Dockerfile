# Frontend Dockerfile - build Vite app and serve with nginx for Render
FROM node:20-alpine AS build
WORKDIR /app
COPY FrontEnd/package*.json ./
RUN npm ci
COPY FrontEnd/ ./
RUN npm run build

FROM nginx:alpine
# copy built files
COPY --from=build /app/dist /usr/share/nginx/html
# copy nginx config (fallback to index.html for SPA)
COPY FrontEnd/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
