const fastify = require('fastify')({
  logger: true,
});
const path = require('path');
const swagger = require('../swagger');
const mongoose = require('mongoose');
const config = require('../config');

const start = async () => {
  try {
    fastify.register(require('fastify-swagger'), swagger.options);
    fastify.register(require('fastify-static'), {
      root: path.join(__dirname, 'public'),
      prefix: '/'
    });
    fastify.register(require('@guivic/fastify-socket.io'), {
      serveClient: true,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
    });
    await mongoose.connect(config.mongoConnectionString, {
      useNewUrlParser: true,
    });
    fastify.setNotFoundHandler((req, res) => {
      res.sendFile('index.html');
    });
    await fastify.listen(3000);
    fastify.swagger();
    fastify.log.info(`Server is listening on ${fastify.server.address().port}`);
    fastify.io.on('connection', (socket) => {
      socket.on('jump', (e)=>{
        console.log(socket.id)
        fastify.log.info(e)
        console.log(e)
      })
    })
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();