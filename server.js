'use strict';

const fastify = require('fastify')({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

const PORT = 8000;

// Register static file serving plugin
fastify.register(require('@fastify/static'), {
  root: require('path').join(__dirname, 'static'),
  prefix: '/',
  index: ['index.html'],
  setHeaders: (res, path) => {
    // Set appropriate cache headers for static assets
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    } else if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
});

// Custom 404 handler to serve our 404.html page
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).type('text/html').sendFile('404.html');
});

// Add request logging hook
fastify.addHook('onRequest', async (request, reply) => {
  request.log.info(`${request.method} ${request.url}`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    await fastify.close();
    console.log('Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '127.0.0.1' });
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();