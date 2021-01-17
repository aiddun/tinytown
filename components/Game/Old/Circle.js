import * as PIXI from "pixi.js";
import { PixiComponent, useTick } from "@inlet/react-pixi";
import React, { useState, useEffect } from "react";

const PixiCircle = PixiComponent("Circle", {
  create: () => new PIXI.Graphics(),
  applyProps: (g, _, props) => {
    const { fill, x, y, radius } = props;

    g.clear();
    g.beginFill(fill);
    g.drawCircle(x, y, radius);
    g.endFill();
  },
});

export const Circle = ({ nextx, nexty, radius, fill, keysdown }) => {
  //   useTick(() => {
  //     console.log("foo");
  //   });

  const [[x, y], setcoords] = useState([null, null]);

  console.log(x);

  useTick((delta) => {
    if (!x || !y) {
      setcoords([x || nextx, y || nexty]);
      return;
    }

    // TODO: scale v accordingly
    const v = 1;
    const deltav = delta * v;

    if (Math.abs(nextx - x) > 0.01 || Math.abs(nexty - y) > 0.01) {
      setcoords([
        x + deltav * Math.sign(nextx - x),
        y + deltav * Math.sign(nexty - y),
      ]);
    }

    // // if (Math.abs(nextx - x) > 0.01 || Math.abs(nexty - y) > 0.01) {
    // setcoords([
    //   x + (keysdown.right ? deltav : 0) - (keysdown.left ? deltav : 0),
    //   y + (keysdown.down ? deltav : 0) - (keysdown.up ? deltav : 0),
    // ]);
    // // }

    // this.state
  });

  return <PixiCircle x={x} y={y} radius={radius} fill={fill} />;
};
