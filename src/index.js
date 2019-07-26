const fastify = require('fastify')({
  logger: true,
});
const path = require('path');
const swagger = require('../swagger');
const mongoose = require('mongoose');
const GameModel = require('./routes/Game/GameModel');
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
    fastify.register(require('./routes/Game'), {prefix: '/api/game'});
    fastify.setNotFoundHandler((req, res) => {
      res.sendFile('index.html');
    });

    fastify.get('/:id/game', (req, reply) => {
      reply.sendFile('game.html');
    });

    fastify.get('/', (req, reply) => {
      reply.sendFile('index.html');
    });

    await fastify.listen(3000);
    fastify.swagger();
    fastify.log.info(`Server is listening on ${fastify.server.address().port}`);
    fastify.io.on('connection', (socket) => {
      socket.on('join', e => {
        socket.join(e.game);
      });

      socket.on('gameCreate', e => {
        fastify.io.in('lobby').emit('gameCreate', {game: e.game},)
      });

      socket.on('joinLobby', e => {
        socket.join('lobby');
      });

      socket.on('jump', (e)=>{
        fastify.io.in(e.gameID).emit('jump', {player: socket.id});
      });

      socket.on('playerDead', (e) => {
        fastify.io.in(e.gameID).emit('playerDead', {player: e.player});
      });

      socket.on('clientGameJoin', async (e) => {
        const games = await GameModel.findById(e.gameID).exec();
        if(games && games.players.length >= config.numPlayersToStart){
          return socket.emit('clientGameLeave');
        }
        const game = await GameModel.findByIdAndUpdate(e.gameID, {
          $push: {
            players: {
              socketClientID: socket.id,
              name: e.name,
            }
          }
        }, {new: true}).exec();
        fastify.io.in(game._id).emit('clientGameJoin', {game: game._id, socket: socket.id, percentToFull: game.players.length / config.numPlayersToStart, numCurrentPlayers: game.players.length });
        if(game.players.length === config.numPlayersToStart){
          fastify.io.in('lobby').emit('gameFull', {game: game._id});
          fastify.io.in(game._id).emit('clientGameStart');
        }
      });
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();