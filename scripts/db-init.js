'use strict';

import { Sequelize } from 'sequelize';
import { exec } from 'child_process';
import config from '../config/config.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else if (dbConfig.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    logging: dbConfig.logging
  });
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions
  });
}

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    console.log(`Connected to ${dbConfig.dialect} database at ${dbConfig.host || 'local file'}`);
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

// Run migrations manually using raw SQL
async function runMigrations() {
  console.log('Manually creating tables...');
  
  try {
    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);
    
    // Create Users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255),
        "image" VARCHAR(255),
        "isOAuth" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);
    
    // Create Households table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Households" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "adminId" UUID NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);
    
    // Create HouseholdMembers table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "HouseholdMembers" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "householdId" UUID NOT NULL,
        "isAdmin" BOOLEAN DEFAULT false NOT NULL,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);
    
    // Create JoinRequests table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "JoinRequests" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL,
        "householdId" UUID NOT NULL,
        "status" VARCHAR(20) DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);
    
    console.log('Database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

// Initialize database
async function initDatabase() {
  try {
    // Wait a moment if we're in a Docker environment to ensure PostgreSQL is ready
    if (process.env.IN_DOCKER && dbConfig.dialect === 'postgres') {
      console.log('In Docker environment, waiting for PostgreSQL to start...');
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
    }
    
    const connected = await testConnection();
    
    if (connected) {
      await runMigrations();
      console.log('Database initialization completed successfully.');
    } else {
      console.error('Database initialization failed due to connection issues.');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    process.exit();
  }
}

// Execute initialization
initDatabase(); 