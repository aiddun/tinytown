import { useRouter } from "next/router";
import dynamic from "next/dynamic";

// Game component has to be dynamic
const PixiGameNoSSR = dynamic(() => import("../components/Game/PixiGame"), {
  ssr: false,
});

const Game = () => {
  const router = useRouter();
  const { roomId } = router.query;

  return (
    //   <div style={{ filter: loggedIn ? "none" : "blur(4px)" }}>
    // {/* <Game></Game> */}
    <PixiGameNoSSR roomId={roomId} />
    //   </div>
  );
};
export default Game;
