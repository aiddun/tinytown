const stringHash = (s) => {
  return s
    .split("")
    .reduce((acc, curr, index) => acc + curr.charCodeAt(0) * index, 0);
};

//todo: move
const CSS_COLOR_NAMES = [
  "AliceBlue",
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "Azure",
  "Beige",
  "Bisque",
  "Black",
  "BlanchedAlmond",
  "Blue",
  "BlueViolet",
  "Brown",
  "BurlyWood",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "CornflowerBlue",
  "Cornsilk",
  "Crimson",
  "Cyan",
  "DarkBlue",
  "DarkCyan",
  "DarkGoldenRod",
  "DarkGray",
  "DarkGrey",
  "DarkGreen",
  "DarkKhaki",
  "DarkMagenta",
  "DarkOliveGreen",
  "DarkOrange",
  "DarkOrchid",
  "DarkRed",
  "DarkSalmon",
  "DarkSeaGreen",
  "DarkSlateBlue",
  "DarkSlateGray",
  "DarkSlateGrey",
  "DarkTurquoise",
  "DarkViolet",
  "DeepPink",
  "DeepSkyBlue",
  "DimGray",
  "DimGrey",
  "DodgerBlue",
  "FireBrick",
  "FloralWhite",
  "ForestGreen",
  "Fuchsia",
  "Gainsboro",
  "GhostWhite",
  "Gold",
  "GoldenRod",
  "Gray",
  "Grey",
  "Green",
  "GreenYellow",
  "HoneyDew",
  "HotPink",
  "IndianRed",
  "Indigo",
  "Ivory",
  "Khaki",
  "Lavender",
  "LavenderBlush",
  "LawnGreen",
  "LemonChiffon",
  "LightBlue",
  "LightCoral",
  "LightCyan",
  "LightGoldenRodYellow",
  "LightGray",
  "LightGrey",
  "LightGreen",
  "LightPink",
  "LightSalmon",
  "LightSeaGreen",
  "LightSkyBlue",
  "LightSlateGray",
  "LightSlateGrey",
  "LightSteelBlue",
  "LightYellow",
  "Lime",
  "LimeGreen",
  "Linen",
  "Magenta",
  "Maroon",
  "MediumAquaMarine",
  "MediumBlue",
  "MediumOrchid",
  "MediumPurple",
  "MediumSeaGreen",
  "MediumSlateBlue",
  "MediumSpringGreen",
  "MediumTurquoise",
  "MediumVioletRed",
  "MidnightBlue",
  "MintCream",
  "MistyRose",
  "Moccasin",
  "NavajoWhite",
  "Navy",
  "OldLace",
  "Olive",
  "OliveDrab",
  "Orange",
  "OrangeRed",
  "Orchid",
  "PaleGoldenRod",
  "PaleGreen",
  "PaleTurquoise",
  "PaleVioletRed",
  "PapayaWhip",
  "PeachPuff",
  "Peru",
  "Pink",
  "Plum",
  "PowderBlue",
  "Purple",
  "RebeccaPurple",
  "Red",
  "RosyBrown",
  "RoyalBlue",
  "SaddleBrown",
  "Salmon",
  "SandyBrown",
  "SeaGreen",
  "SeaShell",
  "Sienna",
  "Silver",
  "SkyBlue",
  "SlateBlue",
  "SlateGray",
  "SlateGrey",
  "Snow",
  "SpringGreen",
  "SteelBlue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "WhiteSmoke",
  "Yellow",
  "YellowGreen",
];

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

  getDistance() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  destroy() {}

  refresh() {}

  render() {
    this.refresh();

    const { ctx, x, y } = this;

    // outline
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.outline;
    ctx.closePath();

    // inside
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    // const hexString = `${stringHash(this.playerId) % 0xffffff}`;
    // ctx.fillStyle = "#" + (6 - hexString.length) * "0" + hexString;
    ctx.fillStyle =
      CSS_COLOR_NAMES[stringHash(this.playerId) % CSS_COLOR_NAMES.length];
    ctx.fill();
    ctx.outline;
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
    this.x = (this.x + this.vx + this.canvas.width) % this.canvas.width;
    this.y = (this.y + this.vy + this.canvas.height) % this.canvas.height;
    this.rotation += this.angularvelocity;

    this.moved = this.vx | this.vy | this.rotation;
  }
}

class Game {
  constructor(canvasId) {
    this.socket = io();
    this.player = null;
    this.players = {};
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    Object.entries(this.sockets).forEach(([name, callback]) => {
      this.socket.on(name, callback);
    });
    this.setupControls();
  }

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

  setupControls() {
    document.addEventListener("keydown", ({ key }) => {
      const v = 2;
      const actions = {
        left: () => this.player.setVX(-v),
        up: () => this.player.setVY(-v),
        right: () => this.player.setVX(v),
        down: () => this.player.setVY(v),
      };

      const keyMappings = {
        a: actions.left,
        ArrowLeft: actions.left,
        d: actions.right,
        ArrowRight: actions.right,
        w: actions.up,
        ArrowUp: actions.up,
        s: actions.down,
        ArrowDown: actions.down,
      };

      keyMappings[key] && keyMappings[key]();
    });

    document.addEventListener("keyup", ({ key }) => {
      const actions = {
        left: () => this.player.setVX(0),
        up: () => this.player.setVY(0),
        right: () => this.player.setVX(0),
        down: () => this.player.setVY(0),
      };

      const keyMappings = {
        a: actions.left,
        ArrowLeft: actions.left,
        d: actions.right,
        ArrowRight: actions.right,
        w: actions.up,
        ArrowUp: actions.up,
        s: actions.down,
        ArrowDown: actions.down,
      };
      
      const action = keyMappings[key];
      action && action();
    });

    setInterval(this.render.bind(this), 0.1);
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

  onDisconnect = (playerInfo) => {
    console.log(playerInfo);
    const { playerId } = playerInfo;
    if (!playerId) return;
    const player = this.players[playerId];
    if (player == this.player) {
      console.error("client disconnect not implemented");
    } else if (player) {
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
    playerDisconnect: this.onDisconnect,
    newPlayer: this.onNewPlayer,
    currentPlayers: this.onPlayerJoin,
  };
}

this.game = new Game("game");
game.render();
