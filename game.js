var Snake = (function () {

  const INITIAL_TAIL = 4;
  var fixedTail = true;
  var intervalID;
  var tileCount = 10;
  var gridSize = 400 / tileCount;
  const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };
  var velocity = { x: 0, y: 0 };
  var player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };
  var walls = false;
  var fruit = { x: 1, y: 1 };
  var trail = [];
  var tail = INITIAL_TAIL;
  var reward = 0;
  var points = 0;
  var pointsMax = 0;
  var paused = false;

  var ActionEnum = { 'none': 0, 'up': 1, 'down': 2, 'left': 3, 'right': 4 };
  Object.freeze(ActionEnum);
  var lastAction = ActionEnum.none;

  var powerUp = { x: -1, y: -1, active: false };
  var eatSound = new Audio('path/to/eat-sound.mp3');
  var wallHitSound = new Audio('path/to/wall-hit-sound.mp3');
  var moveSound = new Audio('path/to/move-sound.mp3');

  function setup() {
    canv = document.getElementById('gc');
    ctx = canv.getContext('2d');
    game.reset();
  }

  var game = {

    reset: function () {
      ctx.fillStyle = 'rgba(20,20,20,1)'; // Dark background
      ctx.fillRect(0, 0, canv.width, canv.height); // Clear background

      tail = INITIAL_TAIL;
      points = 0;
      velocity.x = 0;
      velocity.y = 0;
      player.x = INITIAL_PLAYER.x;
      player.y = INITIAL_PLAYER.y;
      reward = -1;

      lastAction = ActionEnum.none;
      trail = [];
      trail.push({ x: player.x, y: player.y });
      powerUp.active = false;
    },

    action: {
      up: function () {
        if (lastAction != ActionEnum.down) {
          velocity.x = 0;
          velocity.y = -1;
        }
      },
      down: function () {
        if (lastAction != ActionEnum.up) {
          velocity.x = 0;
          velocity.y = 1;
        }
      },
      left: function () {
        if (lastAction != ActionEnum.right) {
          velocity.x = -1;
          velocity.y = 0;
        }
      },
      right: function () {
        if (lastAction != ActionEnum.left) {
          velocity.x = 1;
          velocity.y = 0;
        }
      }
    },

    RandomFruit: function () {
      if (walls) {
        fruit.x = 1 + Math.floor(Math.random() * (tileCount - 2));
        fruit.y = 1 + Math.floor(Math.random() * (tileCount - 2));
      }
      else {
        fruit.x = Math.floor(Math.random() * tileCount);
        fruit.y = Math.floor(Math.random() * tileCount);
      }
    },

    RandomPowerUp: function () {
      powerUp.x = Math.floor(Math.random() * tileCount);
      powerUp.y = Math.floor(Math.random() * tileCount);
      powerUp.active = true;
    },

    log: function () {
      console.log('====================');
      console.log('x:' + player.x + ', y:' + player.y);
      console.log('tail:' + tail + ', trail.length:' + trail.length);
    },

    loop: function () {

      reward = -0.1;

      function DontHitWall() {
        if (player.x < 0) player.x = tileCount - 1;
        if (player.x >= tileCount) player.x = 0;
        if (player.y < 0) player.y = tileCount - 1;
        if (player.y >= tileCount) player.y = 0;
      }

      function HitWall() {
        if (player.x < 1 || player.x > tileCount - 2 || player.y < 1 || player.y > tileCount - 2) {
          wallHitSound.play();
          game.reset();
        }
      }

      var stopped = velocity.x == 0 && velocity.y == 0;

      player.x += velocity.x;
      player.y += velocity.y;

      if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
      if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
      if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
      if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;

      ctx.fillStyle = 'rgba(20,20,20,1)'; // Dark background
      ctx.fillRect(0, 0, canv.width, canv.height); // Clear background

      if (walls) HitWall();
      else DontHitWall();

      if (!stopped) {
        trail.push({ x: player.x, y: player.y });
        while (trail.length > tail) trail.shift();
      }

      if (!stopped) {
        ctx.fillStyle = 'rgba(200,200,200,0.2)';
        ctx.font = "small-caps 14px Helvetica";
        ctx.fillText("(esc) reset", 24, 356);
        ctx.fillText("(space) pause", 24, 374);
      }

      // Snake Color with Glow Effect
      ctx.shadowColor = 'rgba(0, 255, 0, 0.7)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(0, 255, 0, 1)';
      for (var i = 0; i < trail.length - 1; i++) {
        ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
        if (!stopped && trail[i].x == player.x && trail[i].y == player.y) {
          game.reset();
        }
      }
      ctx.fillRect(trail[trail.length - 1].x * gridSize + 1, trail[trail.length - 1].y * gridSize + 1, gridSize - 2, gridSize - 2);

      // Power-up
      if (powerUp.active) {
        ctx.fillStyle = 'rgba(255, 215, 0, 1)'; // Gold color
        ctx.fillRect(powerUp.x * gridSize + 1, powerUp.y * gridSize + 1, gridSize - 2, gridSize - 2);
      }

      // Fruit Collision
      if (player.x == fruit.x && player.y == fruit.y) {
        eatSound.play();
        if (!fixedTail) tail++;
        points++;
        if (points > pointsMax) pointsMax = points;
        reward = 1;
        game.RandomFruit();
        while ((function () {
          for (var i = 0; i < trail.length; i++) {
            if (trail[i].x == fruit.x && trail[i].y == fruit.y) {
              game.RandomFruit();
              return true;
            }
          }
          return false;
        })());
      }

      ctx.fillStyle = 'rgba(255, 0, 0, 1)'; // Fruit Color
      ctx.fillRect(fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 2);

      if (paused) {
        ctx.fillStyle = 'rgba(250, 250, 250, 0.7)';
        ctx.font = "bold small-caps 24px Helvetica";
        ctx.fillText("Game Paused", 120, canv.height / 2);
        ctx.fillText("Press SPACE to resume", 90, canv.height / 2 + 20);
      }

      ctx.fillStyle = 'white';
      ctx.font = "bold small-caps 16px Helvetica";
      ctx.fillText("points: " + points, 288, 40);
      ctx.fillText("top: " + pointsMax, 292, 60);
      ctx.fillText("High Score: " + localStorage.getItem('highScore') || 0, 292, 80);

      return reward;
    }
  }

  function keyPush(evt) {
    switch (evt.keyCode) {
      case 37: //left
        game.action.left();
        evt.preventDefault();
        break;

      case 38: //up
        game.action.up();
        evt.preventDefault();
        break;

      case 39: //right
        game.action.right();
        evt.preventDefault();
        break;

      case 40: //down
        game.action.down();
        evt.preventDefault();
        break;

      case 32: //space
        Snake.pause();
        evt.preventDefault();
        break;

      case 27: //esc
        game.reset();
        evt.preventDefault();
        break;
    }
  }

  return {
    start: function (fps = 15) {
      window.onload = setup;
      intervalID = setInterval(game.loop, 1000 / fps);
    },

    loop: game.loop,

    reset: game.reset,

    stop: function () {
      clearInterval(intervalID);
    },

    setup: {
      keyboard: function (state) {
        if (state) {
          document.addEventListener('keydown', keyPush);
        } else {
          document.removeEventListener('keydown', keyPush);
        }
      },
      wall: function (state) {
        walls = state;
      },
      tileCount: function (size) {
        tileCount = size;
        gridSize = 400 / tileCount;
      },
      fixedTail: function (state) {
        fixedTail = state;
      }
    },

    action: function (act) {
      switch (act) {
        case 'left':
          game.action.left();
          break;

        case 'up':
          game.action.up();
          break;

        case 'right':
          game.action.right();
          break;

        case 'down':
          game.action.down();
          break;
      }
    },

    pause: function () {
      if (paused) {
        paused = false;
        intervalID = setInterval(game.loop, 1000 / 8); // Resume game at 8 fps
      } else {
        paused = true;
        clearInterval(intervalID); // Pause game
      }
    },

    clearTopScore: function () {
      pointsMax = 0;
      localStorage.setItem('highScore', 0);
    },

    data: {
      player: player,
      fruit: fruit,
      trail: function () {
        return trail;
      }
    },

    info: {
      tileCount: tileCount
    }
  };

})();

Snake.start(8);
Snake.setup.keyboard(true);
Snake.setup.fixedTail(false); 