import { useState } from "react";
import ReactTooltip from "react-tooltip";

const HelpButton = () => {
  const [hover, sethover] = useState(false);
  return (
    <>
      <div
        className="rounded-full w-7 h-7 text-center  mb-3 mr-2 cursor-pointer 
         border border-gray-300 text-base leading-6 font-medium  text-gray-700
          bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 
          focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition 
          ease-in-out duration-150"
        data-tip
        data-for="controls"
      >
        ?
      </div>
      <ReactTooltip
        effect="solid"
        id="controls"
        backgroundColor="white"
        className="shadow rounded-lg"
        textColor="black"
        react-tooltip
      >
        <p className="font-semibold">Welcome to Tiny Town!</p>
        <p>
          Move around with positional audio. <br /> Use the WASD or arrow keys,
          <br /> or double click to move to a location. <br /> Click on a player
          to mute their mic.
        </p>
      </ReactTooltip>
    </>
  );
};

const MuteButton = ({ muted, setMuted, disabled }) => (
  <div className="relative w-10 left-0">
    <button
      className="bg-white rounded-full 
                border border-gray-300 text-base leading-6 
                font-medium text-gray-700 
                hover:text-gray-500 focus:outline-none focus:border-blue-300 
                focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 
                transition ease-in-out duration-150 
                absolute bottom-0 left-0 w-10 h-10"
      onClick={() => setMuted(!muted)}
      disabled={disabled}
    >
      <img
        src="/img/mute.svg"
        className=" h-3/5 w-3/5 mx-auto"
        style={{ filter: muted ? "invert(.7)" : "invert(.3)" }}
      />
    </button>
  </div>
);

const BottomMenu = ({
  onNameInput,
  colorRef,
  throttledOnColorInput,
  gameStatusText,
  muted,
  setMuted,
  disabled,
}) => {
  return (
    <div className="rounded-xl mx-auto bg-gray-100 h-28 my-5 w-full shadow-sm">
      <div className="flex justify-between">
        <div className="w-10"></div>
        <div className="text-center py-2">
          <div
            className="mx-auto"
            style={{
              width: "max-content",
            }}
          >
            <div className="inline-flex">
              <MuteButton {...{ muted, setMuted, disabled }} />
              <div className="mt-1 mx-2 rounded-md shadow-sm w-48">
                <p className="text-left text-sm font-medium leading-5 text-gray-700 select-none pl-1">
                  name
                </p>
                <input
                  type="text"
                  autoComplete="chrome-off" // placeholder="Your name"
                  onInput={onNameInput}
                  className="form-input w-full rounded-md text-xl sm:leading-5 p-2 h-10"
                  disabled={disabled}
                />
              </div>
              <div className="relative w-11">
                <input
                  style={{
                    // height: "inherit",
                    clipPath: "circle(38%)",
                    cursor: "pointer",
                  }}
                  ref={colorRef}
                  type="color" // value={this.state.colorInput}
                  onChange={throttledOnColorInput}
                  title="Change color"
                  className="h-11 w-11 absolute bottom-0 left-0"
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
          {/* <br /> */}
          <p className="text-xs py-2">{gameStatusText}</p>
        </div>
        {/* Float to bottom of bar */}
        {/* Help button */}
        <div className="pt-2">
          <HelpButton />
        </div>
      </div>
    </div>
  );
};

export default BottomMenu;
