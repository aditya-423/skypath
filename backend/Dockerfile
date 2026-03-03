# Use lightweight Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose backend port
EXPOSE 3000

# Start server
CMD ["node", "src/server.js"]