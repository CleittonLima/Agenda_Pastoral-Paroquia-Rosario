// ============================================================
// UTILITÁRIOS DE DATA
// Todas as funções usam a data LOCAL do dispositivo.
// NUNCA use toISOString() — ela converte para UTC e causa
// desalinhamento de dia à noite no fuso do Brasil.
// ============================================================

export function formatarDataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function formatarDataBR(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

export function calcularDiaSemana(dataISO) {
  if (!dataISO) return '';
  const d = new Date(dataISO + 'T00:00:00');
  return DIAS_SEMANA[d.getDay()];
}

export function proximaOcorrenciaDiaSemana(nomeDia) {
  const alvo = DIAS_SEMANA.indexOf(nomeDia);
  if (alvo === -1) return null;
  const hoje = new Date();
  const diferenca = (alvo - hoje.getDay() + 7) % 7;
  hoje.setDate(hoje.getDate() + diferenca);
  return formatarDataLocalISO(hoje);
}

export function dataJaPassou(dataISO) {
  if (!dataISO) return false;
  return dataISO < formatarDataLocalISO(new Date());
}

// Igual a proximaOcorrenciaDiaSemana, mas empurra pra semana seguinte
// quando o horário de hoje já passou (evita mostrar uma missa das 7h
// como "próxima" às 20h do mesmo dia).
export function proximaOcorrenciaDiaSemanaComHora(nomeDia, horaInicio) {
  const dataBase = proximaOcorrenciaDiaSemana(nomeDia);
  if (!dataBase || !horaInicio) return dataBase;

  const agora = new Date();
  if (dataBase !== formatarDataLocalISO(agora)) return dataBase;

  const [h, m] = horaInicio.split(':').map(Number);
  const minutosHorario = h * 60 + (m || 0);
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  if (minutosHorario > minutosAgora) return dataBase;

  const proximaSemana = new Date(agora);
  proximaSemana.setDate(proximaSemana.getDate() + 7);
  return formatarDataLocalISO(proximaSemana);
}

export function linhaDataCompleta(dataISO, horario) {
  if (!dataISO) return '';
  const hora = horario ? ` · ⏰ ${horario}` : '';
  return `📅 ${formatarDataBR(dataISO)} · 📆 ${calcularDiaSemana(dataISO)}${hora}`;
}

// Dia da semana atual (0=Domingo … 6=Sábado) — para mistérios do terço
export function diaSemanaHoje() {
  return new Date().getDay();
}
