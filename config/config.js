import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    username: process.env.POSTGRES_USER || 'casafusion_user',
    password: process.env.POSTGRES_PASSWORD || 'your_password',
    database: process.env.POSTGRES_DB || 'casafusion_db',
    host: process.env.POSTGRES_HOST || 'postgres',
    dialect: 'postgres'
  },
  test: {
    dialect: 'sqlite',
    storage: './database.test.sqlite',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}; 