import { createClient } from "@supabase/supabase-js";

const CARGOS_PERMITIDOS = [
  "PROGRAMADOR",
  "PADRE",
  "COORDENADOR",
  "PASCOM",
];

const CABECALHOS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function resposta(dados: unknown, status = 200): Response {
  return new Response(JSON.stringify(dados), {
    status,
    headers: CABECALHOS,
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CABECALHOS });
  }

  if (req.method !== "POST") {
    return resposta(
      { erro: "Método não permitido." },
      405,
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return resposta(
        { erro: "Configuração interna incompleta." },
        500,
      );
    }

    // 1. Verificar a sessão do usuário.
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return resposta({ erro: "Não autenticado." }, 401);
    }

    const supabaseUsuario = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authorization },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    const {
      data: { user },
      error: erroUsuario,
    } = await supabaseUsuario.auth.getUser();

    if (erroUsuario || !user) {
      return resposta(
        { erro: "Sessão inválida ou expirada." },
        401,
      );
    }

    // 2. Criar cliente administrativo somente no servidor.
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );

    // 3. Consultar o perfil verdadeiro do administrador.
    const {
      data: perfil,
      error: erroPerfil,
    } = await supabaseAdmin
      .from("perfis_admin")
      .select("id, nome, cargo, ativo")
      .eq("id", user.id)
      .maybeSingle();

    if (
      erroPerfil ||
      !perfil ||
      !perfil.ativo ||
      !CARGOS_PERMITIDOS.includes(perfil.cargo)
    ) {
      return resposta(
        { erro: "Acesso negado." },
        403,
      );
    }

    // 4. Validar os dados da alteração.
    const corpo = await req.json();

    const acoesPermitidas = [
      "CRIAR",
      "EDITAR",
      "EXCLUIR",
      "ATIVAR",
      "DESATIVAR",
      "LOGIN",
      "LOGOUT",
    ];

    const entidadesPermitidas = [
      "IGREJA",
      "HORARIO",
      "AVISO",
      "EVENTO",
      "ORACAO",
      "TERCO",
      "IMAGEM",
      "PIX",
      "CONFIGURACAO",
      "CONTEUDO_RELIGIOSO",
      "USUARIO",
      "PERFIL",
    ];

    const acao = String(corpo?.acao ?? "").trim().toUpperCase();
    const entidade = String(
      corpo?.entidade ?? "",
    ).trim().toUpperCase();

    const descricao = String(
      corpo?.descricao ?? "",
    ).trim();

    if (
      !acoesPermitidas.includes(acao) ||
      !entidadesPermitidas.includes(entidade) ||
      !descricao
    ) {
      return resposta(
        {
          erro:
            "Informe uma ação, entidade e descrição válidas.",
        },
        400,
      );
    }

    if (descricao.length > 500) {
      return resposta(
        { erro: "A descrição deve ter no máximo 500 caracteres." },
        400,
      );
    }

    // 5. Registrar o histórico com a identidade confirmada.
    const detalhes =
      corpo?.detalhes &&
      typeof corpo.detalhes === "object" &&
      !Array.isArray(corpo.detalhes)
        ? corpo.detalhes
        : {};

    const {
      error: erroRegistro,
    } = await supabaseAdmin
      .from("historico_alteracoes")
      .insert({
        usuario_id: perfil.id,
        usuario_nome: perfil.nome,
        usuario_cargo: perfil.cargo,
        acao,
        entidade,
        descricao,
        detalhes,
      });

    if (erroRegistro) {
      console.error(
        "Erro ao registrar histórico:",
        erroRegistro.message,
      );

      return resposta(
        { erro: "Não foi possível registrar a alteração." },
        500,
      );
    }

    return resposta({
      ok: true,
      mensagem: "Registro realizado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro inesperado:", erro);

    return resposta(
      { erro: "Ocorreu um erro interno." },
      500,
    );
  }
});