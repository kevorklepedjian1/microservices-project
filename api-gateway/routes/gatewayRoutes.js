import express from "express";
import { register, login, forwardBlood } from "../controllers/gatewayController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
// import { protect } from "../middleware/authMiddleware.js";


// Auth routes
router.post("/auth/register", register);
router.post("/auth/login", login);

// Blood Service routes (proxy + JWT)
router.use("/blood", protect, forwardBlood);

export default router;