  //   async setupAudio(channel, token) {
  //     this.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
  //     const appid = AGORA_APPID;
  //     const uid = await this.client.join(
  //       appid,
  //       channel,
  //       token,
  //       this.player.playerId
  //     );

  //     this.client.on("user-published", async (user, mediaType) => {
  //       // Subscribe to a remote user.
  //       await this.client.subscribe(user, mediaType);
  //       console.log("subscribe success");

  //       // If the subscribed track is audio.
  //       if (mediaType === "audio") {
  //         // Get `RemoteAudioTrack` in the `user` object.
  //         const remoteAudioTrack = user.audioTrack;
  //         // Play the audio track. No need to pass any DOM element.
  //         remoteAudioTrack.play();

  //         const { uid } = user;
  //         this.players[uid].audioTrack = remoteAudioTrack;
  //       } else {
  //         console.error("error: unsupported media track");
  //       }
  //     });

  //     // Create an audio track from the audio sampled by a microphone
  //     this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  //     // Publish the local audio to the channel.
  //     await this.client.publish([this.localAudioTrack]);

  //     console.log("audio publish success!");
  //     this.setState({ audioStatus: "connected" });

  //     // this.client.on("user-unpublished", (user) => {});
  //   }

  //   async stopAudio() {
  //     // Stop mic
  //     this.localAudioTrack.close();
  //     // Leave the channel.
  //     await this.client.leave();

  //     this.setState({ audioStatus: "audio disconnected" });
  //   }