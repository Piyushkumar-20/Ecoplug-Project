import express from "express"
import checkDatabase from "../controllers/health.controller.js"

const router = express.Router()
router.get("/db", checkDatabase)

export default router