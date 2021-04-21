import { useState, useRef, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";

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
      className={`${muted ? "bg-gray-50 border-gray-400" : "bg-white "} 
                  rounded-full 
                border border-gray-300 text-base leading-6 
                font-medium text-gray-700 
                hover:text-gray-500 focus:outline-none focus:border-blue-300 
                focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 
                transition ease-in-out duration-150 
                absolute bottom-0 left-0 w-10 h-10`}
      onClick={() => setMuted(!muted)}
      disabled={disabled}
    >
      <div className="flex justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
          {muted && <line
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="undefined"
            id="svg_1"
            y2="19"
            x2="19"
            y1="5"
            x1="5"
            opacity="undefined"
            stroke="#ef4444"
            fill="none"
          />}
        </svg>
      </div>
    </button>
  </div>
);

function useOutsideAlerter(ref, setOpen) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const BottomMenu = ({
  onNameInput,
  // colorRef,
  throttledOnColorInput,
  gameStatusText,
  muted,
  setMuted,
  disabled,
  emoji,
  setEmoji,
}) => {
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const rref = useRef(null);
  useOutsideAlerter(rref, setEmojiMenuOpen);
  const [emojiName, setEmojiName] = useState("initialState");

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
              <div className="relative w-11" ref={rref}>
                <button
                  className="absolute bottom-0 left-0 h-10 w-10 
                  shadow-sm bg-white rounded-full
                  flex justify-center items-center"
                  onClick={(e) => {
                    setEmojiMenuOpen(!emojiMenuOpen);
                  }}
                >
                  <p className="text-xl">{emoji}</p>
                </button>
                {emojiMenuOpen && (
                  <div className="mx-auto absolute bottom-0">
                    <Picker
                      // // disableSearchBar={true}
                      // onEmojiClick={(_, em) => {
                      //   setEmojiMenuOpen(!emojiMenuOpen);
                      //   setEmoji(em.emoji);
                      // }}
                      showPreview={false}
                      style={
                        {
                          // position: "absolute",
                          // bottom: "4rem",
                          // // right: "0",
                          // height: "20rem",
                          // width: "15rem",
                          // overflow: "hidden",
                          // margin: "0px auto",
                          // float: "right"
                        }
                      }
                      onSelect={({ native, id }) => {
                        setEmojiMenuOpen(false);
                        setEmoji(native);
                        setEmojiName(id);
                      }}
                      title=""
                      emoji={emojiName}
                      // showSkinTones={tr}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* <br /> */}
                  <p
	              className={`text-xs py-2 ${
			                    gameStatusText === "audio connected" ? "font-semibold" : ""
			                  }`}
					            >
						                {gameStatusText}
								          </p>
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
