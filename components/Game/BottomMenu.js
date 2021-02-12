const BottomMenu = ({
  onNameInput,
  colorRef,
  throttledOnColorInput,
  gameStatusText,
}) => {
  return (
    <div className="rounded-xl mx-auto bg-gray-100 h-40 my-5 w-full shadow-sm ">
      <div className="mx-auto text-center py-5">
        <div
          className="mx-auto"
          style={{
            width: "max-content",
          }}
        >
          <div
            style={{
              width: "inherit",
            }}
          >
            <label className="text-left text-sm font-medium leading-5 text-gray-700">
              name
            </label>
          </div>
          <div className="inline-flex">
            <div className="mr-3 mt-1 rounded-md shadow-sm w-48">
              <input
                type="text"
                autoComplete="chrome-off" // placeholder="Your name"
                onInput={onNameInput}
                className="form-input w-full rounded-md text-xl sm:leading-5 p-2"
              />
            </div>
            <input
              style={{
                height: "inherit",
                clipPath: "circle(40%)",
                cursor: "pointer",
              }}
              ref={colorRef}
              type="color" // value={this.state.colorInput}
              onChange={throttledOnColorInput}
              title="Change color"
            />
          </div>
        </div>
        <br />
        <strong>{gameStatusText}</strong>
      </div>
    </div>
  );
};

export default BottomMenu;
