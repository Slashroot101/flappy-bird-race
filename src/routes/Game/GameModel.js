const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  createdOn: {
    type: Date,
    required: true,
  },
  players: [{
    name: {
      type: String,
      required: true,
    },
    socketClientID: {
      type: String,
      required: true,
    }
  }],
  isComplete: {
    type: Boolean,
    required: true,
  },
  pipeHoles: [Number],
});

module.exports = mongoose.model('Game', gameSchema);