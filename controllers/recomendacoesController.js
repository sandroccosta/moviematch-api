// controllers/recomendacoesController.js

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { buscarFilmePorID } from "../services/omdbService.js";
import formatarFilmesOmdb from "../utils/formatarFilmesOmdb.js";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. BASE DE DADOS DE FILMES EXPANDIDA (IDs do IMDb)
const filmesPorGenero_IMDb_IDs = {
    'Ação': ['tt0095016', 'tt0133093', 'tt1392190', 'tt2911666', 'tt0468569', 'tt0120689', 'tt0083658', 'tt0110148', 'tt0107290'],
    'Aventura': ['tt0082971', 'tt0107290', 'tt0120737', 'tt0325980', 'tt0167261', 'tt0112462', 'tt0080684'],
    'Animação': ['tt0110357', 'tt0114709', 'tt0245429', 'tt4633694', 'tt0495450', 'tt0435761', 'tt2948356', 'tt0268380'],
    'Comédia': ['tt1119646', 'tt0829482', 'tt0386140', 'tt0094737', 'tt0107048', 'tt0144084', 'tt0405422', 'tt0116282'],
    'Crime': ['tt0068646', 'tt0110912', 'tt0099685', 'tt0114369', 'tt0407887', 'tt0105236', 'tt0137523'],
    'Drama': ['tt0111161', 'tt0109830', 'tt0108052', 'tt0120689', 'tt0169547', 'tt0102802', 'tt0071562'],
    'Fantasia': ['tt0457430', 'tt0241527', 'tt0903624', 'tt0120737', 'tt0167260', 'tt0120915', 'tt1201607'],
    'Ficção Científica': ['tt1856101', 'tt0816692', 'tt0088763', 'tt0062622', 'tt0080684', 'tt0083658', 'tt1375666', 'tt0133093'],
    'Terror': ['tt0081505', 'tt0070047', 'tt5052448', 'tt1457767', 'tt0102926', 'tt8772262', 'tt0063522', 'tt0078748'],
    'Romance': ['tt0120338', 'tt0332280', 'tt0338013', 'tt0414387', 'tt0119177', 'tt0100405', 'tt1010048', 'tt0045551']
};

// 2. MAPA DE TRADUÇÃO DE GÊNEROS
const mapaDeGeneros = {
    'Ação': 'Action', 'Aventura': 'Adventure', 'Animação': 'Animation', 'Comédia': 'Comedy',
    'Crime': 'Crime', 'Documentário': 'Documentary', 'Drama': 'Drama', 'Família': 'Family',
    'Fantasia': 'Fantasy', 'História': 'History', 'Terror': 'Horror', 'Música': 'Music',
    'Mistério': 'Mystery', 'Romance': 'Romance', 'Ficção Científica': 'Sci-Fi', 'Thriller': 'Thriller'
};

// 3. FUNÇÕES AUXILIARES ROBUSTAS
function parseDuracao(textoDuracao) {
    if (!textoDuracao) return null;
    if (textoDuracao.includes('até 90')) return { min: 0, max: 90 };
    if (textoDuracao.includes('90-120')) return { min: 91, max: 120 };
    if (textoDuracao.includes('mais de 120')) return { min: 121, max: Infinity };
    return null;
}

function parseRuntime(runtimeString) {
    if (!runtimeString || typeof runtimeString !== 'string') return null;
    return parseInt(runtimeString.replace(' min', ''));
}


// 4. CONTROLLER PRINCIPAL COM LÓGICA DE FALLBACK E DEBUG
export async function gerarRecomendacoes(req, res) {
    try {
        const usuarioAuthId = req.usuario.usuario_auth_id;
        const { data: usuario } = await supabase.from("usuarios").select("id").eq("usuario_auth_id", usuarioAuthId).single();
        const { data: preferencias } = await supabase.from("preferencias").select("generos_favoritos, duracao_preferida").eq("usuario_id", usuario.id).single();

        const { generos_favoritos, duracao_preferida } = preferencias;
        const filtroDuracao = parseDuracao(duracao_preferida);
        
        console.log("Preferências do usuário:", { generos_favoritos, duracao_preferida });
        console.log("Filtro de duração aplicado:", filtroDuracao || "Nenhum");

        const idsParaBuscar = new Set();
        generos_favoritos.forEach(genero => {
            if (filmesPorGenero_IMDb_IDs[genero]) {
                filmesPorGenero_IMDb_IDs[genero].forEach(id => idsParaBuscar.add(id));
            }
        });

        const promessasDeBusca = Array.from(idsParaBuscar).map(id => buscarFilmePorID(id));
        const resultadosBrutos = await Promise.all(promessasDeBusca);
        const todosOsFilmesValidos = resultadosBrutos.filter(filme => filme && filme.Response === "True");

        console.log(`\nTotal de filmes válidos encontrados na OMDb: ${todosOsFilmesValidos.length}`);

        const recomendacoesPorGenero = {};
        generos_favoritos.forEach(g => { recomendacoesPorGenero[g] = []; });
        const idsAdicionados = new Set();

        for (const generoPT of generos_favoritos) {
            const generoEN = mapaDeGeneros[generoPT];
            if (!generoEN) continue;

            console.log(`\n--- Processando Gênero: ${generoPT} (como ${generoEN}) ---`);

            const filmesDesteGenero = todosOsFilmesValidos.filter(f => f.Genre.includes(generoEN));
            let filmesFiltrados = filmesDesteGenero.filter(filme => {
                if (!filtroDuracao) return true;
                const runtimeMinutos = parseRuntime(filme.Runtime);
                return runtimeMinutos && runtimeMinutos >= filtroDuracao.min && runtimeMinutos <= filtroDuracao.max;
            });
            
            console.log(`   Encontrados ${filmesDesteGenero.length} filmes do gênero.`);
            console.log(`   Após filtro de duração, restaram ${filmesFiltrados.length} filmes.`);
            
            if (filmesFiltrados.length === 0 && filmesDesteGenero.length > 0) {
                console.log(`   FALLBACK: Nenhum filme passou no filtro de duração. Usando a lista original do gênero.`);
                filmesFiltrados = filmesDesteGenero;
            }
            
            const filmesParaAdicionar = filmesFiltrados.slice(0, 5);
            
            for (const filme of filmesParaAdicionar) {
                 const filmeFormatado = formatarFilmesOmdb(filme);
                 if (filmeFormatado && !idsAdicionados.has(filmeFormatado.imdbID)) {
                     recomendacoesPorGenero[generoPT].push(filmeFormatado);
                     idsAdicionados.add(filmeFormatado.imdbID);
                 }
            }
        }
        
        console.log("\n--- RESULTADO FINAL PARA ENVIAR ---");
        console.log(JSON.stringify(recomendacoesPorGenero, null, 2));

        return res.status(200).json({ recomendacoes: recomendacoesPorGenero });
    } catch (err) {
        console.error("Erro ao gerar recomendações:", err);
        return res.status(500).json({ error: "Erro ao gerar recomendações: " + err.message });
    }
}