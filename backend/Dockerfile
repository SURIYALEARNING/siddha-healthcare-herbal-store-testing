FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# bcrypt needs a native build on alpine; install tools, build, then remove them
RUN apk add --no-cache python3 make g++ \
    && npm ci \
    && apk del python3 make g++

# Copy source code
COPY . .

EXPOSE 5000
CMD ["npx", "tsx", "server.ts"]
