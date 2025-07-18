FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV REPLIT_KEEP_PACKAGE_DEV_DEPENDENCIES=1

# Make build script executable
RUN chmod +x deploy-build.sh

# Build the application
RUN ./deploy-build.sh

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]