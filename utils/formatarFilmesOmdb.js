
export default function formatarFilmesOmdb(filme) {
    return {
        titulo: filme.Title,
        ano: filme.Year,
        imdbID: filme.imdbID,
        tipo: filme.Type,
        poster: filme.Poster,
    };
}
