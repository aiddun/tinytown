import useSWR from "swr";
// import { useUser } from "../components/UserContext";
// import { supabase } from "../utils/initSupabase";
// import SupabaseAuth from "../components/SupabaseAuth";
import { useState } from "react";
import JoinTown from "../components/JoinTown/JoinTown";
// import OldGame from "../components/Game/OldGame";

const fetcher = (url, token) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json());

const Index = JoinTown;

export default Index;
