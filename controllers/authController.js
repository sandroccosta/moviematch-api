import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function registrarUsuario(req, res) {
    const {
        login, email, senha, nome,
        generos_favoritos, duracao_preferida, frequencia_assistir_filmes
    } = req.body;

    if (
        !login || !email || !senha || !nome ||
        !Array.isArray(generos_favoritos) ||
        !duracao_preferida || !frequencia_assistir_filmes
    ) {
        return res.status(400).json({ error: "Preencha todos os campos corretamente." });
    }

    try {
        const { data: existente, error: consultaError } = await supabase
            .from("usuario_auth")
            .select("*")
            .or(`login.eq.${login},email.eq.${email}`);

        if (consultaError) throw consultaError;
        if (existente.length > 0) {
            return res.status(400).json({ error: "Login ou e-mail já existentes." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { data: usuarioAuth, error: errorAuth } = await supabase
            .from("usuario_auth")
            .insert([{ login, email, senha: senhaCriptografada }])
            .select();

        if (errorAuth) throw errorAuth;

        const usuario_auth_id = usuarioAuth[0].id;

        const { data: usuario, error: errorUsuario } = await supabase
            .from("usuarios")
            .insert([{ nome, usuario_auth_id }])
            .select();

        if (errorUsuario) throw errorUsuario;

        const usuario_id = usuario[0].id;

        const { error: errorPreferencia } = await supabase
            .from("preferencias")
            .insert([{ usuario_id, generos_favoritos, duracao_preferida, frequencia_assistir_filmes }]);

        if (errorPreferencia) throw errorPreferencia;

        return res.status(201).json({
            message: "Usuário registrado com sucesso!",
            usuario_id
        });
    } catch (err) {
        return res.status(500).json({ error: "Erro ao registrar: " + err.message });
    }
}

export async function loginUsuario(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    try {
        const { data: usuarios, error: consultaError } = await supabase
            .from("usuario_auth")
            .select("*")
            .eq("email", email);

        if (consultaError) throw consultaError;
        if (!usuarios || usuarios.length === 0) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        const usuario = usuarios[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        const token = jwt.sign(
            { usuario_auth_id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login realizado com sucesso.",
            token,
            usuario_auth_id: usuario.id
        });
    } catch (err) {
        return res.status(500).json({ error: "Erro no login: " + err.message });
    }
}
