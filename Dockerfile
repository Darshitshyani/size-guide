FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

COPY . .

# Build the app (requires devDependencies like tailwindcss, postcss, etc.)
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --omit=dev && npm cache clean --force

ENV NODE_ENV=production

CMD ["npm", "run", "docker-start"]
