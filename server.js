const express = require("express");
var app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server);

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
  }
}

board = new Board();

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/iindex.html");
});

// app.get("/j/:meetingid(\\d{9,11})", function (req, res) {
//   var uid = req.params.uid,
//     path = req.params[0] ? req.params[0] : "index.html";
//   res.sendFile(path, { root: "./public" });
// });

const genToken = () => {
  console.error("Not implemented");
  return "Not implemented";
};

app.get("/api/gettoken", function (req, res) {
  res.json({
    token: genToken(),
  });
});

app.post("/api/joinroom", function (req, res) {
  res.json({
    signature: null,
  });
});

var room_id = 0;

// on connect
io.on("connection", (socket) => {
  socket.join(room_id.toString());

  console.log("a user connected: ", socket.id);
  const { players } = board;

  // create a new player
  players[socket.id] = new Player(
    /* x:  */ Math.floor(Math.random() * 700) + 50,
    /* y:  */ Math.floor(Math.random() * 700) + 50,
    /* id: */ socket.id
  );

  // emit currentplayers to new user
  socket.emit("currentPlayers", players);
  // emit newplayer to everyone
  socket.to(room_id.toString()).emit("newPlayer", players[socket.id]);

  // disconnect
  socket.on("disconnect", function () {
    console.log("user disconnected");
    delete players[socket.id];
  });

  // on player movement
  socket.on("playerMovement", (movementData) => {
    const { players } = board;
    const { x, y } = movementData;
    players[socket.id].x = x;
    players[socket.id].y = y;
    socket.to(room_id.toString()).emit("playerMoved", players[socket.id]);
  });
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
