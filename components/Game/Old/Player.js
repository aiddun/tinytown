import React from "react";


const PLAYER_RADIUS = 1;

class Entity {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
  }
}

const Player = (props) => {
  const { player } = props;
  const { game, x, y, color, name } = player;

  const sideLength = `${PLAYER_RADIUS * 2}rem`;

  const xPadding = x - PLAYER_RADIUS;
  const yPadding = y - PLAYER_RADIUS;

  return (
    <div
      style={{
        paddingTop: `${y - PLAYER_RADIUS}rem`,
        paddingLeft: `${x - PLAYER_RADIUS}rem`,
        // transition: `padding .1s steps(10)`,
      }}
    >
      <div
        style={{
          height: sideLength,
          width: sideLength,
          backgroundColor: color,
          borderRadius: "50%",
        }}
      ></div>
    </div>
  );
};

export default Player;
