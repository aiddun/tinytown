// import { throttleTime } from "rxjs/operators";
// import Player from "../Player/Player";
// import { Graphics } from "pixi.js";
import { Stage, useTick, useApp } from "@inlet/react-pixi";
import { Container } from "pixi.js";
import React, { useEffect, useRef, useState } from "react";
// import gameStyles from "./game.module.scss";
import { fromEvent, asyncScheduler } from "rxjs";
import { throttleTime, withLatestFrom } from "rxjs/operators";
import { Circle } from "./Circle";

const JoinTown = (props) => {
  return (
    <div className="absolute w-screen z-20">
      <div className="w-2/5 h-96 rounded-3xl bg-green-400	mx-auto pt-20"></div>
    </div>
  );
};

const GameContent = () => {
  const player = { x: 50, y: 50, color: "blue", name: "aidan_test" };
  const [players, setplayers] = useState({ player });

  // const gameRef = useRef(null);
  const app = useApp();

  // useEffect(() => {
  //   const keyDownObservable = fromEvent(app.view, "keydown");

  //   const onKeyDown2 = keyDownObservable
  //     .pipe(
  //       throttleTime(400, asyncScheduler, { leading: true, trailing: false })
  //     )
  //     .subscribe(({ key }) => {
  //       let dx = 0,
  //         dy = 0;
  //       if (key === "w") {
  //         dy = 1;
  //       } else if (key === "a") {
  //         dx = -1;
  //       } else if (key === "s") {
  //         dy = -1;
  //       } else if (key === "d") {
  //         dx = 1;
  //       }

  //       const _players = players;
  //       _players.player.x += dx;
  //       _players.player.y += dy;

  //       setplayers(_players);
  //     });

  //   return () => {
  //     [onKeyDown2].forEach((e) => e.unsubscribe());
  //   };
  // }, []);

  useTick((delta) => {
    setplayers({ player: { x: ++players.player.x + 1, y: players.player.y + 1 } });
    console.log(players)
  });

  return (
    <>
      {Object.entries(players).map(([id, player]) => {
        return (
          <Circle
            key={`${id}-${player.x}-${player.y}`}
            // image="./bunny.png"
            nextx={player.x}
            nexty={player.y}
            radius={50}
            fill={0xff0000}
            // keysdown={keysdown}
            player={player}
          />
        );
      })}
    </>
  );
  // }
};

const BrokenGame = () => {
  return (
    <Stage>
      <GameContent />
    </Stage>
  );
};

export default BrokenGame;
