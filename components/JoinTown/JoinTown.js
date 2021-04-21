import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { AwesomeButton } from "react-awesome-button";
import Cloud from "../Cloud";

const CreateRoomButton = ({ setloggedin, setTravelSuccess }) => {
  const router = useRouter();

  return (
    <AwesomeButton
      type="primary"
      className="w-full h-full rounded-3xl mx-auto 
            text-center 
            transition duration-300 ease-in-out 
            focus:outline-none "
      style={{
        // "margin-left": "0.25rem !important",
        "--button-default-width": "100%",
        "--button-default-height": "100%",
        "--button-default-border-radius": "1.5rem",
        "--button-raise-level": "4px",
        "--button-primary-color": "rgba(249, 250, 251)",
        "--button-primary-color-dark": "#b9b500",
        "--button-primary-color-light": "#6c6a00",
        "--button-primary-color-hover": "#fffb3e",
        "--button-primary-color-active": "#fffb3e",
        "--button-primary-border": "none",
      }}
      onPress={() => {
        setTravelSuccess(true);
        setTimeout(() => router.push("/new"), 300);
      }}
    >
      <div className="align-middle text-xl  	">
        🏙️ <br /> create room
      </div>
    </AwesomeButton>
  );
};

const checkTownValid = async (roomId) => {
  const res = await fetch(`/api/validtown?roomId=${roomId}`);
  const json = await res.json();

  return json.valid || false;
};

const RoomCodeInput = ({ correcttowncode, setTravelSuccess, seterror }) => {
  const router = useRouter();
  const townCodeInputRef = useRef(null);

  const placeHolder = useMemo(() => {
    let letter;
    while (
      ["Q", "K", "X"].includes(
        (letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      )
    );
    return letter.repeat(4);
  }, []);


  return (
    // Room code submit button
    <div className="flex spacing-5 mt-5">
      {/* Room code input */}
      <input
        ref={townCodeInputRef}
        id="token"
        className="form-input block rounded-md
      h-20 w-36  text-2xl sm:leading-5 sm:p-4
      border-2 border-gray-400 text-center
      focus:outline-none focus:border-2  focus:border-gray-600
      uppercase"
        // Random 4 letters
        placeholder={placeHolder}
      />
      <AwesomeButton
        type="primary"
        className="mx-1 h-20 w-20 rounded-md bg-green-200
              transition duration-300 ease-in-out 
              focus:outline-none hover:scale-110"
        onPress={() => {
          const code = townCodeInputRef.current.value.toUpperCase();
          checkTownValid(code)
            .then((valid) => {
              if (valid) {
                setTravelSuccess(true);
                setTimeout(() => router.push(`/${code}`), 300);
              } else seterror("invalid town code");
            })
            .catch((e) => seterror("something went wrong"));
        }}
        style={{
          marginLeft: "0.25rem !important",
          "--button-default-height": "5rem",
          "--button-default-border-radius": "0.375rem",
          "--button-raise-level": "1px",
        }}
      >
        <span
          style={{
            transition: "transform 2s ease-in",
            transform: correcttowncode ? "translate(100vw, -100vh)" : "unset",
          }}
        >
          ✈️
        </span>
      </AwesomeButton>
    </div>
  );
};

// Extra component to avoid rerender on button press
const Clouds = () => (
  <>
    <Cloud />
    <Cloud />
    <Cloud />
    <Cloud />
    <Cloud />
    <Cloud />
    <Cloud />
    <Cloud />
    <Cloud />
    <Cloud />
  </>
);

const JoinTown = () => {
  const [error, seterror] = useState("");
  const [travelSuccess, setTravelSuccess] = useState(false);
  const [loggedIn, setloggedin] = useState(false);

  return (
    <div className="w-screen">
      <div className="absolute w-screen z-20">
        <div
          className="rounded-3xl mx-auto mt-20"
          style={{
            width: "80vw",
            maxWidth: "50rem",
            height: "80vh",
            maxHeight: "35rem",
          }}
        >
          <div className="grid sm:grid-rows-4 h-full max-w-full py-10">
            <div>
              <h1 className="text-center text-4xl text-white pt-4 pb-2 font-bold text-shadow">
                tiny town 🏘️
              </h1>
	      <h3 className="text-center text-lg text-white pt-0 font-medium">Walk around and chat with positional audio, like in real life</h3>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 
                         h-full row-span-3 px-4 
                         sm:px-24 gap-x-0 gap-y-4 sm:gap-x-10 sm:gap-y-10"
            >
              {/* Create room button */}
              <CreateRoomButton
                setloggedin={setloggedin}
                setTravelSuccess={setTravelSuccess}
              />
              {/* Room code input */}
              <div className="w-full h-full bg-gray-50	shadow-md rounded-3xl mx-auto text-center col-span-2 flex">
                <div className="m-auto">
                  <p className="text-xl font-medium">enter town code</p>
                  <RoomCodeInput
                    correcttowncode={travelSuccess}
                    setTravelSuccess={setTravelSuccess}
                    seterror={seterror}
                    setloggedin={setloggedin}
                  />
                  {/* Room error code */}
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-screen h-screen bg-blue-500 overflow-hidden">
        <Clouds />
      </div>
    </div>
  );
};

export default JoinTown;
