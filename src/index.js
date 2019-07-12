const fastify = require('fastify')({
  logger: true,
});
const path = require('path');
const swagger = require('../swagger');

const start = async () => {
  try {
    fastify.register(require('fastify-swagger'), swagger.options);
    fastify.register(require('fastify-static'), {
      root: path.join(__dirname, 'public'),
      prefix: '/'
    });
    fastify.setNotFoundHandler((req, res) => {
      res.sendFile('index.html');
    });
    await fastify.listen(3000);
    fastify.swagger();
    fastify.log.info(`Server is listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();