require("dotenv").config();
const geckos = require("@geckos.io/server").default;
const { RtcTokenBuilder, AgoraRole } = require("./agoraTokenGen.js");

// class Board {
//   constructor() {
//     this.width = 700;
//     this.height = 500;
//     this.players = {};
//   }
// }

// class Player {
//   constructor(x, y, playerId, room) {
//     this.x = x;
//     this.y = y;
//     this.playerId = playerId;
//     this.room = room;
//     this.name = "";
//   }
// }

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

var rooms = {};

const io = geckos({ autoManageBuffering: false });

io.listen(); // default port is 9208

io.onConnection((channel) => {
  channel.onDisconnect(() => {
    const room = rooms[channel.roomId];
    delete room[channel.id];
    console.log(`${channel.id} got disconnected`);
    channel.room.emit("userDisconnect", { id: channel.id }, { reliable: true });
  });

  channel.on("joinRoom", ({ room, name = "" }) => {
    if (room) {
      if (!(room in rooms)) rooms[room] = {};
      channel.join(room);
      const newPlayer = { x: 50, y: 50, name };
      // TODO: Change to a data diff call in the future

      // Notify existing players (not current)
      channel.room.emit(
        "newPlayer",
        { id: channel.id, player: newPlayer },
        { reliable: true }
      );
      rooms[room][channel.id] = newPlayer;

      // Send all players to player
      // TODO: Change to TCP
      channel.emit(
        "setup",
        { players: rooms[room], token: genToken(channel.id) },
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
    const serverPlayerData = room[channel.id];
    serverPlayerData.x = x;
    serverPlayerData.y = y;

    // broadcast to all in same room
    channel.broadcast.emit("data", { [channel.id]: { x: x, y: y } });
  });

  channel.on("nameChange", ({ player }) => {
    const { name } = player;
    if (typeof name === "string" || name instanceof String) {
      const room = rooms[channel.roomId];
      const serverPlayerData = room[channel.id];
      serverPlayerData.name = name;

      // broadcast to all in same room
      channel.broadcast.emit("data", { [channel.id]: { name: name } });
    }
  });
});
