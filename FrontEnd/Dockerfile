# Frontend Dockerfile - build Vite app and serve with nginx for Render
FROM node:20-alpine AS build
WORKDIR /app
# when build context is the FrontEnd directory, copy package files directly
COPY package*.json ./
RUN npm ci
# copy all frontend source from context
COPY . ./
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# copy built files
COPY --from=build /app/dist /usr/share/nginx/html
# copy nginx config template (we'll substitute PORT at runtime)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY runtime-config.js.template /usr/share/nginx/html/runtime-config.js.template
EXPOSE 80
CMD sh -c ": \${PORT:=80} ; : \${API_PROXY_URL:=http://127.0.0.1:65535} ; : \${API_BASE_URL:=} ; : \${MAINTENANCE_MODE:=false} ; : \${MAINTENANCE_ENABLED:=} ; : \${ENABLE_MAINTENANCE_PAGE:=} ; envsubst '\$PORT \$API_PROXY_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && envsubst '\$API_BASE_URL \$MAINTENANCE_MODE \$MAINTENANCE_ENABLED \$ENABLE_MAINTENANCE_PAGE' < /usr/share/nginx/html/runtime-config.js.template > /usr/share/nginx/html/runtime-config.js && nginx -g 'daemon off;'"
