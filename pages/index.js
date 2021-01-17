import useSWR from "swr";
import { useUser } from "../components/UserContext";
import { supabase } from "../utils/initSupabase";
import SupabaseAuth from "../components/SupabaseAuth";
import { useState } from "react";
import { AwesomeButton } from "react-awesome-button";
import JoinTown from "../components/JoinTown";
// import OldGame from "../components/Game/OldGame";
import dynamic from "next/dynamic";

const fetcher = (url, token) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json());

// Game component has to be dynamic
const PixiGameNoSSR = dynamic(() => import("../components/Game/PixiGame"), {
  ssr: false,
});

const Index = () => {
  // const { user, session } = useUser();
  // const { data, error } = useSWR(
  //   session ? ["/api/getUser", session.access_token] : null,
  //   fetcher
  // );
  // if (!user) {
  //   return (
  //     <>
  //       <p>Hi there!</p>
  //       <p>You are not signed in.</p>
  //       <div>
  //         <SupabaseAuth />
  //       </div>
  //     </>
  //   );
  // }

  const LoggedIn = true;

  return (
    <div>
        <p>test</p>
      {!LoggedIn && <JoinTown />}
      <div style={{ filter: LoggedIn ? "none" : "blur(4px)" }}>
        {/* <Game></Game> */}
        <PixiGameNoSSR />
      </div>
      {/* <p
        style={{
          display: "inline-block",
          color: "blue",
          textDecoration: "underline",
          cursor: "pointer",
        }}
        onClick={() => supabase.auth.signOut()}
      >
        Log out
      </p>
      <div>
        <p>You're signed in. Email: {user.email}</p>
      </div>
      {error && <div>Failed to fetch user!</div>}
      {data && !error ? (
        <div>
          <span>User data retrieved server-side (in API route):</span>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div>Loading...</div>
      )} */}
    </div>
  );
};

export default Index;
