import { Router } from "express";
import {
  getCanciones,
  createCancion,
  updateCancion,
  deleteCancion,
} from "../controllers/cancionController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", getCanciones);
router.post("/", verifyToken, verifyAdmin, createCancion);
router.put("/:id", verifyToken, verifyAdmin, updateCancion);
router.delete("/:id", verifyToken, verifyAdmin, deleteCancion);

export default router;