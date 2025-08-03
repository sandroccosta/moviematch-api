import express from "express";
import { verificarAutenticacao } from "../../middlewares/authMiddleware.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Rota protegida de exemplo: GET /perfil
router.get("/", verificarAutenticacao, async (req, res) => {
    const { usuario_auth_id } = req.usuario;

    try {
        const { data: usuario, error } = await supabase
            .from("usuarios")
            .select("id, nome")
            .eq("usuario_auth_id", usuario_auth_id)
            .single();

        if (error) throw error;

        res.status(200).json({
            message: "Perfil recuperado com sucesso!",
            usuario,
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar perfil: " + err.message });
    }
});

export default router;
