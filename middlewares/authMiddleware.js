import jwt from "jsonwebtoken";

export function verificarAutenticacao(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    const [tipo, token] = authHeader.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({ error: "Token mal formatado." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Adiciona os dados do usuário na requisição
        next(); // Continua para a próxima função (rota)
    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
}
