import React from 'react';
import { salvarIgreja, excluirIgreja } from '../api/api';
import AdminCrudScreen from './components/AdminCrudScreen';

const config = {
  chaveDados: 'igrejas',
  tituloPlural: 'Área Pastoral',
  tituloSingular: 'Igreja/Capela',
  colunasResumo: [
    { formatar: (item) => item.Nome },
    { campo: 'Endereco' },
    { campo: 'Status' },
  ],
  campos: [
    { nome: 'Nome', rotulo: 'Nome', tipo: 'text' },
    { nome: 'Cor', rotulo: 'Cor de identificação', tipo: 'color' },
    { nome: 'FotoPrincipal', rotulo: 'Foto principal (proporção 4:3)', tipo: 'imagem' },
    { nome: 'Endereco', rotulo: 'Endereço', tipo: 'text' },
    { nome: 'GoogleMaps', rotulo: 'Link do Google Maps', tipo: 'url' },
    { nome: 'WhatsApp', rotulo: 'WhatsApp (DDI + DDD, só números)', tipo: 'text' },
    { nome: 'Instagram', rotulo: 'Instagram (opcional)', tipo: 'url' },
    { nome: 'Facebook', rotulo: 'Facebook (opcional)', tipo: 'url' },
    { nome: 'Youtube', rotulo: 'Youtube (opcional)', tipo: 'url' },
    { nome: 'Ordem', rotulo: 'Ordem de exibição', tipo: 'number', padrao: '1' },
    { nome: 'Status', rotulo: 'Status', tipo: 'select', opcoes: ['Ativo', 'Inativo'], padrao: 'Ativo' },
  ],
  salvar: salvarIgreja,
  excluir: excluirIgreja,
};

export default function AdminIgrejasScreen() {
  return <AdminCrudScreen config={config} />;
}
