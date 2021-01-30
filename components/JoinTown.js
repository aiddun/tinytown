import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { AwesomeButton } from "react-awesome-button";

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
        "--button-default-height": "100%",
        "--button-default-border-radius": "1.5rem",
        "--button-raise-level": "4px",
        "--button-primary-color": "white",
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
  const res = await fetch(`http://localhost:8888/validtown?roomId=${roomId}`);
  const json = await res.json();

  return json.valid || false;
};

const RoomCodeInput = ({ correcttowncode, setTravelSuccess, seterror }) => {
  const router = useRouter();
  const townCodeInputRef = useRef(null);
  return (
    // Room code submit button
    <div className="flex gspacing-5 mt-5">
      {/* Room code input */}
      <input
        ref={townCodeInputRef}
        id="token"
        className="form-input block rounded-md
      h-20 w-60 sm:text-2xl sm:leading-5 sm:p-4
      border-2 border-gray-400 
      focus:outline-none focus:border-2  focus:border-gray-600"
        placeholder="000000"
      />
      <AwesomeButton
        type="primary"
        className="ml-1 h-20 w-20 rounded-md bg-green-200
              transition duration-300 ease-in-out 
              focus:outline-none hover:scale-110"
        onPress={() => {
          const code = townCodeInputRef.current.value;
          checkTownValid(code).then((valid) => {
            if (valid) {
              setTravelSuccess(true);
              setTimeout(() => router.push(`/${code}`), 300);
            } else seterror("error: invalid town code. please try again");
          });
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

const JoinTown = ({ setloggedin }) => {
  const [error, seterror] = useState("");
  const [travelSuccess, setTravelSuccess] = useState(false);

  return (
    <div className="absolute w-screen z-20">
      <div
        className="rounded-3xl bg-green-400	mx-auto mt-20 "
        style={{ width: "50rem", height: "35rem" }}
      >
        <div className="grid grid-rows-4 h-full py-10">
          <div>
            <h1 className="text-center text-4xl text-white pt-5 font-bold	">
              tiny town 🏘️
            </h1>
          </div>
          <div className="grid grid-cols-3 h-full row-span-3 px-24 gap-10">
            <CreateRoomButton
              setloggedin={setloggedin}
              setTravelSuccess={setTravelSuccess}
            />
            <div className="w-full h-full bg-white rounded-3xl mx-auto text-center col-span-2 flex">
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
  );
};

export default JoinTown;
