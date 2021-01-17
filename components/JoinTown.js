import React from "react";

const JoinTown = (props) => {
  const [error, seterror] = useState("");

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
            >
              <div className="align-middle text-xl  	">
                🏙️ <br /> create room
              </div>
            </AwesomeButton>
            <div className="w-full h-full bg-white rounded-3xl mx-auto text-center col-span-2 flex">
              <div className="m-auto">
                <p className="text-xl font-medium">enter town code</p>
                <div className="flex gspacing-5 mt-5">
                  {/* Room code input */}
                  <input
                    id="token"
                    className="form-input block rounded-md
                      h-20 w-60 sm:text-2xl sm:leading-5 sm:p-4
                      border-2 border-gray-400 
                      focus:outline-none focus:border-2  focus:border-gray-600"
                    placeholder="000000"
                  />
                  {/* Room code submit button */}
                  <AwesomeButton
                    type="primary"
                    className="ml-1 h-20 w-20 rounded-md bg-green-200
                                transition duration-300 ease-in-out 
                                focus:outline-none hover:scale-110"
                    onClick={() => seterror("test")}
                    style={{
                      "margin-left": "0.25rem !important",
                      "--button-default-height": "5rem",
                      "--button-default-border-radius": "0.375rem",
                      "--button-raise-level": "1px",
                    }}
                  >
                    ✈️
                  </AwesomeButton>
                </div>
                {/* Room error code */}
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinTown;