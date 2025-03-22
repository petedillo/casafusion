#!/bin/bash

# Function to test PostgreSQL connection
function test_postgresql {
  echo "Testing PostgreSQL connection..."
  node -e "
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.POSTGRES_HOST || 'postgres',
      port: 5432,
      user: process.env.POSTGRES_USER || 'casafusion_user',
      password: process.env.POSTGRES_PASSWORD || 'your_password',
      database: process.env.POSTGRES_DB || 'casafusion_db'
    });
    client.connect()
      .then(() => {
        console.log('PostgreSQL connection successful!');
        client.end();
        process.exit(0);
      })
      .catch(err => {
        console.error('PostgreSQL connection error:', err);
        process.exit(1);
      });
  "
  return $?
}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
RETRIES=10
until test_postgresql || [ $RETRIES -eq 0 ]; do
  echo "Waiting for PostgreSQL server, $((RETRIES--)) remaining attempts..."
  sleep 5
done

if [ $RETRIES -eq 0 ]; then
  echo "PostgreSQL is not available, proceeding anyway"
fi

# Initialize the database
echo "Initializing the database..."
npm run db:init

# Start the application
echo "Starting the application..."
npm run start 