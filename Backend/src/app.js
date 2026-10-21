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
import dashboardRoutes from "./routes/dashboard.routes.js"
import complaintRoutes from "./routes/complaints.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ecoplug Backend is Running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tariffs", tariffsRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/chargers", chargersRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/complaints", complaintRoutes)
app.use("/api/notification", notificationRoutes)

export default app;
