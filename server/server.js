const geckos = require("@geckos.io/server").default;
const http = require("http");
const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const server = http.createServer(app);
require("dotenv").config();

const { RtcTokenBuilder, AgoraRole } = require("./agoraTokenGen.js");

var GAME_HEIGHT = 750;
var GAME_WIDTH = 1000;

const genToken = (playerId) => {
  return "peepeepoopoo";
  const token = RtcTokenBuilder.buildTokenWithAccount(
    process.env.AGORA_APPID,
    process.env.AGORA_CERT,
    room_id.toString(),
    playerId,
    AgoraRole.PUBLISHER,
    Math.round(new Date().getTime() / 1000) + 24 * 60 * 60
  );

  return token;
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

var rooms = {};

const io = geckos({
  autoManageBuffering: false,
  authorization: async (auth, request) => {
    return auth in rooms;
  },
});

io.listen(); // default port is 9208

io.onConnection((channel) => {
  channel.onDisconnect(() => {
    const room = rooms[channel.roomId];
    const { players } = room;
    delete players[channel.id];

    // TODO: Add room gc

    console.log(`${channel.id} got disconnected`);
    channel.room.emit("userDisconnect", { id: channel.id }, { reliable: true });
  });

  channel.on("joinRoom", ({ room, name = "", color }) => {
    if (!color) color = getRandomInt(0xffffff);
    if (room) {
      if (!(room in rooms)) {
        channel.emit("setup", { error: true });
        return;
      }

      channel.join(room);
      const newPlayer = { x: 50, y: 50, name, color };

      // TODO: Change to a data diff call in the future
      // TODO: Change to TCP

      // Notify existing players (not current)
      // Send all players to player, including itself
      rooms[room].players[channel.id] = newPlayer;
      channel.emit(
        "setup",
        { players: rooms[room].players, token: genToken(channel.id) },
        { reliable: true }
      );

      // Broadcast to other users in room
      channel.broadcast.emit(
        "newPlayer",
        { id: channel.id, player: newPlayer },
        { reliable: true }
      );
    }
  });

  channel.on("data", (data) => {
    console.log(`got ${data} from "chat message"`);
    io.room(channel.roomId).emit("chat message", data);
  });

  channel.on("move", ({ player }) => {
    const { x, y } = player;
    const room = rooms[channel.roomId];
    const { players } = room;
    const serverPlayerData = players[channel.id];
    serverPlayerData.x = x % GAME_HEIGHT;
    serverPlayerData.y = y % GAME_WIDTH;

    // broadcast to all in same room
    channel.broadcast.emit("data", { [channel.id]: { x: x, y: y } });
  });

  channel.on("nameChange", ({ player }) => {
    const { name } = player;
    if (typeof name === "string" || name instanceof String) {
      const room = rooms[channel.roomId];
      const { players } = room;
      const serverPlayerData = players[channel.id];
      serverPlayerData.name = name;

      // broadcast to all in same room
      channel.broadcast.emit("data", { [channel.id]: { name: name } });
    }
  });

  const hexMatch = (color) => color.match(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/);

  channel.on("colorChange", ({ player }) => {
    const { color } = player;
    if (typeof color === "string" || color instanceof String) {
      if (hexMatch(color)) {
        const room = rooms[channel.roomId];
        const { players } = room;
        const serverPlayerData = players[channel.id];
        serverPlayerData.color = color;

        // broadcast to all in same room
        channel.broadcast.emit("data", { [channel.id]: { color } });
      }
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
  while ((roomId = genRandomRoomID()) in rooms);

  rooms[roomId] = { players: {}, created: new Date() };
  return roomId;
};

// express
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// apply to all requests
app.use(limiter);

app.get("/newtown", (req, res) => {
  const roomId = genRoom();
  res.send({ roomId });
});

app.get("/validtown", (req, res) => {
  const { roomId } = req.query;
  res.send({ valid: roomId in rooms });
});

server.listen(8888);
