import axios from "axios";

const API = axios.create({
  baseURL: "https://collaboration-room.onrender.com/api"
});

export default API;