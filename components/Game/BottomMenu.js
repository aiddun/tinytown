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

function useOutsideAlerter(ref, setOpen) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      console.log(ref.current && !ref.current.contains(event.target));
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
                  className="absolute bottom-0 left-0 h-10 w-10 bg-blue-300 rounded-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onClick={(e) => {
                    setEmojiMenuOpen(!emojiMenuOpen);
                  }}
                >
                  <p className="pt-1 text-xl text-center">{emoji}</p>
                </button>
                {emojiMenuOpen && (
                  <div className="h-20 mx-auto absolute">
                    <Picker
                      // // disableSearchBar={true}
                      // onEmojiClick={(_, em) => {
                      //   setEmojiMenuOpen(!emojiMenuOpen);
                      //   setEmoji(em.emoji);
                      // }}
                      // showPreview={false}
                      style={{
                        position: "absolute",
                        bottom: "4rem",
                        // right: "0",
                        height: "20rem",
                        width: "15rem",
                        overflow: "hidden",
                        // margin: "0px auto",
                        // float: "right"
                      }}
                      onSelect={({ native }) => {
                        setEmojiMenuOpen(false);
                        setEmoji(native);
                      }}
                    />
                  </div>
                )}
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
