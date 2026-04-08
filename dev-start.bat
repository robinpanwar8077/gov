@echo off
REM GovProNet Development Start Script for Windows
REM Usage: .\dev-start.bat


echo 🚀 Starting GovProNet in Development Mode...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is NOT running.
    echo    Please start Docker Desktop and wait for it to initialize.
    echo    Then run this script again.
    pause
    exit /b 1
)

REM 1. Start PostgreSQL Container
echo ---------------------------------------
echo 📦 Checking/Starting Infrastructure (Docker)...
docker-compose up -d
echo    ✅ Database ensured running.

REM 2. Check Environment Variables
if not exist .env (
    echo ❌ .env file not found. Creating default local .env...
    echo DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/govpronet" > .env
    echo JWT_SECRET="dev-secret-key" >> .env
    echo S3_ENDPOINT="http://localhost:9000" >> .env
    echo S3_ACCESS_KEY="minioadmin" >> .env
    echo S3_SECRET_KEY="minioadminpassword" >> .env
    echo S3_BUCKET_NAME="govpronet" >> .env
    echo S3_REGION="us-east-1" >> .env
    echo    ✅ Created .env
)

REM 3. Prisma Setup
echo ---------------------------------------
echo 🛠️  Refreshing Database Schema...

echo Running: npx prisma generate
call npx prisma generate

echo Running: npx prisma db push
call npx prisma db push

REM 4. Start Next.js Development Server
echo ---------------------------------------
echo 💻 Starting Next.js Dev Server...
echo    Opening http://localhost:3000
echo ---------------------------------------

npm run dev
