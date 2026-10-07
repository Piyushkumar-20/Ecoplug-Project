import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.router.js"
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ecoplug Backend is Running",
  });
});

app.use("/api/health", healthRoutes)

export default app;
