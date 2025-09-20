FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./
COPY packages/shared-types/ ../packages/shared-types/
COPY packages/shared-utils/ ../packages/shared-utils/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/backend/ .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "dev"]