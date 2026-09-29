// ============================================================
// UTILITÁRIOS DE IMAGEM
// As imagens enviadas pelo painel ficam no Google Drive e são salvas
// na planilha no formato "https://lh3.googleusercontent.com/d/ID".
// ============================================================

// Converte links antigos do Google Drive (que abrem uma página, e não a
// imagem em si) para o formato que funciona direto em <Image>.
//   drive.google.com/file/d/ID/view     → lh3.googleusercontent.com/d/ID
//   drive.google.com/open?id=ID         → lh3.googleusercontent.com/d/ID
//   drive.google.com/uc?export=view&id= → lh3.googleusercontent.com/d/ID
function normalizarLinkDrive(url) {
  const texto = String(url || '').trim();
  if (!/drive\.google\.com/.test(texto)) return texto;
  const porCaminho = texto.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  const porParametro = texto.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  const id = (porCaminho && porCaminho[1]) || (porParametro && porParametro[1]);
  return id ? `https://lh3.googleusercontent.com/d/${id}` : texto;
}

// Devolve a URL pronta para exibir. Para imagens do Google Drive, pede
// ao Google uma versão já redimensionada (sufixo "=wLARGURA"): a imagem
// carrega bem mais rápido no celular e usa menos memória.
export function urlImagemOtimizada(url, largura = 1200) {
  const texto = normalizarLinkDrive(url);
  if (!texto) return '';
  if (/^https:\/\/lh3\.googleusercontent\.com\/d\/[a-zA-Z0-9_-]+$/.test(texto)) {
    return `${texto}=w${largura}`;
  }
  return texto;
}

// Remove itens vazios e repetidos de uma lista de URLs, mantendo a ordem.
export function urlsUnicas(lista) {
  const vistos = new Set();
  return (lista || [])
    .map(u => String(u || '').trim())
    .filter(u => {
      if (!u || u.startsWith('#') || vistos.has(u)) return false;
      vistos.add(u);
      return true;
    });
}
