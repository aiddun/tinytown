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
        <meta key="robots" name="robots" content="noindex, nofollow" />
        <meta key="googlebot" name="googlebot" content="noindex, nofollow" />
      </Head>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
        }
      `}</style>
      <div className="w-full h-full">
        <PixiGameNoSSR roomId={roomId} />
      </div>
    </>
  );
};
export default Game;
