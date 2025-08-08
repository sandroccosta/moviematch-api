import { buscarFilmePorTitulo } from "../services/omdbService.js";

export async function buscarFilme(req, res) {
    const { titulo } = req.query;

    if (!titulo) {
        return res.status(400).json({ erro: "Parâmetro 'titulo' é obrigatório." });
    }

    try {
        const dados = await buscarFilmePorTitulo(titulo);

        if (dados.Response === "False") {
            return res.status(404).json({ erro: "Filme não encontrado." });
        }

        res.status(200).json(dados);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar filme: " + err.message });
    }
}
