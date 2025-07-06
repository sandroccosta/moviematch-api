// services/supabaseClient.js
//Importa o sdk do supaBase para node.js
const { createClient } = require("@supabase/supabase-js");

// lê as variáveis de ambiente do arquivo .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

//verificar se as variáveis de ambiente estão definidas
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem ser definidas no arquivo .env"
  );
}

//cria a instacia do cliente do supaBase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

//exporta o cliente do supaBase para ser usado em outras partes da aplicacao
module.exports = supabase;
