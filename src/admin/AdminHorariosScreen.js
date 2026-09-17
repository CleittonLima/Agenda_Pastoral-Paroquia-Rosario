import React from 'react';
import { salvarHorario, excluirHorario } from '../api/api';
import AdminCrudScreen from './components/AdminCrudScreen';

const config = {
  chaveDados: 'horarios',
  tituloPlural: 'Horários',
  tituloSingular: 'Horário',
  agruparPorIgreja: true,
  ordenar: (a, b) => `${a.Data}${a.Hora}`.localeCompare(`${b.Data}${b.Hora}`),
  colunasResumo: [
    { formatar: (item) => item.Nome },
    { formatar: (item) => `${item.Tipo} · ${item.Data}` },
    { formatar: (item) => item.HoraFim ? `${item.Hora} às ${item.HoraFim}` : item.Hora },
  ],
  campos: [
    { nome: 'Igreja', rotulo: 'Igreja', tipo: 'select-igreja' },
    { nome: 'Nome', rotulo: 'Nome da atividade', tipo: 'text' },
    {
      nome: 'Tipo', rotulo: 'Tipo', tipo: 'select',
      opcoes: ['Missa', 'Confissão', 'Adoração', 'Batismo', 'Crisma', 'Novena', 'Terço', 'Celebração', 'Reunião', 'Outro'],
    },
    { nome: 'Data', rotulo: 'Data (referência do dia da semana — sempre mostra a próxima ocorrência)', tipo: 'date' },
    { nome: 'Hora', rotulo: 'Hora (início)', tipo: 'time' },
    { nome: 'HoraFim', rotulo: 'Hora final (opcional)', tipo: 'time' },
    { nome: 'Recorrencia', rotulo: 'Recorrência', tipo: 'select', opcoes: ['Semanal', 'Quinzenal', 'Mensal — 1ª semana', 'Mensal — 2ª semana', 'Mensal — 3ª semana', 'Mensal — 4ª semana', 'Mensal — última semana', 'Mensal — todo mês', 'Anual', 'Único (uma vez só)'], padrao: 'Semanal' },
    { nome: 'Observacao', rotulo: 'Observação', tipo: 'textarea' },
    { nome: 'Status', rotulo: 'Status', tipo: 'select', opcoes: ['Ativo', 'Inativo'], padrao: 'Ativo' },
  ],
  salvar: salvarHorario,
  excluir: excluirHorario,
};

export default function AdminHorariosScreen() {
  return <AdminCrudScreen config={config} />;
}
