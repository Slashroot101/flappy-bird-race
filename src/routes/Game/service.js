const GameModel = require('./GameModel');
const { boomify } = require('boom');
const config = require('../../../config');
exports.createGame = async (req, reply) => {
  try {
    req.body.createdOn = new Date();
    req.body.pipeHoles = [];
    for(let i = 0; i < 150; i++){
      req.body.pipeHoles.push(Math.floor(Math.random() * 8) + 1);
    }
    const game = await new GameModel(req.body).save();
    return {game};
  } catch (err){
    throw boomify(err);
  }
};

exports.updateGame = async (req, reply) => {
  try {
    let query = {};

    if(req.body.players.length > 0){
      query.$push = {players: req.body.players};
    }

    if('isComplete' in req.body){
      query.isComplete = req.body.isComplete;
    }

    const game = await GameModel
      .findOne({query})
			.exec();
			
    if(game.players >= config.numPlayersToStart){
      return {game: []};
    }

    const updatedGame = await GameModel
      .findByIdAndUpdate(
        req.params.id,
        query,
        { new:true },
      ).exec();

    return {game: updatedGame};
  } catch (err) {
    throw boomify(err);
  }
};

exports.getWithFilter = async (req, reply) => {
  try {
    let query = {};

    if(req.query.id){
      query._id = { _id: req.query.id};
    }

    if(req.query.createdOnStart){
      query.$gte = { createdOnStart: req.query.createdOnStart};
    }

    if(req.query.createdOnEndDate){
      query.$lte = { createdOnStart: req.query.createdOnStart};
    }

    if('isComplete' in req.query){
      query.isComplete = req.query.isComplete;
    }

    if(req.query.socketClientID){
      query.socketClientID = req.query.socketClientID;
    }

    if(req.query.name){
      query.name = req.query.name;
    }

    const games = await GameModel.find(query).limit(req.query.limit).skip(req.query.pageStart).exec();

    return {games};
  } catch (err) {
    throw boomify(err);
  }
};