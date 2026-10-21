import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import db from "./config/db.js";
import { socketAuthMiddleware } from "./middleware/socket-auth.middleware.js";

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  const { userId, companyId } = socket.data.user;

  socket.join(`company:${companyId}`);
  console.log(`Socket connected: User ${userId}, Company ${companyId}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: User ${userId}`);
  });
});
app.set("io", io);

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("MySql Connected Successfully");

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MySql Connection Failed");
    console.error(error.message);
  }
}

startServer();
