const gameSchemaBeforeSave = {
  players: {
    type: 'array',
    description: 'Array of players that are currently enrolled in the game',
    items: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        socketClientID: {
          type: 'string'
        }
      }
    }
  },
  isComplete: {
    type: 'boolean',
    description: 'Is the game complete',
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
        game: {
          type: 'object',
          properties: gameSchemaAfterSave,
        },
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
    },
    isComplete: {
      type: 'boolean',
      description: 'Is the game complete',
    }
  },
  exposeRoute: true,
  response: {
    200: {
      description: 'Successfully updated the game',
      type: 'object',
      properties: {
        game: {
          type: 'object',
          properties: gameSchemaAfterSave,
        }
      },
    },
    404: {
      description: 'The game could not be found',
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: 'HTTP status code',
        },
        txt: {
          type: 'string',
          description: 'Status text',
        }
      }
    },
  },
};

exports.getWithFilter = {
  description: 'Get all games that match a given filter',
  tags: ['Game'],
  summary: 'Gets a game with the given filter',
  query: {
    createdOnStart: {
      type: 'string',
      description: 'The start date that you want to query for'
    },
    createdOnEndDate: {
      type: 'string',
      description: 'The end date that you want to query between',
    },
    isComplete: {
      type: 'boolean',
      description: 'Is the game complete',
    },
    socketClientID: {
      type: 'string',
      description: 'The socket ID of the client',
    },
    name: {
      type: 'string',
      description: 'The name of the player'
    },
    pageStart: {
      type: 'number',
      description: 'The number of records to skip for paging',
      default: 0,
    },
    limit: {
      type: 'number',
      description: 'The number of records to return',
      default: 100,
    },
  },
  exposeRoute: true,
  response: {
    200: {
      description: 'Successfully got games with the given filter',
      type: 'object',
      properties: {
        games: {
          type: 'array',
          items: {
            type: 'object',
            properties: gameSchemaAfterSave,
          }
        }
      },
    },
  },
};