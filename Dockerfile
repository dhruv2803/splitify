# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.25-alpine AS backend-builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./cmd/api/main.go

# Stage 3: Final Image
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates
# Copy backend binary
COPY --from=backend-builder /app/main .
# Copy frontend dist to be served by Go
COPY --from=frontend-builder /app/dist ./dist

# Create an empty database file if it doesn't exist (optional, GORM will create it)
# RUN touch splitify.db

EXPOSE 8080
CMD ["./main"]
