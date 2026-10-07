import { supabase } from '../supabase/config';

// ============================================================
// BUSCAR DADOS PÚBLICOS
// Mantém o mesmo formato que o aplicativo recebia do Apps Script
// ============================================================
export async function buscarTudo() {
  try {
    // ==========================================================
    // IGREJAS
    // ==========================================================
    const { data: igrejasDB, error: igrejasError } = await supabase
      .from('igrejas')
      .select('*')
      .order('ordem', { ascending: true });

    if (igrejasError) throw igrejasError;

    // Apenas igrejas ativas, como acontecia no Apps Script
    const igrejas = (igrejasDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Nome: item.nome,
        Cor: item.cor,
        Logo: item.logo,
        FotoPrincipal: item.foto_principal,
        Galeria: item.galeria,
        Endereco: item.endereco,
        GoogleMaps: item.google_maps,
        WhatsApp: item.whatsapp,
        Instagram: item.instagram,
        Facebook: item.facebook,
        Youtube: item.youtube,
        Ordem: item.ordem,
        Status: item.status,
      }));

    // Mapa para descobrir o nome da igreja através do igreja_id
    const igrejasPorId = {};

    igrejas.forEach(igreja => {
      igrejasPorId[igreja.ID] = igreja.Nome;
    });

    // ==========================================================
    // HORÁRIOS
    // ==========================================================
    const { data: horariosDB, error: horariosError } = await supabase
      .from('horarios')
      .select('*');

    if (horariosError) throw horariosError;

    const horarios = (horariosDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Igreja: igrejasPorId[item.igreja_id] || '',
        Nome: item.nome,
        Tipo: item.tipo,
        Data: item.data,
        Hora: item.hora,
        HoraFim: item.hora_fim,
        Recorrencia: item.recorrencia,
        Observacao: item.observacao,
        Status: item.status,
      }));

    // ==========================================================
    // AVISOS
    // ==========================================================
    const { data: avisosDB, error: avisosError } = await supabase
      .from('avisos')
      .select('*');

    if (avisosError) throw avisosError;

    const avisos = (avisosDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Igreja: igrejasPorId[item.igreja_id] || '',
        Titulo: item.titulo,
        Texto: item.texto,
        Prioridade: item.prioridade,
        Data: item.data,
        Status: item.status,
      }));

    // ==========================================================
    // EVENTOS
    // ==========================================================
    const { data: eventosDB, error: eventosError } = await supabase
      .from('eventos')
      .select('*');

    if (eventosError) throw eventosError;

    const eventos = (eventosDB || [])
      .filter(
        item =>
          String(item.status || '').toLowerCase() !== 'inativo'
      )
      .map(item => ({
        ID: item.id,
        Igreja: igrejasPorId[item.igreja_id] || '',
        Nome: item.nome,
        Descricao: item.descricao,
        Data: item.data,
        Hora: item.hora,
        HoraFim: item.hora_fim,
        Local: item.local,
        Status: item.status,
      }));

    // ==========================================================
    // PIX
    // ==========================================================
    const { data: pixDB, error: pixError } = await supabase
      .from('pix')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (pixError) throw pixError;

    const pix = pixDB
      ? {
          QRCode: pixDB.qrcode,
          TipoChave: pixDB.tipo_chave,
          Chave: pixDB.chave,
          Favorecido: pixDB.favorecido,
          Banco: pixDB.banco,
          Mensagem: pixDB.mensagem,
          Tutorial: pixDB.tutorial,
        }
      : {};

    // ==========================================================
    // CONFIGURAÇÕES
    // ==========================================================
    const { data: configDB, error: configError } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (configError) throw configError;

    const config = configDB
      ? {
          nomeParoquia: configDB.nome_paroquia,
          logoPrincipal: configDB.logo_principal,
          imagemTelaInicial: configDB.imagem_tela_inicial,
          fraseRodape: configDB.frase_rodape,
          telefone: configDB.telefone,
          email: configDB.email,
          whatsapp: configDB.whatsapp,
          instagram: configDB.instagram,
          facebook: configDB.facebook,
          youtube: configDB.youtube,
          site: configDB.site,
          drive: configDB.drive,
          redeSocialNome: configDB.rede_social_nome,
          redeSocialImagem: configDB.rede_social_imagem,
          endereco: configDB.endereco,
        }
      : {};

    // ==========================================================
    // RETORNO
    // ==========================================================
    return {
      ok: true,
      igrejas,
      horarios,
      avisos,
      eventos,
      pix,
      config,
    };

  } catch (erro) {
    console.error('Erro ao buscar dados do Supabase:', erro);

    return {
      ok: false,
      erro: erro.message || String(erro),
    };
  }
}