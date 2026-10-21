import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import db from "./config/db.js";
import { socketAuthMiddleware } from "./middleware/socket-auth.middleware.js";

import {
  startComplaintNotificationPolling,
  stopComplaintNotificationPolling,
} from "./services/complaint-notification.service.js";

const PORT = Number(process.env.PORT) || 5000;

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

let isShuttingDown = false;

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("MySQL connected successfully");

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);

      // Start automatic detection of new complaints.
      startComplaintNotificationPolling(io);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Shutting down...`);

  try {
    await stopComplaintNotificationPolling();

    // Stop accepting new HTTP connections.
    await new Promise((resolve, reject) => {
      httpServer.close((error) => {
        if (error) reject(error);
        else resolve();
      });

      // Close Socket.IO connections and its underlying server.
      io.close();
    });

    // Close the MySQL pool only if db exports a pool.
    if (typeof db.end === "function") {
      await db.end();
    }

    console.log("Server shut down successfully");
    process.exitCode = 0;
  } catch (error) {
    console.error("Graceful shutdown failed:", error.message);
    process.exitCode = 1;
  }
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

void startServer();
