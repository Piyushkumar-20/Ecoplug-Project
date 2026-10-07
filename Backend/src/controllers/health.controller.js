import db from "../config/db.js";

const checkDatabase = async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};

export default checkDatabase