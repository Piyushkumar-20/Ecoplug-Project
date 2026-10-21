import { io } from "socket.io-client";
import { getAccessToken } from "./api.js";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoCorrect: false,
  withCredentials: true,
  uth: (callback) => {
    callback({
      token: getAccessToken(),
    });
  },
});
