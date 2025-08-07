import express from "express";
import  verificarAutenticacao from "../../middlewares/authMiddleware.js";
import { gerarRecomendacoes } from "../../controllers/recomendacoesController.js";

const router = express.Router();

router.get("/", verificarAutenticacao, gerarRecomendacoes);

export default router;
