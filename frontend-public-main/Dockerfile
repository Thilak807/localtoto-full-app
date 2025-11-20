# Frontend Dockerfile for Cloud Run
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL=https://django-backend-797326917118.europe-west1.run.app/api
ARG VITE_BACKEND_PORT=8001
ARG VITE_OLA_MAPS_API_KEY=iNQjLwaqj53KDxJE9a7afHhIvhQ3INgt9CyNwtlT
ARG VITE_RAZORPAY_KEY_ID

# Set production environment variables (Vite requires VITE_ prefix)
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_BACKEND_PORT=${VITE_BACKEND_PORT}
ENV VITE_OLA_MAPS_API_KEY=${VITE_OLA_MAPS_API_KEY}
ENV VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
