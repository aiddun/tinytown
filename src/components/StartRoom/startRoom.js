import React, { useState, useEffect } from "react";
const { connect } = require("twilio-video");

/* 
Server:
Create token
FUTURE - Create room

Client:
Connect to name
 -> callback - Join game
Notify server of client
Start getting volumes + positions from server
Set volumes with piecewise fn
*/

/* 
Server:
getToken()
joinRoom()?

leaveRoom()

Client:
join()
create()
*/

const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzgwMWUxZWFhMmVlZjg2MWY2MDkwZDMzZWI4ZjgxMmI1LTE2MDQ5MTEyOTQiLCJpc3MiOiJTSzgwMWUxZWFhMmVlZjg2MWY2MDkwZDMzZWI4ZjgxMmI1Iiwic3ViIjoiQUM2ZGNjZDY5M2QyZWMxZjUwYWI3NTkwN2FlY2U5NzIxZSIsImV4cCI6MTYwNDkxNDg5NCwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiQWlkYW4iLCJ2aWRlbyI6e319fQ.GriI9t8_kzD2PkqCYIBtJtCo8NXg25eqDxIxLUzFnlc";

const StartRoom = (props) => {
  useEffect(() => {
      connect(token, { name: "houseclub" }).then(
      (room) => {
        console.log(`Successfully joined a Room: ${room}`);
        window.room = room
        room.on("participantConnected", (participant) => {
          console.log(`A remote Participant connected: ${participant}`);
        });
      },
      (error) => {
        console.error(`Unable to connect to Room: ${error.message}`);
      }
    );
  });

  return (<div></div>)
};

export default StartRoom;
