import express from "express";
import verificarAutenticacao from "../../middlewares/authMiddleware.js";
import { obterPreferencias } from "../../controllers/preferenciasController.js";

const router = express.Router();

router.get("/", verificarAutenticacao, obterPreferencias);

export default router;
