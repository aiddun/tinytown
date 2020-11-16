require("dotenv").config();
const express = require("express");
var app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server);
const { RtcTokenBuilder, AgoraRole } = require("./agoraTokenGen.js");

class Board {
  constructor() {
    this.width = 700;
    this.height = 500;
    this.players = {};
  }
}

class Player {
  constructor(x, y, playerId, room) {
    this.x = x;
    this.y = y;
    this.playerId = playerId;
    this.room = room;
    this.name = "";
  }
}

board = new Board();

app.use(express.static(__dirname + "/../public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// app.get("/j/:meetingid(\\d{9,11})", function (req, res) {
//   var uid = req.params.uid,
//     path = req.params[0] ? req.params[0] : "index.html";
//   res.sendFile(path, { root: "./public" });
// });
var room_id = 0;
var users = 0;

const stringHash = (s) => {
  return s
    .split("")
    .reduce((acc, curr, index) => acc + curr.charCodeAt(0) * (31 ** index), 0) % 2**64;
};

const genToken = (playerInfo) => {
  const { playerId } = playerInfo;
  // console.log([    process.env.AGORA_APPID,
  //   process.env.AGORA_CERT,
  //   room_id.toString(),
  //   stringHash(playerId),
  //   AgoraRole.PUBLISHER,
  //   new Date().getUTCSeconds() + 24 * 60 * 60])
  const token = RtcTokenBuilder.buildTokenWithAccount(
    process.env.AGORA_APPID,
    process.env.AGORA_CERT,
    room_id.toString(),
    playerId,
    AgoraRole.PUBLISHER,
    Math.round(new Date().getTime() / 1000) + 24 * 60 * 60
  );
  // console.log(token);

  return token;
};

// on connect
io.on("connection", (socket) => {
  // Circuit breaker
  if (++users > 30) process.exit();

  socket.join(room_id.toString());

  console.log("a user connected: ", socket.id);
  const { players } = board;

  // create a new player
  const newPlayer = new Player(
    /* x:  */ Math.floor(Math.random() * 700) + 50,
    /* y:  */ Math.floor(Math.random() * 700) + 50,
    /* id: */ socket.id
  );
  players[socket.id] = newPlayer;

  // emit stuff to new user
  socket.emit("onJoin", {
    players,
    token: genToken(newPlayer),
    channel: room_id.toString(),
  });

  // emit newplayer to everyone
  socket.to(room_id.toString()).emit("newPlayer", players[socket.id]);

  // disconnect
  socket.on("disconnect", function () {
    console.log("user disconnected");
    socket.to(room_id.toString()).emit("playerDisconnect", players[socket.id]);
    delete players[socket.id];
    --users;
  });

  // on player movement
  socket.on("playerMovement", (movementData) => {
    const { players } = board;
    const { x, y } = movementData;
    players[socket.id].x = x;
    players[socket.id].y = y;
    socket.to(room_id.toString()).emit("playerMoved", players[socket.id]);
  });

  socket.on("setPlayerName", (req) => {
    if (!req) return;
    const { name } = req;
    const player = players[socket.id];
    if (!player || !name) return;
    player.name = name;

    socket.to(room_id.toString()).emit("playerNameChanged", players[socket.id]);
  });

  socket.on("say", (req) => {
    if (!req) return;
    const { msg } = req;
    if (!msg) return;

    socket.to(room_id.toString()).emit("messageSaid", { msg: msg });
  });
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
