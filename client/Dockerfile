FROM node:lts AS build
WORKDIR /app-build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app-build/dist /usr/share/nginx/html/playground
COPY nginx.conf /etc/nginx/conf.d/default.conf
