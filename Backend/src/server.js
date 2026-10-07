import "dotenv/config";
import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("MySql Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MySql Connection Failed");
    console.error(error.message);
  }
}

startServer();
