const ErrorAlert = ({ errorMsg }) => {
  const router = useRouter();
  const [animateLeave, setanimateLeave] = useState(false);

  return (
    <div className="absolute w-screen z-20">
      <div
        className="rounded-2xl bg-white	mx-auto mt-40 shadow-lg p-8"
        style={{ width: "20rem", height: "15rem" }}
      >
        <p
          className="text-3xl font-bold"
          style={{
            transition: "transform 2s ease-in",
            transform: animateLeave ? "translate(100vw, -100vh)" : "unset",
          }}
        >
          🛩️
        </p>
        <h1 className="text-3xl font-bold pt-4"> {errorMsg}</h1>
        <br />
        <AwesomeButton
          type="primary"
          className="pt-4"
          style={{
            // "margin-left": "0.25rem !important",
            "--button-default-height": "100%",
            "--button-default-border-radius": "1.5rem",
            "--button-raise-level": "4px",
            "--button-primary-border": "none",
            height: "3rem",
          }}
          onPress={() => {
            setanimateLeave(true);
            setTimeout(() => router.push("/"), 500);
          }}
        >
          <div className="align-middle text-xl">go back</div>
        </AwesomeButton>
      </div>
    </div>
  );
};

export default ErrorAlert;