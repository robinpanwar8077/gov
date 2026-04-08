#!/bin/bash

# GovProNet Development Start Script
# Usage: ./dev-start.sh

echo "🚀 Starting GovProNet in Development Mode..."

# 1. Start PostgreSQL Container
echo "---------------------------------------"
echo "📦 Checking/Starting Database (Docker)..."
if ! docker ps | grep -q govpronet-db; then
    echo "   Starting postgres service..."
    docker-compose up -d postgres
    echo "   ✅ Database started."
    
    # Wait for DB to be ready (simple sleep)
    echo "   ⏳ Waiting for DB to be ready (5s)..."
    sleep 5
else
    echo "   ✅ Database is already running."
fi

# 2. Check Environment Variables
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating default local .env..."
    echo 'DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/govpronet"' > .env
    echo 'JWT_SECRET="dev-secret-key"' >> .env
    echo "   ✅ Created .env"
fi

# 3. Prisma Setup (Generate Client & Push Schema)
echo "---------------------------------------"
echo "🛠️  Refreshing Database Schema..."
# Run migrate dev non-interactively if possible, or usually just generate
# We use 'npx prisma db push' for rapid prototyping to sync schema without creating migration files every time,
# OR 'npx prisma migrate dev' if you want version control. Let's use migrate dev.

echo "   > npx prisma generate"
npx prisma generate

# Only run migration if interactive or assume yes to apply? 
# For safety in script, we perform db push or migrate deploy.
# 'migrate dev' requires interaction for name if schema changed.
# Let's use 'db push' which is great for dev iteration.
echo "   > npx prisma db push"
npx prisma db push

# 4. Start Next.js Development Server
echo "---------------------------------------"
echo "💻 Starting Next.js Dev Server..."
echo "   Opening http://localhost:3000"
echo "---------------------------------------"

npm run dev
