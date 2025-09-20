FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY apps/frontend/package*.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli@17

# Install dependencies
RUN npm install

# Copy source code
COPY apps/frontend/ .

# Expose port
EXPOSE 4200

# Start command
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]