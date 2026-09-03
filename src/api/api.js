// ============================================================
// COLE AQUI A URL DO SEU APPS SCRIPT (a mesma do site)
// ============================================================
const URL_API =
  'https://script.google.com/macros/s/AKfycbwBc-xtZ1bLuxkqTCKQDqI-bh533x2h20cuS5CrWtjCNdxxCDR4L8KzUqdxl6e5KfgoAA/exec';

async function chamarApi(action, dados = {}) {
  const resposta = await fetch(URL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, dados }),
  });
  return resposta.json();
}

// Leitura pública — usada pelo app na abertura
export async function buscarTudo() {
  return chamarApi('getData', {});
}

// Leitura completa — painel do coordenador (inclui Inativos)
export async function buscarTudoAdmin(senha) {
  return chamarApi('adminGetData', { senha });
}

// Login / senha
export async function login(senha) {
  return chamarApi('login', { senha });
}
export async function trocarSenha(senhaAtual, novaSenha) {
  return chamarApi('adminTrocarSenha', { senhaAtual, novaSenha });
}

// CRUD — Igrejas
export async function salvarIgreja(senha, item) {
  return chamarApi('adminSalvarIgreja', { senha, item });
}
export async function excluirIgreja(senha, id) {
  return chamarApi('adminExcluirIgreja', { senha, id });
}

// CRUD — Horários
export async function salvarHorario(senha, item) {
  return chamarApi('adminSalvarHorario', { senha, item });
}
export async function excluirHorario(senha, id) {
  return chamarApi('adminExcluirHorario', { senha, id });
}

// CRUD — Avisos
export async function salvarAviso(senha, item) {
  return chamarApi('adminSalvarAviso', { senha, item });
}
export async function excluirAviso(senha, id) {
  return chamarApi('adminExcluirAviso', { senha, id });
}

// CRUD — Eventos
export async function salvarEvento(senha, item) {
  return chamarApi('adminSalvarEvento', { senha, item });
}
export async function excluirEvento(senha, id) {
  return chamarApi('adminExcluirEvento', { senha, id });
}

// PIX
export async function salvarPix(senha, item) {
  return chamarApi('adminSalvarPix', { senha, item });
}

// Configurações gerais
export async function salvarConfiguracoes(senha, item) {
  return chamarApi('adminSalvarConfiguracoes', { senha, item });
}
