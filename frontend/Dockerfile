# Stage 1: Build React/Vite app
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install packages
RUN npm install

# Copy source code and build it
COPY . .
RUN npm run build

# Stage 2: Serve build assets via Nginx
FROM nginx:alpine

# Copy static build outputs to nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx default port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
