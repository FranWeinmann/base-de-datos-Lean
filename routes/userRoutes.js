import { Router } from "express";
import { createUser, login, escucho } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/create", createUser);
router.post("/login", login);
router.get("/escucho", verifyToken, escucho);

export default router;