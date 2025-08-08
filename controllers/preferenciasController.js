import supabase from "../services/supabaseClient.js";

export async function obterPreferencias(req, res) {
    const usuario_auth_id = req.usuario?.usuario_auth_id;

    if (!usuario_auth_id) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }

    try {
        const { data: usuarios, error: erroUsuario } = await supabase
            .from("usuarios")
            .select("id")
            .eq("usuario_auth_id", usuario_auth_id);

        if (erroUsuario) throw erroUsuario;
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const usuario_id = usuarios[0].id;

        const { data: preferencias, error: erroPreferencias } = await supabase
            .from("preferencias")
            .select("*")
            .eq("usuario_id", usuario_id);

        if (erroPreferencias) throw erroPreferencias;
        if (!preferencias || preferencias.length === 0) {
            return res.status(404).json({ error: "Nenhuma preferência encontrada." });
        }

        return res.status(200).json({ preferencias: preferencias[0] });
    } catch (err) {
        return res.status(500).json({ error: "Erro ao buscar preferências: " + err.message });
    }
}
