import express  from "express";
import bycrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis do .env

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); // Cria o cliente do Supabase

// Rota para registro de Usuario
router.post("/register", async (request, response) => {
    const {
        login,
        email,
        senha,
        nome,
        generos_favoritos,
        duracao_preferida,
        frequencia_assistir_filmes,
    } = request.body; // Extrai os dados do corpo da requisição

    if(
        !login|| !email || !senha || !nome || !Array.isArray(generos_favoritos) || !duracao_preferida || !frequencia_assistir_filmes

    ){
        return response.status(400).json({ error: "Todos os campos são obrigatórios e devem estar no formato correto" }); // Verifica se todos os campos foram preenchidos
    }

    //verificar se login ou email já existem
    const{ data : existente , error : consultaError}= await supabase
        .from("usuario_auth")
        .select(" * ")
        .or(`login.eq.${login},email.eq.${email}`);

    if (consultaError){
        return response.status(500).json({error: "Error ao consultar Usuario: " + consultaError.message});
    }

    if (existente.length > 0){
        return response.status(500).json({error: "Já existe Usuario com esse Login ou Email"});
    }

    try {
        //Criptografar Senha
        const senhaCriptografada = await  bycrypt.hash(senha,10);
        //inserir em usuario_auth
        const {data: usuarioAuth , error : errorAuth} = await supabase
            .from("usuario_auth")
            .insert([{login , email , senha:senhaCriptografada}])
            .select();

        if (errorAuth) throw errorAuth;

        const usuario_auth_id = usuarioAuth[0].id;

        //insere em usuarios
        const { data: usuario , error: errorUsuario } = await supabase
            .from("usuarios")
            .insert([{nome, usuario_auth_id}])
            .select();

        if(errorUsuario) throw errorUsuario;

        const usuario_id = usuario[0].id

        // Insere em preferencias
        const { error: errorPreferencia } = await supabase
            .from("preferencias")
            .insert([
                {
                    usuario_id,
                    generos_favoritos,
                    duracao_preferida,
                    frequencia_assistir_filmes,
                },
            ]);

        if (errorPreferencia) throw errorPreferencia;

        response.status(201).json({
            message: "Usuário registrado com sucesso!",
            usuario_id,
        });

    } catch (error) {
        response.status(500).json({ error: "Erro ao registrar usuário: " + error.message });
    }
});

export default router;