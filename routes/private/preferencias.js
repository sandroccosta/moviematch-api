import express from "express";
import { verificarAutenticacao } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/minhas-preferencias", verificarAutenticacao, async (req, res) => {
    // Exemplo: acesso ao req.usuario.usuario_auth_id
    res.json({ message: "Rota protegida acessada com sucesso!", usuario: req.usuario });
});

export default router;
