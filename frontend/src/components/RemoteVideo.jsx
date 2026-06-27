import { useEffect, useRef } from "react";

function RemoteVideo({ stream, user }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="250"
        style={{
          border: "2px solid black",
          borderRadius: "10px",
        }}
      />

      <p
        style={{
          marginTop: "5px",
          fontWeight: "bold",
        }}
      >
        {user}
      </p>
    </div>
  );
}

export default RemoteVideo;