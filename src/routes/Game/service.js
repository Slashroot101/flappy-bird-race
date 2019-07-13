const gameSchemaBeforeSave = {
  players: {
    type: 'array',
    description: 'Array of players that are currently enrolled in the game',
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          required: true,
        },
        socketClientID: {
          type: 'string',
          required: true,
        }
      }
    }
  }
};

const gameSchemaAfterSave = {
  ...gameSchemaBeforeSave,
  createdOn: {
    type: 'string',
    description: 'The date that the game was started on'
  },
  _id: {
    type: 'string',
    description: 'ID of the game'
  },
  __v: {
    type: 'number'
  }
};

gameSchemaAfterSave.players.items.properties._id = {
  type: 'string',
  description: 'ID of the player in the game'
};

gameSchemaAfterSave.players.items.properties.__v = {
  type: 'number'
};

exports.createGame = {
  description: 'Create a game',
  tags: ['Game'],
  summary: 'Creates a new game with the given values',
  body: gameSchemaBeforeSave,
  exposeRoute: true,
  response: {
    200: {
      description: 'Successfully created a new game',
      type: 'object',
      properties: {
        type: 'object',
        properties: gameSchemaAfterSave,
      },
    },
  },
};

exports.updateGame = {
  description: 'Updates a game with the given values',
  tags: ['Game'],
  summary: 'Updates a game with the given values with the given ID',
  params: {
    id: {
      type: 'string',
      required: true,
    }
  },
  body: {
    players: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the player',
          },
          socketClientID: {
            type: 'string',
            description: 'The ID of the client in the socket pool',
          },
        }
      }
    }
  },
};