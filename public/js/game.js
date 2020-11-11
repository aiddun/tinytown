// todo: complex inheritance for user/player
class Player {
  constructor(x, y, rotation = 0, playerId, canvas) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.playerId = playerId;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.moved = false;
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }

  setPosition(x = this.x, y = this.y) {
    this.x = x % this.canvas.width;
    this.y = y % this.canvas.height;
  }

  destroy() {}

  refresh() {}

  render() {
    this.refresh();

    const { ctx, x, y } = this;

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }
}

class User extends Player {
  constructor(x, y, rotation = 0, playerId, canvas) {
    super(x, y, rotation, playerId, canvas);
    this.vx = 0;
    this.vy = 0;
    this.angularvelocity = 0;
    this.moved = false;
  }

  setVX(vx) {
    this.vx = vx;
  }

  setVY(vy) {
    this.vy = vy;
  }

  setPosition(omega) {
    this.angularvelocity = omega;
  }

  refresh() {
    this.x += this.vx % this.canvas.width;
    this.y += this.vy % this.canvas.height;
    this.rotation += this.angularvelocity;

    this.moved = this.vx | this.vy | this.rotation;
  }
}

class Game {
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.values(this.players).forEach((p) => p.render());

    if (this.player && this.player.moved) {
      this.player.moved = false;

      this.socket.emit("playerMovement", {
        x: this.player.x,
        y: this.player.y,
        rotation: this.player.rotation,
      });
    }
  }

  // add player, including user
  // returns true if added player is the user
  addPlayer(playerInfo) {
    const { x, y, playerId } = playerInfo;
    const isUser = playerId == this.socket.id;
    const player = isUser
      ? new User(x, y, 0, playerId, this.canvas)
      : new Player(x, y, 0, playerId, this.canvas);
    this.players[playerId] = player;
    isUser && (this.player = player);
  }

  // user initial join
  onPlayerJoin = (players) => {
    Object.values(players).forEach((player) => this.addPlayer(player));
  };

  onNewPlayer = (playerInfo) => {
    this.addPlayer(playerInfo);
  };

  onDisconnect = (playerId) => {
    const player = this.players[playerId];
    if (player == this.player) {
      console.error("client disconnect not implemented");
    } else {
      delete this.players[playerId];
    }
  };

  onPlayerMoved = (playerInfo) => {
    const movedPlayer = this.players[playerInfo.playerId];

    if (movedPlayer) {
      movedPlayer.setRotation(playerInfo.rotation);
      movedPlayer.setPosition(playerInfo.x, playerInfo.y);
    }
  };

  sockets = {
    playerUpdate: this.onPlayerJoin,
    playerMoved: this.onPlayerMoved,
    disconnect: this.onDisconnect,
    newPlayer: this.onNewPlayer,
    currentPlayers: this.onPlayerJoin,
  };

  constructor(canvasId) {
    this.socket = io();
    this.players = {};
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    Object.entries(this.sockets).forEach(([name, callback]) => {
      this.socket.on(name, callback);
    });

    document.addEventListener("keydown", ({ key }) => {
      const v = 2;
      const keys = {
        ArrowLeft: () => this.player.setVX(-v),
        ArrowUp: () => this.player.setVY(-v),
        ArrowRight: () => this.player.setVX(v),
        ArrowDown: () => this.player.setVY(v),
      };
      keys[key] && keys[key]();
    });

    document.addEventListener("keyup", ({ key }) => {
      const keys = {
        ArrowLeft: () => this.player.setVX(0),
        ArrowUp: () => this.player.setVY(0),
        ArrowRight: () => this.player.setVX(0),
        ArrowDown: () => this.player.setVY(0),
      };
      const action = keys[key];
      action && action();
    });

    setInterval(this.render.bind(this), 0.1);
  }
}

this.game = new Game("game");
game.render();
