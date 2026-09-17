import React from 'react';
import { salvarEvento, excluirEvento } from '../api/api';
import AdminCrudScreen from './components/AdminCrudScreen';

const config = {
  chaveDados: 'eventos',
  tituloPlural: 'Eventos',
  tituloSingular: 'Evento',
  agruparPorIgreja: true,
  ordenar: (a, b) => `${a.Data}${a.Hora || ''}`.localeCompare(`${b.Data}${b.Hora || ''}`),
  colunasResumo: [
    { formatar: (item) => item.Nome },
    { formatar: (item) => `${item.Data} · ${item.Local || ''}` },
  ],
  campos: [
    { nome: 'Igreja', rotulo: 'Igreja', tipo: 'select-igreja' },
    { nome: 'Nome', rotulo: 'Nome do evento', tipo: 'text' },
    { nome: 'Descricao', rotulo: 'Descrição', tipo: 'textarea' },
    { nome: 'Data', rotulo: 'Data (some da lista no dia seguinte a esta)', tipo: 'date' },
    { nome: 'Hora', rotulo: 'Hora (início)', tipo: 'time' },
    { nome: 'HoraFim', rotulo: 'Hora final (opcional)', tipo: 'time' },
    { nome: 'Local', rotulo: 'Local', tipo: 'text' },
    { nome: 'Status', rotulo: 'Status', tipo: 'select', opcoes: ['Ativo', 'Inativo'], padrao: 'Ativo' },
  ],
  salvar: salvarEvento,
  excluir: excluirEvento,
};

export default function AdminEventosScreen() {
  return <AdminCrudScreen config={config} />;
}
