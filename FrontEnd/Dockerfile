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
EXPOSE 80
CMD sh -c ": \${PORT:=80} ; envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
