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
router.post("/", createCancion);
router.put("/:id", updateCancion);
router.delete("/:id", verifyToken, verifyAdmin, deleteCancion);

export default router;