# Wafir Local Runner
# Starts Backend (NestJS) and Frontend (React)

Write-Host "Checking environment..." -ForegroundColor White

# Check Node
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install it."
    exit
}

# Check Docker (for DB)
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Warning "Docker is not installed. Ensure your PostgreSQL database is running manually."
} else {
    Write-Host "Ensuring Database is up..."
    docker-compose up -d postgres
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"

# Wait a bit for backend
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd web; npm run dev"

Write-Host "Wafir is starting! Web interface will be at http://localhost:5173" -ForegroundColor Cyan
