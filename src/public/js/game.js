const socket = io();
const gameID = location.pathname.split('/')[1];
const gameWidth = 1000;
const gameHeight = 1000;
const gameInstance = new Phaser.Game(window.innerWidth * window.devicePixelRatio / 4, window.innerHeight * window.devicePixelRatio / 2, Phaser.CANVAS);
let pipeHoles;
let birds = {};
let players;

socket.on('connect', (e) => {
  //join the socket lobby
  socket.emit('join', {game: gameID});


  //pull predetermined pipe opening locations down for consistency across clients
  $.get(`/api/game?id=${gameID}`, (data) => {
    if(data.games.length === 0){ window.location.href = '/'}
    pipeHoles = data.games[0].pipeHoles;
    players = data.games[0].players;

    //emit to other clients that you are joining the game
    socket.emit('clientGameJoin', {gameID, name: $.urlParam('name')});
    gameInstance.state.add('main', gameState);
    gameInstance.state.start('main');
  });
});

const gameState = {
  preload: function() {
    //add and cache game assets -- improves performance by a good bit
    gameInstance.cache.addImage('bird', '/img/bird.png', gameInstance.load.image('bird', '/img/bird.png'));
    gameInstance.cache.addImage('pipe', '/img/pipe.png', gameInstance.load.image('pipe', '/img/pipe.png'));
    gameInstance.cache.addSound('jump','/sound/jump.wav', gameInstance.load.audio('jump', '/sound/jump.wav'));

    //add pipe group so the server can tell us where the pipes need to go
    this.pipes = gameInstance.add.group();
  },
  create: function(){
    //establish game properties -- bind is a fancy way of handing the 'this' context to a callback function
    const boundStartGame = startGame.bind(this);
    gameInstance.stage.backgroundColor = '#71c5cf';
    gameInstance.physics.startSystem(Phaser.Physics.ARCADE);
    this.jumpSound = gameInstance.add.audio('jump');
    this.score = 0;
    this.labelScore = gameInstance.add.text(20, 20, "0",
      { font: "30px Arial", fill: "#ffffff" });
    birds[socket.id] = gameInstance.add.sprite(100, 245, 'bird');
    players.forEach((bird) => {
      birds[bird.socketClientID] = gameInstance.add.sprite(100, 245, 'bird');
    });
    //throw myself into array for later purposes
    players.push({
      name: $.urlParam('name'),
      socketClientID: socket.id,
    });

    socket.on('clientGameJoin', (e) => {
      if(e.socket === socket.id){ return; };
      birds[e.socket] = gameInstance.add.sprite(100, 245, 'bird');
      if(e.percentToFull >= 1){
        boundStartGame();
      }
    });

    socket.on('clientGameLeave', (e) => {
      window.location.href = '/';
    });

    socket.on('playerDead', (e) => {
      if(e.player === socket.id){
        return;
      }

      delete birds[e.player];
      if(Object.keys(birds).length < 2){
        this.showWinner(Object.keys(birds)[0]);
      }
    });

    socket.on('jump', (e) => {
      if(e.player === socket.id){ return; };
      this.jump(e.player);
    });

    socket.on('clientGameStart', boundStartGame);
  },
  showWinner: function(winner){
      $.ajax({
        url: `/api/game/${gameID}`,
        contentType: 'application/json',
        data: JSON.stringify({isComplete: true}),
        success: (e) => {
          this.winnerText = gameInstance.add.text( 100, 100, "0",
              { font: "50px Arial", fill: "#ffffff" });
          this.winnerText.text = `${players.filter(e => e.socketClientID === winner)[0].name} wins!`;
          setTimeout(() => {
            window.location.href = '/';
          }, 5000);
        }
      });
  },
  update: function(){
    for(let bird in birds){
      if (birds[bird].angle < 20)
        birds[bird].angle += 1;
    }

    if(birds[socket.id] === undefined){
      return;
    }

    if (birds[socket.id].y < 0 || birds[socket.id].y > 1000) {
      this.hitPipe();
    }

    gameInstance.physics.arcade.overlap(
      birds[socket.id], this.pipes, this.hitPipe, null, this);
  },
  addRowOfPipes: function() {
    const hole = pipeHoles[this.score % 150];
    for (let i = 0; i < 16; i++) {
      if (i !== hole && i !== hole + 1)
        this.addOnePipe(400, i * 60 + 10);
    }
    this.score += 1;
    this.labelScore.text = this.score;
  },
  addOnePipe: function(x, y) {
    const pipe = gameInstance.add.sprite(x,y, 'pipe');
    pipe.scale.setTo(window.devicePixelRatio / 3, window.devicePixelRatio / 3);
    this.pipes.add(pipe);
    gameInstance.physics.arcade.enable(pipe);
    pipe.body.velocity.x = -200;
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },
  jump: function (socketID) {
    const actualPlayer = typeof socketID === 'string' ? socketID : socket.id;
    this.jumpSound.play();
    birds[actualPlayer].body.velocity.y = -400;
    const animation = gameInstance.add.tween(birds[actualPlayer]);
    animation.to({angle: -20}, 100);
    animation.start();

    //if it is me jumping, tell the other clients
    if(typeof socketID !== 'string' || socketID === socket.id){
      socket.emit('jump', {
        player: socket.id,
        gameID,
      });
    }
  },
  hitPipe: function() {
    this.endGame();
    if(birds[socket.id] === undefined || birds[socket.id].alive == false)
      return;
    if(Object.keys(birds).length < 2){
      this.showWinner(Object.keys(birds)[0]);
    }
    socket.emit('playerDead', {player: socket.id, gameID});
    delete birds[socket.id];

  },
  endGame: function() {
    gameInstance.input.onDown.removeAll();
    gameInstance.time.events.removeAll();
    this.pipes.forEach(function(p){
      p.body.velocity.x = 0;
    });
  },
};

function startGame(){
  for(bird in birds){
    gameInstance.physics.arcade.enable(birds[bird]);
    birds[bird].body.gravity.y = 1000;
  }

  this.timer = gameInstance.time.events.loop(2000, this.addRowOfPipes, this);
  gameInstance.input.onDown.add(this.jump, this);
};

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)')
    .exec(window.location.search);

  return (results !== null) ? results[1] || 0 : false;
}
