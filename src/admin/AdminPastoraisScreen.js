import React from 'react';
import { salvarPastoralMovimento, excluirPastoralMovimento } from '../api/api';
import AdminCrudScreen from './components/AdminCrudScreen';

const CATEGORIAS = [
  'Pastoral',
  'Movimento',
  'Associação',
  'Grupo',
  'Ministério',
  'Serviço',
  'Confraria',
  'Irmandade',
  'Comunidade',
  'Outro',
];

const config = {
  chaveDados: 'pastoraisMovimentos',

  tituloPlural: 'Pastorais, Movimentos e Grupos',
  tituloSingular: 'Pastoral / Movimento / Grupo',

  entidadeHistorico: 'PASTORAL_MOVIMENTO',

  colunasResumo: [
    {
      formatar: item => item.Nome || 'Sem nome',
    },
    {
      formatar: item =>
        item.CategoriaPersonalizada ||
        item.Categoria ||
        'Outro',
    },
    {
      campo: 'Status',
    },
  ],

  campos: [
    {
      nome: 'Nome',
      rotulo: 'Nome da pastoral, movimento ou grupo',
      tipo: 'text',
    },
    {
      nome: 'Categoria',
      rotulo: 'Categoria',
      tipo: 'select',
      opcoes: CATEGORIAS,
      padrao: 'Outro',
    },
    {
      nome: 'CategoriaPersonalizada',
      rotulo: 'Categoria personalizada (se necessário)',
      tipo: 'text',
    },
    {
      nome: 'Lema',
      rotulo: 'Lema ou frase (opcional)',
      tipo: 'text',
    },
    {
      nome: 'Capa',
      rotulo: 'Imagem de capa',
      tipo: 'imagem',
      formatoImagem: 'livre',
    },
    {
      nome: 'Sobre',
      rotulo: 'Sobre nós',
      tipo: 'textarea',
    },
    {
      nome: 'Atividades',
      rotulo: 'O que fazemos?',
      tipo: 'textarea',
    },
    {
      nome: 'Objetivo',
      rotulo: 'Objetivo (opcional)',
      tipo: 'textarea',
    },
    {
      nome: 'DiasEncontros',
      rotulo: 'Dias e horários dos encontros (opcional)',
      tipo: 'textarea',
    },
    {
      nome: 'Logo',
      rotulo: 'Logotipo (opcional)',
      tipo: 'imagem',
      formatoImagem: 'livre',
    },
    {
      nome: 'WhatsApp',
      rotulo: 'WhatsApp com DDI e DDD (somente números)',
      tipo: 'text',
    },
    {
      nome: 'TextoBotaoContato',
      rotulo: 'Texto do botão de contato (opcional)',
      tipo: 'text',
    },
    {
      nome: 'Ordem',
      rotulo: 'Ordem de exibição',
      tipo: 'number',
      padrao: '0',
    },
    {
      nome: 'Status',
      rotulo: 'Status',
      tipo: 'select',
      opcoes: ['Ativo', 'Inativo'],
      padrao: 'Inativo',
    },
  ],

  salvar: salvarPastoralMovimento,
  excluir: excluirPastoralMovimento,
};

export default function AdminPastoraisScreen() {
  return <AdminCrudScreen config={config} />;
}