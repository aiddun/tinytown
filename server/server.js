require("dotenv").config();
const geckos = require("@geckos.io/server").default;
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

const genToken = (playerInfo) => {
  const { playerId } = playerInfo;
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

const io = geckos({ autoManageBuffering: false });

io.listen(); // default port is 9208

io.onConnection((channel) => {
  console.log(channel.webrtcConnection.toJSON());
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`);
  });

  channel.on("chat message", (data) => {
    console.log(`got ${data} from "chat message"`);
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit("chat message", data);
  });
});
