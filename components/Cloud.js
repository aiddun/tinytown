import { cloud as cloudStyle } from "./cloud.module.scss";
import { useEffect } from "react";
import React from "react";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

class Cloud extends React.Component {
  constructor(props) {
    super(props);
    const speed = 35;
    this.state = {
      speed,
      scale: getRandomArbitrary(0.4, 0.8),
      left: getRandomInt(speed),
      // Square distribution
      top: getRandomArbitrary(0, 10) * getRandomArbitrary(0, 10),
    };
  }

  render() {
    const { speed, scale, top, left } = this.state;
    return (
      <div
        className={cloudStyle}
        style={{
          animation: `animateCloud ${speed}s linear infinite`,
          transform: `scale(calc(${scale} * var(--cloud-scale-factor)))`,
          // Use % so will never go too far off page
          top: `${top}%`,
          animationDelay: `-${left}s`,
        }}
      ></div>
    );
  }
}

export default Cloud;
