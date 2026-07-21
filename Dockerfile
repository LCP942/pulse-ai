# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:24-alpine AS build
WORKDIR /app

# Install dependencies from lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the static site. VITE_ vars are baked in at build time, so the
# Stripe publishable key (optional — falls back to a public test key) must
# be provided here, not at runtime.
ARG VITE_STRIPE_PUBLISHABLE_KEY=""
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine AS serve

# SPA routing + asset caching config.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static build output.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Basic container healthcheck against the served index.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
