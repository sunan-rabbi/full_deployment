import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before any other imports
const envPath =
  process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), '.env.prod')
    : path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

import { Server } from 'http';
import { AddressInfo } from 'net';
import app from './app';
import config from './config';

let server: Server;

async function bootstrap() {
  try {

    // Start server
    server = app.listen(config.port, () => {
      const address = server.address() as AddressInfo;

      console.log(`
        🚀 Server ready at http://localhost:${address.port}
        🔧 Environment: ${config.env}
        📅 Started: ${new Date().toISOString()}
      `);
    });

    // Handle server errors
    server.on('error', (error: Error) => {

      console.log('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    console.log('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {

  console.log(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    // Stop accepting new connections

    server.close(async () => {

      console.log('HTTP server closed');

      try {

        console.log('Database disconnected');

        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.log('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  }
}

// Error handlers
process.on('uncaughtException', (error: Error) => {
  //errorlogger.error('Uncaught Exception:', error);
  console.log('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  //errorlogger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
bootstrap().catch((error) => {
  //errorlogger.error('Bootstrap failed:', error);
  console.log('Bootstrap failed:', error);
  process.exit(1);
});