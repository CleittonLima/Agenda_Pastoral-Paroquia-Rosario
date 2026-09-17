import React from 'react';
import { salvarAviso, excluirAviso } from '../api/api';
import AdminCrudScreen from './components/AdminCrudScreen';

const config = {
  chaveDados: 'avisos',
  tituloPlural: 'Avisos',
  tituloSingular: 'Aviso',
  agruparPorIgreja: true,
  ordenar: (a, b) => String(a.Data).localeCompare(String(b.Data)),
  colunasResumo: [
    { formatar: (item) => item.Titulo },
    { formatar: (item) => `${item.Prioridade} · ${item.Data}` },
  ],
  campos: [
    { nome: 'Igreja', rotulo: 'Igreja', tipo: 'select-igreja' },
    { nome: 'Titulo', rotulo: 'Título', tipo: 'text' },
    { nome: 'Texto', rotulo: 'Texto', tipo: 'textarea' },
    { nome: 'Prioridade', rotulo: 'Prioridade', tipo: 'select', opcoes: ['Normal', 'Importante', 'Urgente'] },
    { nome: 'Data', rotulo: 'Data (some da lista no dia seguinte a esta)', tipo: 'date' },
    { nome: 'Status', rotulo: 'Status', tipo: 'select', opcoes: ['Ativo', 'Inativo'], padrao: 'Ativo' },
  ],
  salvar: salvarAviso,
  excluir: excluirAviso,
};

export default function AdminAvisosScreen() {
  return <AdminCrudScreen config={config} />;
}
