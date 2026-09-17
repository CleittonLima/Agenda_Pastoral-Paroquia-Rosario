import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarTudo } from '../api/api';
import {
  formatarDataLocalISO,
  proximaOcorrenciaDiaSemana,
  dataJaPassou,
} from '../utils/datas';

// ============================================================
// CHAVES DO ASYNCSTORAGE
// ============================================================
const CHAVES = {
  usuario: '@paroquia_usuario',
  preferencias: '@paroquia_preferencias',
  dadosCache: '@paroquia_dados_cache',
  temaVisual: '@paroquia_tema_visual',
};

// ============================================================
// VALORES PADRÃO (usados enquanto os dados da API não chegam)
// ============================================================
const DADOS_VAZIOS = {
  igrejas: [],
  horarios: [],
  avisos: [],
  eventos: [],
  pix: null,
  config: null,
};

// ============================================================
// MAPEAMENTO DOS DADOS DA API → FORMATO INTERNO
// (igual ao script.js do site, mas em JS puro sem DOM)
// ============================================================
function valorValido(valor) {
  const texto = String(valor || '').trim();
  return texto.length > 0 && !texto.startsWith('#');
}

function listaDeUrls(texto) {
  return String(texto || '').split(',').map(s => s.trim()).filter(Boolean);
}

function formatarFaixaHorario(inicio, fim) {
  if (valorValido(fim)) return `${inicio} às ${fim}`;
  return inicio || '';
}

function mapearIgreja(linha) {
  return {
    id: linha.ID,
    nome: linha.Nome || '',
    cor: linha.Cor || '#7A1F2B',
    logo: linha.Logo || '',
    imagem: linha.FotoPrincipal || '',
    fotos: listaDeUrls(linha.Galeria).length
      ? listaDeUrls(linha.Galeria)
      : linha.FotoPrincipal ? [linha.FotoPrincipal] : [],
    endereco: linha.Endereco || '',
    contato: valorValido(linha.WhatsApp) ? linha.WhatsApp : '',
    whatsapp: valorValido(linha.WhatsApp) ? linha.WhatsApp : '',
    googleMaps: valorValido(linha.GoogleMaps) ? linha.GoogleMaps : '',
    instagram: valorValido(linha.Instagram) ? linha.Instagram : '',
    facebook: valorValido(linha.Facebook) ? linha.Facebook : '',
    youtube: valorValido(linha.Youtube) ? linha.Youtube : '',
    ordem: Number(linha.Ordem) || 0,
  };
}

function mapearHorario(linha) {
  const diaSemana = calcularDiaSemanaDeData(linha.Data);
  return {
    id: linha.ID,
    igrejaId: linha.Igreja,
    nome: linha.Nome || '',
    tipo: linha.Tipo || '',
    diaSemana,
    data: proximaOcorrenciaDiaSemana(diaSemana),
    horario: formatarFaixaHorario(linha.Hora || '', linha.HoraFim),
    recorrencia: linha.Recorrencia || '',
    descricao: linha.Observacao || '',
  };
}

function mapearAviso(linha) {
  return {
    id: linha.ID,
    igrejaId: linha.Igreja,
    titulo: linha.Titulo || '',
    texto: linha.Texto || '',
    prioridade: linha.Prioridade || 'Normal',
    data: linha.Data || '',
  };
}

function mapearEvento(linha) {
  return {
    id: linha.ID,
    igrejaId: linha.Igreja,
    nome: linha.Nome || '',
    descricao: linha.Descricao || '',
    data: linha.Data || '',
    horario: formatarFaixaHorario(linha.Hora || '', linha.HoraFim),
    local: linha.Local || '',
  };
}

function mapearPix(linha) {
  return {
    chave: linha.Chave || '',
    tipo: linha.TipoChave || '',
    destinatario: linha.Favorecido || '',
    banco: linha.Banco || '',
    qrcode: linha.QRCode || '',
    informacoes: linha.Mensagem || '',
    tutorial: linha.Tutorial || '',
  };
}

function mapearConfiguracoes(linha) {
  return {
    nomeParoquia: linha.NomeParoquia || '',
    logoPrincipal: linha.LogoPrincipal || '',
    imagemTelaInicial: linha.ImagemTelaInicial || '',
    fraseRodape: linha.FraseRodape || '',
    telefone: linha.Telefone || '',
    email: linha.Email || '',
    whatsapp: linha.WhatsApp || '',
    instagram: linha.Instagram || '',
    facebook: linha.Facebook || '',
    youtube: linha.Youtube || '',
    site: linha.Site || '',
    drive: linha.Drive || '',
    endereco: linha.Endereco || '',
    redeSocialNome: linha.RedeSocialNome || '',
    redeSocialImagem: linha.RedeSocialImagem || '',
  };
}

// Calcula o dia da semana por extenso a partir de uma data ISO
function calcularDiaSemanaDeData(dataISO) {
  if (!dataISO) return '';
  const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const d = new Date(dataISO + 'T00:00:00');
  return dias[d.getDay()];
}

// ============================================================
// CONTEXTO
// ============================================================
const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Dados da API
  const [dados, setDados] = useState(DADOS_VAZIOS);
  const [carregando, setCarregando] = useState(true);
  const [comErro, setComErro] = useState(false);
  const [semInternet, setSemInternet] = useState(false);

  // Usuário e preferências
  const [usuario, setUsuario] = useState(null);
  const [preferencias, setPreferencias] = useState({
    tema: 'claro',
    altoContraste: false,
    daltonismo: 'nenhum',
    reduzirAnimacoes: false,
  });
  const [temaVisual, setTemaVisual] = useState('cristo');

  // ---- Carregamento inicial ----
  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setCarregando(true);
    setComErro(false);

    // Carrega preferências do usuário (sempre locais)
    await carregarPreferenciasLocais();

    // Tenta buscar dados frescos da API
    try {
      const resposta = await buscarTudo();
      if (resposta && resposta.ok !== false) {
        const dadosMapeados = processarDadosAPI(resposta);
        setDados(dadosMapeados);
        setSemInternet(false);
        // Salva cache para uso offline
        await AsyncStorage.setItem(CHAVES.dadosCache, JSON.stringify(dadosMapeados));
      } else {
        throw new Error('API retornou erro');
      }
    } catch (erro) {
      // Sem internet ou erro na API — tenta usar cache
      const cache = await AsyncStorage.getItem(CHAVES.dadosCache);
      if (cache) {
        setDados(JSON.parse(cache));
        setSemInternet(true);
      } else {
        setComErro(true);
      }
    } finally {
      setCarregando(false);
    }
  }

  function processarDadosAPI(resposta) {
    const igrejas = (resposta.igrejas || [])
      .filter(i => String(i.Status || '').toLowerCase() !== 'inativo')
      .map(mapearIgreja)
      .sort((a, b) => a.ordem - b.ordem);

    const horarios = (resposta.horarios || [])
      .filter(h => String(h.Status || '').toLowerCase() !== 'inativo')
      .map(mapearHorario)
      .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));

    const avisos = (resposta.avisos || [])
      .filter(a => String(a.Status || '').toLowerCase() !== 'inativo' && !dataJaPassou(a.Data))
      .map(mapearAviso)
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    const eventos = (resposta.eventos || [])
      .filter(e => String(e.Status || '').toLowerCase() !== 'inativo' && !dataJaPassou(e.Data))
      .map(mapearEvento)
      .sort((a, b) => new Date(a.data) - new Date(b.data));

    return {
      igrejas,
      horarios,
      avisos,
      eventos,
      pix: resposta.pix ? mapearPix(resposta.pix) : null,
      config: resposta.config ? mapearConfiguracoes(resposta.config) : null,
    };
  }

  async function carregarPreferenciasLocais() {
    try {
      const u = await AsyncStorage.getItem(CHAVES.usuario);
      if (u) setUsuario(JSON.parse(u));
      const p = await AsyncStorage.getItem(CHAVES.preferencias);
      if (p) setPreferencias(JSON.parse(p));
      const t = await AsyncStorage.getItem(CHAVES.temaVisual);
      if (t) setTemaVisual(t);
    } catch (_) {}
  }

  // ---- Helpers para listas filtradas ----
  function listarHorarios(igrejaId = null) {
    const lista = dados.horarios.map(h => ({
      ...h,
      data: proximaOcorrenciaDiaSemana(h.diaSemana),
    }));
    if (igrejaId) return lista.filter(h => h.igrejaId === igrejaId);
    return lista;
  }

  function listarAvisos(igrejaId = null) {
    if (igrejaId) return dados.avisos.filter(a => a.igrejaId === igrejaId);
    return dados.avisos;
  }

  function listarEventos(igrejaId = null) {
    if (igrejaId) return dados.eventos.filter(e => e.igrejaId === igrejaId);
    return dados.eventos;
  }

  function obterIgreja(id) {
    return dados.igrejas.find(i => i.id === id) || null;
  }

  function nomeIgreja(id) {
    const i = obterIgreja(id);
    return i ? i.nome : '';
  }

  function corIgreja(id) {
    const i = obterIgreja(id);
    return i ? i.cor : '#7A1F2B';
  }

  // ---- Usuário ----
  async function salvarUsuario(dados) {
    setUsuario(dados);
    await AsyncStorage.setItem(CHAVES.usuario, JSON.stringify(dados));
  }

  async function salvarPreferencias(prefs) {
    setPreferencias(prefs);
    await AsyncStorage.setItem(CHAVES.preferencias, JSON.stringify(prefs));
  }

  async function salvarTemaVisual(tema) {
    setTemaVisual(tema);
    await AsyncStorage.setItem(CHAVES.temaVisual, tema);
  }

  // Toca no tema: se já é o tema ativo, alterna entre claro/escuro;
  // se é outro tema, seleciona ele (sempre começando no modo claro)
  async function selecionarTemaVisual(temaId) {
    if (temaVisual === temaId) {
      const novoModo = preferencias.tema === 'escuro' ? 'claro' : 'escuro';
      await salvarPreferencias({ ...preferencias, tema: novoModo });
    } else {
      await salvarTemaVisual(temaId);
      if (preferencias.tema !== 'claro') {
        await salvarPreferencias({ ...preferencias, tema: 'claro' });
      }
    }
  }

  async function limparDadosLocais() {
    await AsyncStorage.multiRemove([CHAVES.usuario, CHAVES.preferencias, CHAVES.temaVisual]);
    setUsuario(null);
    setPreferencias({ tema: 'claro', altoContraste: false, daltonismo: 'nenhum', reduzirAnimacoes: false });
    setTemaVisual('cristo');
  }

  return (
    <AppContext.Provider value={{
      // Estado
      dados, carregando, comErro, semInternet,
      usuario, preferencias, temaVisual,
      // Ações
      recarregar: carregarTudo,
      salvarUsuario, salvarPreferencias, salvarTemaVisual, selecionarTemaVisual, limparDadosLocais,
      // Helpers
      listarHorarios, listarAvisos, listarEventos,
      obterIgreja, nomeIgreja, corIgreja, valorValido,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
