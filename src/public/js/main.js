let birds = [];
let game;
const socketIO = io();
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
      let player;
      player[e.socket] = game.add.sprite(100, 245, 'bird');
      birds.push(player);
    });

    this.jumpSound = game.add.audio('jump');
    game.stage.backgroundColor = '#71c5cf';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    let me;
    me[socketIO.id] = game.add.sprite(100, 245, 'bird');
    me[socketIO.id].scale.set(.85, .85);
    const spaceKey = game.input.keyboard.addKey(
      Phaser.Keyboard.SPACEBAR);
    this.score = 0;
  },
  update: function() {
    birds.forEach(bird => {
      if (bird.angle < 20)
        bird.angle += 1;

      if (bird.y < 0 || bird.y > 1000)
        this.restartGame();

      game.physics.arcade.overlap(
        bird, this.pipes, this.hitPipe, null, this);
    });
  },
  jump: function() {
    socketIO.emit('jump', 'e');
    if (birds[socketIO.id].alive == false)
      return;
    this.jumpSound.play();
    birds[socketIO.id].body.velocity.y = -400;
    let animation = game.add.tween(birds[socketIO.id]);
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
    if (birds[socketIO.id].alive == false)
      return;
    birds[socketIO.id].alive = false;
    game.time.events.remove(this.timer);
    this.pipes.forEach(function(p){
      p.body.velocity.x = 0;
    }, this);
  },
};

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
  const results = new RegExp('[\?&]' + name + '=([^&#]*)')
      .exec(window.location.search);

  return (results !== null) ? results[1] || 0 : false;
};

function startGame(){
  game.physics.arcade.enable(this.bird);
  this.bird.body.gravity.y = 1000;
  this.labelScore = game.add.text(20, 20, "0",
    { font: "30px Arial", fill: "#ffffff" });
  game.input.onDown.add(this.jump, this);
  this.timer = game.time.events.loop(2000, this.addRowOfPipes, this);
}




