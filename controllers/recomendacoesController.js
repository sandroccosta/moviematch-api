// controllers/recomendacoesController.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { buscarFilmePorTitulo } from "../services/omdbService.js";
import formatarFilmesOmdb from "../utils/formatarFilmesOmdb.js";


dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function gerarRecomendacoes(req, res) {
    try {
        const usuarioAuthId = req.usuario.usuario_auth_id;

        const { data: usuarios, error: erroUsuario } = await supabase
            .from("usuarios")
            .select("id")
            .eq("usuario_auth_id", usuarioAuthId);

        if (erroUsuario || !usuarios || usuarios.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const usuario_id = usuarios[0].id;

        const { data: preferencias, error: erroPreferencia } = await supabase
            .from("preferencias")
            .select("generos_favoritos")
            .eq("usuario_id", usuario_id);

        if (erroPreferencia || !preferencias || preferencias.length === 0) {
            return res.status(404).json({ error: "Preferências não encontradas." });
        }

        const generos = preferencias[0].generos_favoritos;

        if (!Array.isArray(generos)) {
            return res.status(400).json({ error: "Os gêneros favoritos devem ser um array." });
        }

        console.log("Preferências brutas:", preferencias[0]);
        console.log("generos_favoritos:", preferencias[0].generos_favoritos);


        const resultados = [];

        for (const genero of generos) {
            const filme = await buscarFilmePorTitulo(genero);
            const filmeFormatado = formatarFilmesOmdb(filme);
            if (filmeFormatado) resultados.push(filmeFormatado);
        }

        return res.status(200).json({ recomendacoes: resultados });
    } catch (err) {
        return res.status(500).json({ error: "Erro ao gerar recomendações: " + err.message });
    }
}


