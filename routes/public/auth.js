import express from "express";
import { registrarUsuario, loginUsuario } from "../../controllers/authController.js";

const router = express.Router();

// Rota para registro
router.post("/register", registrarUsuario);

// Rota para login
router.post("/login", loginUsuario);

export default router;
