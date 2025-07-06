//Importa o framework Express
const express = require("express");

//importa o middleware Cors para permite que o frontend acesse a API
const cors = require("cors");

//Carrega variaveis de ambiente no arquivo .env (como url do supaBase , apiKey, etc)
require("dotenv").config();

//inicializar o express
const app = express();

//ativa o uso do cors
app.use(cors());

//permite que a API receba dados em Json no corpo da requisição
app.use(express.json());

//define uma rota GET simples para testar se a api estar no ar
app.get("/health", (req, res) => {
  //enviar uma resposta json com status 200
  res.status(200).json({ message: "API MovieMatch está online" });
});

const supabase = require("./services/supabaseClient");

app.get("/test-supabase", async (req, res) => {
  try {
    // Consulta todos os registros da tabela usuarios_auth
    const { data, error } = await supabase.from("usuarios_auth").select("*");

    if (error) throw error;

    res.status(200).json({
      status: "Conexão com Supabase funcionando!",
      usuarios: data,
    });
  } catch (err) {
    res.status(500).json({
      status: "Erro ao conectar com o Supabase",
      erro: err.message,
    });
  }
});

//Inicializa o servidor na porta definida e imprimir no console que está rodando
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
