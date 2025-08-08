import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export async function buscarFilmePorTitulo(titulo) {
    const apiKey = process.env.OMDB_API_KEY;
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&apikey=${apiKey}`;

    const resposta = await axios.get(url);
    return resposta.data;
}


