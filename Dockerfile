# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Production stage
FROM nginx:alpine
COPY --from=build-stage /app /app
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache nodejs npm
WORKDIR /app
EXPOSE 80
CMD nginx && npm start