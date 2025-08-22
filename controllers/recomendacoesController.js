// controllers/recomendacoesController.js

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { buscarFilmePorID } from "../services/omdbService.js";
import formatarFilmesOmdb from "../utils/formatarFilmesOmdb.js";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. BASE DE DADOS DE FILMES EXPANDIDA E ATUALIZADA
const filmesPorGenero_IMDb_IDs = {
    'Ação': ['tt1392190', 'tt2911666', 'tt0468569', 'tt1745960', 'tt1160419', 'tt10872600', 'tt6710474', 'tt0133093', 'tt7286456', 'tt0095016', 'tt1375666'],
    'Aventura': ['tt0082971', 'tt0120737', 'tt2283362', 'tt13320622', 'tt4154796', 'tt0107290', 'tt3659388', 'tt0167261', 'tt0369610', 'tt0088763'],
    'Animação': ['tt4633694', 'tt2948372', 'tt4729430', 'tt3581652', 'tt9426210', 'tt7975244', 'tt2380307', 'tt0114709', 'tt0495450', 'tt0245429'],
    'Comédia': ['tt1489887', 'tt9484998', 'tt11286314', 'tt8946378', 'tt7734218', 'tt0829482', 'tt2096673', 'tt0107048', 'tt0116282', 'tt0386140'],
    'Crime': ['tt0068646', 'tt0110912', 'tt0099685', 'tt7286456', 'tt1302006', 'tt8946378', 'tt5052448', 'tt0407887', 'tt0114369', 'tt0105236'],
    'Drama': ['tt6751668', 'tt9770150', 'tt10618286', 'tt15398776', 'tt13238346', 'tt0111161', 'tt0109830', 'tt0469494', 'tt0169547', 'tt0120586'],
    'Fantasia': ['tt6710474', 'tt5580390', 'tt9411972', 'tt0457430', 'tt0120737', 'tt0167260', 'tt1201607', 'tt0093779', 'tt0903624', 'tt1950186'],
    'Ficção Científica': ['tt1160419', 'tt2543164', 'tt10954984', 'tt6710474', 'tt1856101', 'tt0816692', 'tt1630029', 'tt1375666', 'tt0133093', 'tt0080684'],
    'Terror': ['tt7784604', 'tt8772262', 'tt6644200', 'tt15791034', 'tt10638522', 'tt5052448', 'tt0070047', 'tt0081505', 'tt2275940', 'tt1457767'],
    'Romance': ['tt3783958', 'tt8613070', 'tt13238346', 'tt5726616', 'tt0332280', 'tt0338013', 'tt0414387', 'tt0100405', 'tt0119177', 'tt1010048']
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

            if (filmesFiltrados.length < 10 && filmesDesteGenero.length > filmesFiltrados.length) {
                console.log(`   FALLBACK: A lista filtrada tem menos de 10 filmes. Usando a lista original do gênero para completar.`);
                filmesFiltrados = filmesDesteGenero;
            }
            
            const filmesParaAdicionar = filmesFiltrados.slice(0, 10);
            
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