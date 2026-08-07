# Build stage: bundle the TypeScript server so the app runs from dist/server.cjs
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Bundle server.ts with esbuild (devDeps include esbuild & typescript)
RUN npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs

# Runtime stage
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundle and the rest of the source (relative non-package imports are inlined,
# but source is copied to avoid breaking dynamic/fs-dependent code paths)
COPY --from=builder /app/dist ./dist
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5000
CMD ["node", "dist/server.cjs"]