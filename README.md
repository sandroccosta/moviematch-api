# 🎬 MovieMatch API

API REST para o MovieMatch – uma plataforma que recomenda filmes com base nas preferências de cada usuário.

---

##  Tecnologias

- **Node.js + Express** – Backend e rotas REST
- **Supabase (PostgreSQL)** – Banco de dados
- **OMDb API** – Integração para busca de filmes
- **JWT** – Autenticação por token
- **Bcrypt** – Criptografia de senhas
- **Postman** – Testes manuais

---

## 🚀 Primeira Versão (Deploy Inicial)

### ✅ Funcionalidades Implementadas

- **Registro de usuário** com:
    - `login`, `email`, `senha`, `nome`
    - **Preferências**: gêneros, duração, frequência
    - **Hash seguro da senha** (bcrypt)
    - Salvamento em 3 tabelas: `usuarios_auth`, `usuarios`, `preferencias`
- **Login** com geração de token JWT
- **Middleware** para rotas protegidas
- **Rotas protegidas:**
    - `GET /preferencias` – Retorna as preferências do usuário autenticado
    - `GET /recomendacoes` – Busca filmes por gênero via OMDb
- **Rota pública:** `GET /health` – Verifica se a API está online

---

## 🔐 Segurança

- Variáveis sensíveis estão protegidas em `.env`
- JWT assinado com segredo seguro (`JWT_SECRET`)
- Senhas nunca são armazenadas em texto puro

---

## 🛠 Como rodar o projeto localmente

```bash
git clone https://github.com/seu-usuario/moviematch-api.git
cd moviematch-api
npm install
cp .env.example .env  # Edite com suas chaves reais
npm run dev
