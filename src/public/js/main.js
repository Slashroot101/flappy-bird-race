let mainState = {
  preload: function () {
    game.load.image('bird', '/img/bird.png');
    game.cache.addImage('pipe', '/img/pipe.png', game.load.image('pipe', '/img/pipe.png'));
    this.pipes = game.add.group();
    game.cache.addSound('jump', '/sound/jump.wav', game.load.audio('jump', '/sound/jump.wav'));
  },
  create: function () {
    const boundStartGame = startGame.bind(this);
    socketIO.on('clientGameStart', boundStartGame);
    socketIO.on('clientGameJoin', (e) => {
      if(e.percentToFull >= 1){
        boundStartGame();
      }
      if(e.socket === socketIO.id){ return; };
      this.bird = game.add.sprite(100, 245, 'bird');
    });

    this.jumpSound = game.add.audio('jump');
    game.stage.backgroundColor = '#71c5cf';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bird = game.add.sprite(100, 245, 'bird');
    this.bird.scale.set(.85, .85);
    let spaceKey = game.input.keyboard.addKey(
      Phaser.Keyboard.SPACEBAR);
    this.score = 0;
  },
  update: function() {
    if (this.bird.angle < 20)
      this.bird.angle += 1;
    // if (this.bird.y < 0 || this.bird.y > window.innerHeight *  window.devicePixelRatio)
    //   this.restartGame();
    // game.physics.arcade.overlap(
    //   this.bird, this.pipes, this.hitPipe, null, this);
  },
  jump: function() {
    socketIO.emit('jump', 'e')
    if (this.bird.alive == false)
      return;
    this.jumpSound.play();
    this.bird.body.velocity.y = -400;
    let animation = game.add.tween(this.bird);
    animation.to({angle: -20}, 100);
    animation.start();
  },
  restartGame: function() {
    lastHolePosition = undefined;
    game.state.start('main');
  },
  addOnePipe: function(x, y){
    const pipe = game.add.sprite(x,y, 'pipe');
    pipe.scale.setTo(window.devicePixelRatio, window.devicePixelRatio );
    this.pipes.add(pipe);
    game.physics.arcade.enable(pipe);
    pipe.body.velocity.x = -200;
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },
  addRowOfPipes: function() {
    let hole = Math.floor(Math.random() * 15 + 1);
    for (let i = 0; i < 16; i++) {
      if (i !== hole && i !== hole + 1)
        this.addOnePipe(400, i * 60 + 10);
    }
    this.score += 1;
    this.labelScore.text = this.score;
  },
  hitPipe: function() {
    if (this.bird.alive == false)
      return;
    this.bird.alive = false;
    game.time.events.remove(this.timer);
    this.pipes.forEach(function(p){
      p.body.velocity.x = 0;
    }, this);
  },
};
let game;
const socketIO = io();
socketIO.on('connect', (physicalSocketConnection) => {
  socketIO.emit('join', {game: location.pathname.split('/')[1]});
  if($('canvas').length || $.urlParam('isLoadedOnce') !== false){
    window.location.href='/';
  }
  game = new Phaser.Game(1000,1000, Phaser.CANVAS);
  socketIO.emit('clientGameJoin', {gameID: location.pathname.split('/')[1], name: $.urlParam('name')});
  game.state.add('main', mainState);
  game.state.start('main');
});

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)')
      .exec(window.location.search);

  return (results !== null) ? results[1] || 0 : false;
}

function startGame(){
  game.physics.arcade.enable(this.bird);
  this.bird.body.gravity.y = 1000;
  this.labelScore = game.add.text(20, 20, "0",
    { font: "30px Arial", fill: "#ffffff" });
  game.input.onDown.add(this.jump, this);
  this.timer = game.time.events.loop(2000, this.addRowOfPipes, this);
}




