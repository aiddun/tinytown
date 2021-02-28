const RightSidebar = ({ setBackground, background, backgrounds, disabled }) => {
  return (
    <div className="relative select-none	">
      <div className="absolute bottom-3 left-0 w-full">
        {Object.entries(backgrounds).map(([name, src], i) => (
          <button key={i} className="lg:block ml-1 mt-1" onClick={() => setBackground(name)} disabled={disabled}>
            <img className="w-7 h-7 rounded-lg" src={src} alt={name} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
