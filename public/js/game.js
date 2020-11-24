// Can be public
// We generate token serverside
var AGORA_APPID = "c2fc730c17d0471188e63e675f7e268d";
var TICK_HZ = 10;
var IDLE_MINUTES = 10;
var SAMPLE_RATE = 48e3;
var NUM_CHANNELS = 2;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var AUDIO_BUF_SIZE = 1024;

// TODO: Replace with something better
const stringHash = (s) => {
  return (
    s
      .split("")
      .reduce((acc, curr, index) => acc + curr.charCodeAt(0) * 31 ** index, 0) %
    2 ** 64
  );
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

class PositionalAudioWorker {
  // Process audio in real time using a double buffered approach
  // (process buffer_{n} of PCM data while simultaniusly playing buffer_{n-1}, then repeat for buffer_{n+1})

  // Parent must implement getVols() -> [number] | number[]
  constructor(parent) {
    this.parent = parent;
    // We don't need to store the incoming channel as we recieve it's frames upon every call of onNewFrames
    this.currentTrack = null;
    // Only keep most recent so we don't lag behind if audio frame processing  time gets slower (which it shouldn't)
    // in comparison to using something like a bounded buffer
    this.nextBuf = null;

    // Start playing 0'd out sound until we start to recieve audio
    this.nextBuffer();
  }

  onNewFrames = async (buffer) => {
    const newBuffer = audioCtx.createBuffer(2, AUDIO_BUF_SIZE, SAMPLE_RATE);

    let vols = this.parent.getVols();
    // If only one volume passed, apply to all channels
    vols = vols.length === 1 ? new Array(NUM_CHANNELS).fill(vols[0]) : vols;

    for (let channel = 0; channel < NUM_CHANNELS; ++channel) {
      // Float32Array with PCM data
      const newChannelData = buffer.getChannelData(channel);
      const vol = vols[channel];

      // Perform DSP here on PCM array
      for (var i = 0; i < AUDIO_BUF_SIZE; i++) {
        newChannelData[i] *= vol;
      }

      // Copy to new buffer
      newBuffer.copyToChannel(newChannelData, channel);
    }

    this.nextBuf = newBuffer;
  };

  nextBuffer = async () => {
    // WebAudio doesn't allow us to reassign buffers to nodes (even if it's not currently playing)
    // so we need to allocate a new node every time (very fast, intended way to do this?)
    const currentTrack = audioCtx.createBufferSource();
    // Reassign callback
    currentTrack.onended = this.nextBuffer.bind(this);

    // If processed audio doesn't exist (at start), play nothing
    let newBuf =
      this.nextBuf || audioCtx.createBuffer(2, AUDIO_BUF_SIZE, SAMPLE_RATE);
    // Assign buffer to be played
    currentTrack.buffer = newBuf;

    this.currentTrack = currentTrack;

    // Connect to browser-exposed output (destination)
    this.currentTrack.connect(audioCtx.destination);
    this.currentTrack.start(0, 0);
  };
}

class Player {
  constructor(x, y, rotation = 0, name = "", playerId, canvas) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.playerId = playerId;
    // We need this because agora user ids can only be ints
    this.idHash = stringHash(playerId);
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.moved = false;
    this.name = name || "";
    this.posAudioWorker = new PositionalAudioWorker(this);
    this.vols = [];
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }

  setPosition(x = this.x, y = this.y) {
    this.x = x % this.canvas.width;
    this.y = y % this.canvas.height;
  }

  getDistance(user) {
    return Math.sqrt((user.x - this.x) ** 2 + (user.y - this.y) ** 2);
  }

  // Angle of player from user east of north/east of south depending on if other player is above or below, respectively
  // Returns in radians
  getAngle(user) {
    const dx = user.x - this.x;
    const dy = user.y - this.y;
    return Math.atan(dx / Math.abs(dy));
  }

  destroy() {}

  refresh() {}

  updateAudio(user) {
    let dist = this.getDistance(user);

    const angle = this.getAngle(user);
    // scaledAngle \in [-1, 1]
    const scaledAngle = angle / (Math.PI / 2);

    // Hand crafted dropoff fn inspired by inverse square law
    const scaleVol = (v) => 1e4 / Math.pow(v + 1e2, 2);
    // Sigmoid on [0, 1]
    const customSigmoid = (x) => 1 / (1 + Math.E ** (-10 * (x - 0.5)));

    // [left, right]
    let vol = scaleVol(dist);
    vol = Math.sqrt(vol);
    this.vols = [
      vol + (scaledAngle < 0 ? Math.sqrt(vol) * 0.5 * -scaledAngle : 0),
      vol + (scaledAngle > 0 ? Math.sqrt(vol) * 0.5 * scaledAngle : 0),
    ];
    console.log(this.vols);
  }

  getVols() {
    return this.vols;
  }

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
    const color =
      CSS_COLOR_NAMES[stringHash(this.playerId) % CSS_COLOR_NAMES.length];
    ctx.fillStyle = color;

    ctx.fill();
    ctx.outline;
    ctx.closePath();

    // text
    // ctx.font = '15px Sans-serif';
    // // outline
    // ctx.strokeStyle = "gray";
    // ctx.lineWidth = 3;
    // ctx.strokeText(this.name, x, y - 20);
    // inside
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(this.name, x, y - 15);
  }
}

class User extends Player {
  constructor(x, y, rotation = 0, name = "", playerId, canvas) {
    super(x, y, rotation, name, playerId, canvas);
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

  updateAudio() {}

  refresh() {
    this.x = (this.x + this.vx + this.canvas.width) % this.canvas.width;
    this.y = (this.y + this.vy + this.canvas.height) % this.canvas.height;
    this.rotation += this.angularvelocity;

    this.moved = this.vx | this.vy | this.rotation;
  }
}

class Game {
  constructor(canvasId) {
    this.player = null;
    this.players = {};
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.socket = io();
    Object.entries(this.sockets).forEach(([name, callback]) => {
      this.socket.on(name, callback);
    });

    this.setupControls(this.canvas);
    this.setupNameInput();

    // Every 15 minutes check to see if this has been set. If not, disconnect.
    this.timeoutTimer = null;
    this.movedInInterval = false;
    this.setupTimeoutTimer();
  }

  render() {
    // Render asyncronously
    (async () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      Object.values(this.players).forEach((p) => {
        p.render();
        p.updateAudio(this.player);
      });
    })();

    if (this.player && this.player.moved) {
      this.player.moved = false;

      // For some reason this is the fastest way to assign binary values in JS (at least v8). Microbenchmarked it.
      this.movedInInterval = !0;

      this.socket.emit("playerMovement", {
        x: this.player.x,
        y: this.player.y,
        rotation: this.player.rotation,
      });
    }
  }

  setupControls(canvas) {
    canvas.addEventListener("keydown", (event) => {
      const { key } = event;

      const v = 1;
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

      const action = keyMappings[key];
      if (action) {
        action();
        event.preventDefault();
      }
    });

    canvas.addEventListener("keyup", (event) => {
      const { key } = event;

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
      if (action) {
        action();
        event.preventDefault();
      }
    });

    setInterval(this.render.bind(this), 1 / TICK_HZ);
  }

  setupNameInput = () => {
    const nameInput = document.getElementById("nameInput");
    nameInput.addEventListener("input", (event) => {
      const newName = event.target.value;
      this.player.name = newName;

      // Server handles identity via socketId
      this.socket.emit("setPlayerName", {
        name: newName,
      });
    });
  };

  async setupAudio(channel, token) {
    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
    const appid = AGORA_APPID;
    const uid = await this.client.join(
      appid,
      channel,
      token,
      this.player.playerId
    );

    this.client.on("user-published", async (user, mediaType) => {
      // Subscribe to a remote user.
      await this.client.subscribe(user, mediaType);
      console.log("subscribe success");

      // If the subscribed track is audio.
      if (mediaType === "audio") {
        // Get `RemoteAudioTrack` in the `user` object.
        const remoteAudioTrack = user.audioTrack;

        // Play the audio track. No need to pass any DOM element.
        // remoteAudioTrack.play();

        const { uid } = user;
        const trackowner = this.players[uid];
        trackowner.audioTrack = remoteAudioTrack;

        remoteAudioTrack.setAudioFrameCallback(
          trackowner.posAudioWorker.onNewFrames.bind(trackowner.posAudioWorker),
          AUDIO_BUF_SIZE
        );
      } else {
        console.error("error: unsupported media track");
      }
    });

    // Create an audio track from the audio sampled by a microphone
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Publish the local audio to the channel.
    await this.client.publish([this.localAudioTrack]);

    console.log("audio publish success!");
    const audioStatus = document.getElementById("audiostatus");
    audioStatus.innerHTML = "audio connected";

    this.client.on("user-unpublished", (user) => {});
  }

  async stopAudio() {
    // Stop mic
    this.localAudioTrack.close();
    // Leave the channel.
    await this.client.leave();

    const audioStatus = document.getElementById("audiostatus");
    audioStatus.innerHTML = "audio disconnected";
  }

  // add player, including user
  // returns true if added player is the user
  addPlayer(playerInfo) {
    const { x, y, playerId, name } = playerInfo;
    const isUser = playerId == this.socket.id;
    const player = isUser
      ? new User(x, y, 0, name, playerId, this.canvas)
      : new Player(x, y, 0, name, playerId, this.canvas);
    this.players[playerId] = player;
    isUser && (this.player = player);
  }

  // user initial join
  onPlayerJoin = ({ players, token, channel }) => {
    Object.values(players).forEach((player) => this.addPlayer(player));

    this.setupAudio(channel, token);
    // Auto timeout after 15 mins
    // TODO: Replace with system by activity/client focus/movement
  };

  onNewPlayer = (playerInfo) => {
    this.addPlayer(playerInfo);
  };

  onOtherPlayerDisconnect = (playerInfo) => {
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

  onPlayerNameChanged = (playerInfo) => {
    const { name } = playerInfo;
    const player = this.players[playerInfo.playerId];

    if (player) {
      player.name = name;
    }
  };

  disconnect = () => {
    this.stopTimeoutTimer();
    this.stopAudio();
    this.socket.disconnect();

    // Hide canvas and show disconnected text
    document.getElementById("game").style.display = "none";
    document.getElementById("disconnected-text").innerHTML =
      "Disconnected due to inactivity. Please refresh the page to continue.";

    // // Allow for dom to update
    // setTimeout(() => {
    //   alert("Disconnected due to inactivity. Please refresh to continue.");
    // }, 200);
  };

  setupTimeoutTimer = () => {
    this.timeoutTimer = setInterval(() => {
      if (this.movedInInterval == false) {
        this.disconnect();
      } else {
        this.movedInInterval = false;
      }
    }, IDLE_MINUTES * 60 * 1000);
  };

  stopTimeoutTimer = () => {
    if (this.timeoutTimer) clearInterval(this.timeoutTimer);
  };

  sockets = {
    playerMoved: this.onPlayerMoved,
    playerDisconnect: this.onOtherPlayerDisconnect,
    newPlayer: this.onNewPlayer,
    onJoin: this.onPlayerJoin,
    playerNameChanged: this.onPlayerNameChanged,
    messageSaid: this.onMessageSaid,
  };
}

this.game = new Game("game");
game.render();
