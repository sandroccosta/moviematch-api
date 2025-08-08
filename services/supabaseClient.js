import  { createClient } from '@supabase/supabase-js'; // Importa o cliente do Supabase
import dotenv from 'dotenv'; //

dotenv.config(); // Carrega variáveis do .env

const supaBase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); // Cria o cliente do Supabase com as variáveis de ambiente

export default supaBase; // Exporta o cliente para ser usado em outros arquivos
