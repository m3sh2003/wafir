# Wafir Docker Setup

This project is containerized using Docker and Docker Compose following best practices.

## Architecture

- **Backend**: NestJS API (Node.js 20 Alpine)
- **Frontend**: React + Vite with Nginx
- **Database**: PostgreSQL 15 Alpine
- **Admin Tool**: pgAdmin 4

## Prerequisites

- Docker Desktop (includes Docker and Docker Compose)
- Git

## Quick Start

1. **Clone the repository** (if not already done)

2. **Set environment variables** (optional)
   ```bash
   # Create a .env file in the root directory for production secrets
   cp backend/.env.example .env
   # Edit .env and change JWT_SECRET
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f web
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - pgAdmin: http://localhost:5050
     - Email: admin@wafir.com
     - Password: admin

## Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up -d --build

# Start specific service
docker-compose up -d backend
```

### Stop and Remove
```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes (⚠️ deletes database data)
docker-compose down -v
```

### Rebuild
```bash
# Rebuild a specific service
docker-compose build backend
docker-compose build web

# Rebuild without cache
docker-compose build --no-cache
```

### View Status
```bash
# Check running containers
docker-compose ps

# View resource usage
docker stats
```

## Development Mode

For development with hot-reload, uncomment the volumes section in `docker-compose.yml` for the backend service.

## Docker Best Practices Implemented

### Multi-Stage Builds
- ✅ Separate build and production stages
- ✅ Smaller final image sizes
- ✅ No development dependencies in production

### Security
- ✅ Non-root user in containers
- ✅ Alpine-based images (minimal attack surface)
- ✅ Security headers in Nginx
- ✅ Environment variable management
- ✅ Health checks for all services

### Performance
- ✅ Layer caching optimization
- ✅ npm ci for deterministic installs
- ✅ Cache cleaning after install
- ✅ Gzip compression in Nginx
- ✅ Production-only dependencies

### Reliability
- ✅ Health checks with retries
- ✅ Service dependencies (depends_on with conditions)
- ✅ Restart policies
- ✅ Proper network isolation
- ✅ Volume persistence for data

### Maintainability
- ✅ .dockerignore files
- ✅ Clear stage naming
- ✅ Environment variable configuration
- ✅ Comments and documentation
- ✅ Proper working directory structure

## Troubleshooting

### Port Already in Use
```bash
# Find and stop process using the port
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Clear Everything and Start Fresh
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Check Container Health
```bash
docker inspect wafir_backend --format='{{.State.Health.Status}}'
docker inspect wafir_web --format='{{.State.Health.Status}}'
```

## Production Deployment

For production deployment:

1. **Update environment variables**
   - Set strong JWT_SECRET
   - Use secure database credentials
   - Configure proper CORS settings

2. **Use a reverse proxy** (Nginx/Traefik)
   - SSL/TLS termination
   - Load balancing
   - Rate limiting

3. **Database backups**
   ```bash
   docker-compose exec postgres pg_dump -U postgres wafir > backup.sql
   ```

4. **Monitor logs and health**
   - Set up log aggregation
   - Configure monitoring tools
   - Set up alerts

## File Structure

```
.
├── backend/
│   ├── Dockerfile              # Multi-stage build for NestJS
│   ├── .dockerignore          # Ignore unnecessary files
│   └── .env.example           # Environment template
├── web/
│   ├── Dockerfile              # Multi-stage build with Nginx
│   └── .dockerignore          # Ignore unnecessary files
├── docker-compose.yml          # Service orchestration
└── DOCKER.md                   # This file
```

## Image Sizes

Approximate production image sizes:
- Backend: ~180MB (Node.js Alpine + app)
- Frontend: ~45MB (Nginx Alpine + static files)
- PostgreSQL: ~240MB (Official Alpine)

## Network Architecture

All services communicate through a dedicated bridge network (`wafir-network`):
- Frontend → Backend: Internal network communication
- Backend → Database: Internal network communication
- External access through exposed ports only

## Support

For issues or questions:
- Check container logs: `docker-compose logs [service]`
- Verify health: `docker-compose ps`
- Review this documentation
