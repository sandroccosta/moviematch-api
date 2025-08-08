import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/public/auth.js";
import filmeRoutes from "./routes/public/filme.js";
import perfilRoutes from "./routes/private/perfi.js";
import preferenciasRoutesPrivadas from "./routes/private/preferencias.js";
import recomendacoesRoutes from "./routes/private/recomendacoes.js";
import supabase from "./services/supabaseClient.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use("/auth", authRoutes);
app.use("/filme", filmeRoutes);

// Rotas privadas
app.use("/perfil", perfilRoutes);
app.use("/preferencias", preferenciasRoutesPrivadas);
app.use("/recomendacoes", recomendacoesRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "API MovieMatch está online" });
});

// Teste Supabase
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.from("usuarios").select("*");
    if (error) throw error;
    res.status(200).json({ status: "Conexão com Supabase funcionando!", usuarios: data });
  } catch (err) {
    res.status(500).json({ status: "Erro ao conectar com o Supabase", erro: err.message });
  }
});

// Inicializa servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
