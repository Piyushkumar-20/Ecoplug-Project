import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.router.js";
import companyRoutes from "./routes/company.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import tariffsRoutes from "./routes/tariffs.routes.js";
import locationRoutes from "./routes/location.routes.js";
import chargersRoutes from "./routes/chargers.router.js";
import sessionRoutes from "./routes/session.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import complaintRoutes from "./routes/complaints.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import cookieParser from "cookie-parser";
import { apiReference } from "@scalar/express-api-reference";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiPath = path.resolve(__dirname, "../openapi.json");
const openapi = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ecoplug Backend is Running",
  });
});

app.get("/openapi.json", (req, res) => {
  res.json(openapi);
});

app.use(
  "/api-docs",
  apiReference({
    content: openapi,
    theme: "default",
  }),
);

app.use("/api/health", healthRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tariffs", tariffsRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/chargers", chargersRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
// Backwards-compatible alias for existing clients.
app.use("/api/notification", notificationRoutes);

export default app;
