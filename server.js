'use strict';

const fastify = require('fastify')({ logger: { level: 'info' } });

const PORT = 8000;

fastify.register(require('@fastify/static'), {
  root: require('path').join(__dirname, 'static'),
  prefix: '/',
  index: ['index.html'],
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
  },
});

fastify.setNotFoundHandler((_, reply) => {
  reply.code(404).type('text/html').sendFile('404.html');
});

fastify.addHook('onRequest', async (request) => {
  request.log.info(`${request.method} ${request.url}`);
});

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
