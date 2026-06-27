# Use lightweight Node Alpine base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install project dependencies
RUN npm install --production

# Copy local source files
COPY . .

# Expose port 5000 (standard port for our server)
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
