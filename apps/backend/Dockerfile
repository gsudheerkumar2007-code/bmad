FROM node:20-alpine

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs

WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./
COPY packages/shared-types/ ../packages/shared-types/
COPY packages/shared-utils/ ../packages/shared-utils/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/backend/ .

# Change ownership to non-root user
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "dev"]