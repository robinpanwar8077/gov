# GovProNet Deployment Instructions

## Prerequisites
- Ubuntu 22.04 LTS (or similar) VPS
- Docker & Docker Compose installed
- Domain name pointed to the VPS IP

## Deployment Steps

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd gov_pro_net_system
   ```

2. **Configure Environment**
   Create a `.env` file in the root directory:
   ```bash
   DATABASE_URL="postgresql://postgres:postgrespassword@postgres:5432/govpronet"
   JWT_SECRET="your-super-secret-production-key-change-this"
   NODE_ENV="production"
   ```

3. **Build & Start Services**
   ```bash
   docker-compose up -d --build
   ```
   This will:
   - Start PostgreSQL database container
   - Build the Next.js application container
   - Mount a volume for uploads at `./uploads`

4. **Initialize Database**
   Since the app runs in a container, you need to run migrations inside it.
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

5. **Verify Deployment**
   - Visit `http://<your-ip>:3000`
   - You should see the GovProNet landing page.

## Maintenance

- **View Logs**: `docker-compose logs -f`
- **Backup Database**:
  ```bash
  docker-compose exec postgres pg_dump -U postgres govpronet > backup.sql
  ```
- **Update Application**:
  ```bash
  git pull
  docker-compose up -d --build --no-deps app
  ```

## Security Recommendations for Production
- Set up a reverse proxy (Nginx/Caddy) with SSL (Let's Encrypt) in front of port 3000.
- Update `DATABASE_URL` with a strong password.
- Ensure ports 3000/5432 are firewalled and only 80/443 are open (if using Nginx).
