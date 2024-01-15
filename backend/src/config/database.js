const mongoose = require('mongoose');
const logger = require('./logger');

class Database {
  constructor() {
    this.connection = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 3000;
  }

  async connect() {
    if (this.connection) {
      logger.info('Database already connected');
      return this.connection;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ops';

    try {
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      logger.info('Database connected successfully');
      this.retryCount = 0;
      
      this.setupGracefulShutdown();
      return this.connection;
    } catch (error) {
      logger.error('Database connection failed:', error);
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        logger.info(`Retrying database connection in ${this.retryDelay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        logger.error('Max database connection retries reached');
        throw error;
      }
    }
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async () => {
      if (this.connection) {
        await mongoose.disconnect();
        logger.info('Database disconnected gracefully');
        process.exit(0);
      }
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  }

  getConnectionStatus() {
    return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  }
}

module.exports = new Database();