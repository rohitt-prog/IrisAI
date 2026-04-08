# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build-stage to nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port and start nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
