#!/bin/bash
# Production startup script

echo "Starting Farmify in production mode..."

# Ensure uploads directory exists
mkdir -p uploads

# Set production environment
export NODE_ENV=production

# Use production environment file if it exists
if [ -f .env.production ]; then
  export $(cat .env.production | xargs)
fi

# Start the application
echo "Starting server on port $PORT..."
npm start
