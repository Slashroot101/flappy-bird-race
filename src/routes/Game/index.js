const gameService = require('./service');
const schema = require('./schemas');

module.exports = (fastify, options, next) => {
  fastify.get('/', {schema: schema.getWithFilter}, gameService.getWithFilter);
  fastify.post('/', {schema: schema.createGame}, gameService.createGame);
  fastify.put('/:id', {schema: schema.updateGame}, gameService.updateGame);
  fastify.setErrorHandler((err, req, reply) => {
    reply.send(err);
  });

  next();
};