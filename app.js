import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import authRoutes from "./routes/public/auth.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);


// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "API MovieMatch está online" });
});

// Teste Supabase
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.from("usuarios").select("*");
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

// Inicializa servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
