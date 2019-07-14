const GameModel = require('./GameModel');
const { boomify } = require('boom');

exports.createGame = async (req, reply) => {
  try {
    req.body.createdOn = new Date();
    const game = await new GameModel(req.body).save();
    return {game};
  } catch (err){
    throw boomify(err);
  }
};

exports.updateGame = async (req, reply) => {
  try {
    let query = {};

    if(req.body.players){
      query.$push = {players: req.body.players};
    }

    if('isComplete' in req.body){
      query.isComplete = req.body.isComplete;
    }

    const game = await GameModel
      .findByIdAndUpdate(
        req.params.id,
        query,
        { new:true },
      ).exec();

    return {game};
  } catch (err) {
    throw boomify(err);
  }
};

exports.getWithFilter = async (req, reply) => {
  try {
    let query = {};

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