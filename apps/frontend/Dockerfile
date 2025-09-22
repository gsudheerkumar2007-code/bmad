FROM node:20-alpine

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY apps/frontend/package*.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli@17

# Install dependencies
RUN npm install

# Copy source code
COPY apps/frontend/ .

# Change ownership to non-root user
RUN chown -R frontend:nodejs /app

# Switch to non-root user
USER frontend

# Expose port
EXPOSE 4200

# Start command
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]