import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const apiKey = process.env.OMDB_API_KEY;

// Função antiga, ainda pode ser útil no futuro
export async function buscarFilmePorTitulo(titulo) {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&apikey=${apiKey}`;
    const resposta = await axios.get(url);
    return resposta.data;
}

// ===== NOVA FUNÇÃO (MAIS PRECISA) =====
export async function buscarFilmePorID(imdbID) {
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
    try {
        const resposta = await axios.get(url);
        // Adiciona um log para vermos o que a OMDb responde
        if (resposta.data.Error) {
            console.error(`OMDb retornou um erro para ID ${imdbID}: ${resposta.data.Error}`);
        }
        return resposta.data;
    } catch (error) {
        // ESTE LOG VAI NOS DIZER O MOTIVO DA FALHA
        console.error(`Falha de rede ao buscar filme com ID ${imdbID}. Erro:`, error.message);
        return null; // Retorna nulo em caso de erro para não quebrar o Promise.all
    }
    }