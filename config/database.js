const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '94.136.184.114',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'waindiahub',
  password: process.env.DB_PASSWORD || 'waindiahub',
  database: process.env.DB_NAME || 'waindiahub',
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  acquireTimeout: 20000,
  timeout: 20000,
  idleTimeout: 600000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  reconnect: true,
  multipleStatements: false
};

const pool = mysql.createPool(dbConfig);

// Test database connection with retry
const testConnection = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return;
    } catch (error) {
      retries--;
      console.error(`❌ Database connection failed (${3-retries}/3):`, error.message);
      if (retries === 0) {
        console.error('❌ All connection attempts failed. Continuing without exit...');
        return; // Don't exit, let the app continue
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
    }
  }
};

testConnection();

module.exports = pool;