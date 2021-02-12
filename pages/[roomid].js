import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";

// Game component has to be dynamic
const PixiGameNoSSR = dynamic(() => import("../components/Game/PixiGame"), {
  ssr: false,
});

const Game = () => {
  const router = useRouter();
  const { roomId } = router.query;

  return (
    <>
      <Head>
        <meta key="robots" name="robots" content="noindex, follow" />
        <meta key="googlebot" name="googlebot" content="noindex, follow" />
      </Head>
      <div>
        <PixiGameNoSSR roomId={roomId} />
      </div>
    </>
  );
};
export default Game;
