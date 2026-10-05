import { io } from "socket.io-client";

const socket = io(
  "https://collaboration-room.onrender.com"
);

export default socket;