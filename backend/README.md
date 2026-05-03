# Splitify Backend

A high-performance Go backend for the Splitify expense management application.

## Tech Stack
- **Language:** Go (1.21+)
- **Framework:** [Gin Gonic](https://github.com/gin-gonic/gin)
- **ORM:** [GORM](https://gorm.io/)
- **Database:** SQLite (Local) / PostgreSQL (Production)
- **Auth:** Firebase Admin SDK

## Getting Started

### Prerequisites
1. **Go:** Ensure Go is installed. If `go` command is not recognized, add `C:\Program Files\Go\bin` to your system PATH.
2. **Firebase Service Account:** Place your `service-account.json` in this directory.

### Installation
```bash
go mod download
```

### Running Locally
```bash
go run cmd/api/main.go
```
The server will start on `http://localhost:8080`.

## Directory Structure
- `cmd/api/`: Entry point and route definitions.
- `internal/auth/`: Firebase Auth middleware and initialization.
- `internal/database/`: Database connection and auto-migrations.
- `internal/models/`: GORM models defining the database schema.

## Environment Variables
Create a `.env` file in the root of the backend directory:
- `PORT`: Server port (default 8080).
- `DB_TYPE`: `sqlite` or `postgres`.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Path to your service account file.

## API Endpoints
- `GET /health`: Health check.
- `GET /api/me`: Returns the UID of the authenticated user (requires Firebase Token).
