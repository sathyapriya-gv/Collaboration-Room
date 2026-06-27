import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import socket from "../socket";
import RemoteVideo from "./RemoteVideo";

function VideoCall({ roomId }) {
  const myVideo = useRef(null);
  const peerRef = useRef(null);
  const callsRef = useRef([]);
  const peerUsersRef = useRef({});
  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [sharingUser, setSharingUser] =
  useState("");
  const [canShare, setCanShare] =
  useState(true);
  const [screenSharing, setScreenSharing] =
    useState(false);
  const [raisedUser, setRaisedUser] =
    useState("");

   useEffect(() => {
  socket.on(
    "screen-share-user",
    (message) => {
      setSharingUser(message || "");
    }
  );

 

  return () => {
    socket.off(
      "screen-share-user"
    );

    
  };
}, []);

  useEffect(() => {
    console.log("VideoCall mounted");
    let peer;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((currentStream) => {
        setStream(currentStream);

        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        peer = new Peer(undefined, {
          host: "localhost",
          port: 5000,
          path: "/peerjs",
        });

        peerRef.current = peer;

        peer.on("open", (id) => {
          console.log("My Peer ID:", id);

          socket.emit(
            "peer-id",
            {
              roomId,
              peerId: id,
              user:
                localStorage.getItem(
                  "user"
                ),
            }
          );
        });

        socket.on(
  "peer-users-update",
  (users) => {
    peerUsersRef.current = users;
  }
);

socket.on(
  "hand-raised",
  (user) => {
    setRaisedUser(user);

    // Remove notification after 3 seconds
    setTimeout(() => {
      setRaisedUser("");
    }, 10000);
  }
);

        // New user joins
        socket.on(
          "user-connected",
          ({
            peerId,
            user,
          }) => {
            peerUsersRef.current[peerId] = user;
            const call = peer.call(
              peerId,
              currentStream
            );

            callsRef.current.push(call);

            call.on(
              "stream",
              (remoteStream) => {
                setRemoteStreams((prev) => {
                  const exists = prev.find(
                    (s) =>
                      s.stream.id === remoteStream.id
                  );

                  if (exists) return prev;

                  return [
                    ...prev,
                    {
                      stream: remoteStream,
                      user,
                    },
                  ];
                });
              }
            );
          });

        // Receive incoming call
        peer.on("call", (call) => {
          call.answer(currentStream);
          callsRef.current.push(call);
          call.on(
            "stream",
            (remoteStream) => {
              setRemoteStreams((prev) => {
                const exists = prev.find(
                  (s) =>
                    s.stream.id === remoteStream.id
                );

                if (exists) return prev;

                return [
  ...prev,
  {
    stream: remoteStream,
    user:
      peerUsersRef.current[
        call.peer
      ] || "Participant",
  },
];
              });
            }
          );
        });
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      socket.off("user-connected");
      socket.off("peer-users-update");
      socket.off("hand-raised");
        callsRef.current = [];

      if (peerRef.current) {
        peerRef.current.destroy();
      }

      setRemoteStreams([]);
    };
  }, [roomId]);

  const toggleCamera = () => {
    if (!stream) return;

    const videoTrack =
      stream.getVideoTracks()[0];

    videoTrack.enabled =
      !videoTrack.enabled;

    setCameraOn(videoTrack.enabled);
  };

  const toggleMic = () => {
    if (!stream) return;

    const audioTrack =
      stream.getAudioTracks()[0];

    audioTrack.enabled =
      !audioTrack.enabled;

    setMicOn(audioTrack.enabled);
  };

const startScreenShare = () => {

  socket.emit(
    "request-screen-share",
    {
      roomId,
      user:
        localStorage.getItem(
          "user"
        ),
    },
    async (response) => {

      if (!response.allowed) {
        alert(response.message);

        return;
      }

      try {
        const screenStream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });

        const screenTrack =
          screenStream.getVideoTracks()[0];

        callsRef.current.forEach(
          (call) => {

            const sender =
              call.peerConnection
                ?.getSenders()
                ?.find(
                  (s) =>
                    s.track &&
                    s.track.kind ===
                      "video"
                );

            if (sender) {
              sender.replaceTrack(
                screenTrack
              );
            }
          }
        );

        myVideo.current.srcObject =
          screenStream;

        setScreenSharing(true);

        setCanShare(false);

        screenTrack.onended =
          () => {
            stopScreenShare();
          };

      } catch (err) {
        console.log(err);

        socket.emit(
          "screen-share-stop",
          {
            roomId,
            user:
              localStorage.getItem(
                "user"
              ),
          }
        );
      }
    }
  );
};
  const stopScreenShare =
  async () => {
    try {
      const cameraStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      const cameraTrack =
        cameraStream.getVideoTracks()[0];

      callsRef.current.forEach(
        (call) => {
          const sender =
            call.peerConnection
              ?.getSenders()
              ?.find(
                (s) =>
                  s.track &&
                  s.track.kind ===
                    "video"
              );

          if (sender) {
            sender.replaceTrack(
              cameraTrack
            );
          }
        }
      );

      myVideo.current.srcObject =
        cameraStream;

      setStream(cameraStream);

      setScreenSharing(false);
      setCanShare(true);
      socket.emit(
  "screen-share-stop",
  {
    roomId,
    user:
      localStorage.getItem(
        "user"
      ),
  }
);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h3>Video Call</h3>

      {/* My Video */}
      {sharingUser && (
  <div
    style={{
      background: "#2563eb",
      color: "white",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "10px",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    🖥 {sharingUser}
  </div>
)}

{raisedUser && (
  <div
    style={{
      background: "#f59e0b",
      color: "white",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "10px",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    ✋ {raisedUser} raised their hand
  </div>
)}


      {/* Remote Videos */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        <video
          ref={myVideo}
          autoPlay
          muted
          playsInline
          width="250"
          style={{
            border: "2px solid black",
            borderRadius: "10px",
          }}
        />

        {remoteStreams.map(
          (item, index) => (
            <RemoteVideo
              key={index}
              stream={item.stream}
              user={item.user}
            />
          )
        )}
      </div>

      <br />
      <br />

      <button onClick={toggleCamera}>
        {cameraOn
          ? "Turn Camera Off"
          : "Turn Camera On"}
      </button>

      <button
        onClick={toggleMic}
        style={{
          marginLeft: "10px",
        }}
      >
        {micOn
          ? "Mute Mic"
          : "Unmute Mic"}
      </button>

      <button
  onClick={
    screenSharing
      ? stopScreenShare
      : startScreenShare
  }
  disabled={!canShare && !screenSharing}
  style={{
    marginLeft: "10px",
    opacity:
      !canShare && !screenSharing
        ? 0.5
        : 1,
    cursor:
      !canShare && !screenSharing
        ? "not-allowed"
        : "pointer",
  }}
>
  {screenSharing
    ? "Stop Share"
    : "Share Screen"}
</button>

<button
  onClick={() =>
    socket.emit(
      "raise-hand",
      {
        roomId,
        user:
          localStorage.getItem(
            "user"
          ),
      }
    )
  }
  style={{
    marginLeft: "10px",
  }}
>
  ✋ Raise Hand
</button>
    </div>
  );
}

export default VideoCall;