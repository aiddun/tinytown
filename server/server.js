// const geckos = require("@geckos.io/server").default;
const http = require("http");
const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const server = http.createServer();

require("dotenv").config();

const io = require("socket.io")(server, {
  wsEngine: "eiows",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const { RtcTokenBuilder, AgoraRole } = require("./agoraTokenGen.js");

var GAME_HEIGHT = 750;
var GAME_WIDTH = 1000;

const genToken = (playerId, roomId) => {
  const token = RtcTokenBuilder.buildTokenWithAccount(
    process.env.AGORA_APPID,
    process.env.AGORA_CERT,
    roomId,
    playerId,
    AgoraRole.PUBLISHER,
    Math.round(new Date().getTime() / 1000) + 4 * 60 * 60
  );

  return token;
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var rooms = {};

io.on("connection", (socket) => {
  socket.on("disconnecting", () => {
    const roomId = Array.from(socket.rooms)[1];
    const room = rooms[roomId];
    if (room) {
      const { players } = room;
      delete players[socket.id];

      room.buffer[socket.id] = {
        disconnected: true,
        ...room.buffer[socket.id],
      };
    }
  });

  socket.on("joinRoom", ({ room: roomId, name = "", emoji }) => {
    if (roomId) {
      if (!(roomId in rooms)) {
        socket.emit("setup", { error: true });
        return;
      }

      socket.join(roomId);

      const newPlayer = {
        x: 50 + getRandomInt(50),
        y: 50 + getRandomInt(50),
        name,
        emoji: emoji || "👀",
      };

      const room = rooms[roomId];
      room.players[socket.id] = newPlayer;
      socket.emit("setup", {
        players: room.players,
        token: genToken(socket.id, roomId),
      });

      room.buffer[socket.id] = { ...newPlayer, ...room.buffer[socket.id] };
    }
  });

  socket.on("move", ({ player }) => {
    const { x, y } = player;
    const room = rooms[Array.from(socket.rooms)[1]];
    const { players } = room;
    const serverPlayerData = players[socket.id];
    serverPlayerData.x = x % GAME_HEIGHT;
    serverPlayerData.y = y % GAME_WIDTH;

    // broadcast to all in same room
    room.buffer[socket.id] = { ...room.buffer[socket.id], x, y };
  });

  socket.on("nameChange", ({ player }) => {
    const { name } = player;
    if (typeof name === "string" || name instanceof String) {
      const room = rooms[Array.from(socket.rooms)[1]];
      const { players } = room;
      const serverPlayerData = players[socket.id];
      serverPlayerData.name = name;

      room.buffer[socket.id] = { ...room.buffer[socket.id], name };
    }
  });

  const hexMatch = (color) => color.match(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/);

  socket.on("emojiChange", ({ player }) => {
    const { emoji } = player;
    if (typeof emoji === "string" || emoji instanceof String) {
      const room = rooms[Array.from(socket.rooms)[1]];
      const { players } = room;
      const serverPlayerData = players[socket.id];
      serverPlayerData.emoji = emoji;
      room.buffer[socket.id] = { ...room.buffer[socket.id], emoji };
    }
  });

  socket.on("backgroundChange", ({ background }) => {
    if (typeof background === "string" || background instanceof String) {
      const room = rooms[Array.from(socket.rooms)[1]];
      room.background = background;
      room.buffer[socket.id] = { ...room.buffer[socket.id], background };
    }
  });
});

const getRandomLetter = () => {
  return String.fromCharCode(65 + getRandomInt(26));
};

const genRandomRoomID = () =>
  `${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}`;

const genRoom = () => {
  let roomId;
  // no duplicates
  let counter = 0;
  while ((roomId = genRandomRoomID()) in rooms && counter++ < 10);
  if (counter >= 10) {
    while ((roomId = genRandomRoomID() + genRandomRoomID()) in rooms);
  }

  rooms[roomId] = { players: {}, created: new Date(), buffer: {} };
  return roomId;
};

// express
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// apply to all requests
app.use("/validtown", limiter);

app.get("/newtown", (req, res) => {
  const roomId = genRoom();
  res.send({ roomId });
});

app.get("/validtown", (req, res) => {
  const { roomId } = req.query;
  res.send({ valid: roomId in rooms });
});

server.listen(4040, () => {
  console.log("socket listening on 4040");
});

app.listen(8888, () => {
  console.log("express listening on *:8888");
});

// todo:
setInterval(() => {
  Object.entries(rooms).forEach(([id, { buffer }]) => {
    io.to(id).emit("data", buffer);
    rooms[id].buffer = {};
  });
}, 200);
