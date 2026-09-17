import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '../AdminContext';
import AdminHeader from './AdminHeader';
import CampoFormulario from './CampoFormulario';
import ConfirmModal from './ConfirmModal';

export default function AdminCrudScreen({ config }) {
  const { dados, carregando, recarregar, senha, nomeIgrejaPorId } = useAdmin();
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [valores, setValores] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const itensTodos = dados[config.chaveDados] || [];
  const ordenar = (lista) => (config.ordenar ? [...lista].sort(config.ordenar) : lista);

  async function aoAtualizar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  function abrirNovo() {
    const iniciais = {};
    config.campos.forEach(c => { if (c.padrao !== undefined) iniciais[c.nome] = c.padrao; });
    setItemEditando(null);
    setValores(iniciais);
    setModalAberto(true);
  }

  function abrirEdicao(item) {
    setItemEditando(item);
    setValores({ ...item });
    setModalAberto(true);
  }

  function mudarCampo(nome, valor) {
    setValores(v => ({ ...v, [nome]: valor }));
  }

  async function salvar() {
    setSalvando(true);
    const item = { ...valores, ID: itemEditando ? itemEditando.ID : '' };
    const resultado = await config.salvar(senha, item);
    setSalvando(false);
    if (resultado.ok) {
      setModalAberto(false);
      await recarregar();
    } else {
      Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
    }
  }

  function confirmarExclusao(item) {
    setItemParaExcluir(item);
  }

  async function executarExclusao() {
    if (!itemParaExcluir) return;
    setExcluindo(true);
    const resultado = await config.excluir(senha, itemParaExcluir.ID);
    setExcluindo(false);
    setItemParaExcluir(null);
    if (!resultado.ok) {
      Alert.alert('Erro', resultado.erro || 'Não foi possível excluir.');
      return;
    }
    await recarregar();
  }

  function renderCard(item) {
    const inativo = String(item.Status || '').toLowerCase() === 'inativo';
    return (
      <View style={[styles.card, inativo && styles.cardInativo]} key={item.ID}>
        {config.colunasResumo.map((c, i) => (
          <Text key={i} style={i === 0 ? styles.cardTitulo : styles.cardLinha}>
            {c.formatar ? c.formatar(item, dados.igrejas, nomeIgrejaPorId) : (item[c.campo] || '—')}
          </Text>
        ))}
        {inativo && <Text style={styles.etiquetaInativo}>Inativo</Text>}
        <View style={styles.cardAcoes}>
          <TouchableOpacity style={styles.botaoEditar} onPress={() => abrirEdicao(item)}>
            <Text style={styles.botaoEditarTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoExcluir} onPress={() => confirmarExclusao(item)}>
            <Text style={styles.botaoExcluirTexto}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const conteudoLista = useMemo(() => {
    if (config.agruparPorIgreja) {
      return dados.igrejas.map(igreja => ({
        igreja,
        itens: ordenar(itensTodos.filter(i => i.Igreja === igreja.ID)),
      }));
    }
    return null;
  }, [dados, itensTodos]);

  return (
    <View style={styles.container}>
      <AdminHeader titulo={config.tituloPlural} />
      <View style={styles.topoLista}>
        <TouchableOpacity style={styles.botaoNovo} onPress={abrirNovo}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.botaoNovoTexto}>Novo</Text>
        </TouchableOpacity>
      </View>

      {carregando && !atualizando ? (
        <ActivityIndicator style={{ marginTop: 30 }} color="#7A1F2B" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={['#7A1F2B']} />}
        >
          {config.agruparPorIgreja ? (
            conteudoLista.map(grupo => (
              <View key={grupo.igreja.ID} style={styles.grupoIgreja}>
                <Text style={styles.grupoIgrejaTitulo}>{grupo.igreja.Nome}</Text>
                {grupo.itens.length ? grupo.itens.map(renderCard) : (
                  <Text style={styles.vazio}>Nada cadastrado ainda.</Text>
                )}
              </View>
            ))
          ) : (
            ordenar(itensTodos).length ? ordenar(itensTodos).map(renderCard) : (
              <Text style={styles.vazio}>Nada cadastrado ainda. Toque em "+ Novo" para começar.</Text>
            )
          )}
        </ScrollView>
      )}

      {/* ---- MODAL: FORMULÁRIO ---- */}
      <Modal visible={modalAberto} animationType="slide" transparent onRequestClose={() => setModalAberto(false)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <View style={styles.modalTopo}>
              <Text style={styles.modalTitulo}>{itemEditando ? 'Editar' : 'Novo'} — {config.tituloSingular}</Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}>
                <Ionicons name="close" size={22} color="#2b2320" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
              {config.campos.map(campo => (
                <CampoFormulario
                  key={campo.nome}
                  campo={campo}
                  valor={valores[campo.nome]}
                  onMudar={(v) => mudarCampo(campo.nome, v)}
                  igrejas={dados.igrejas}
                />
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} disabled={salvando}>
              {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoSalvarTexto}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visivel={!!itemParaExcluir}
        titulo="Confirmar exclusão"
        mensagem={excluindo ? 'Excluindo...' : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'}
        textoConfirmar="Excluir"
        onConfirmar={executarExclusao}
        onCancelar={() => setItemParaExcluir(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  topoLista: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 12 },
  botaoNovo: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#7A1F2B',
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14,
  },
  botaoNovoTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
  scroll: { padding: 16, gap: 10, paddingBottom: 32 },
  vazio: { color: '#a89b8c', fontStyle: 'italic', fontSize: 13, marginBottom: 8 },
  grupoIgreja: { marginBottom: 18 },
  grupoIgrejaTitulo: { fontSize: 15, fontWeight: '700', color: '#2b2320', marginBottom: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardInativo: { opacity: 0.55 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: '#2b2320', marginBottom: 2 },
  cardLinha: { fontSize: 12, color: '#8a7d6f', marginBottom: 1 },
  etiquetaInativo: { fontSize: 11, fontWeight: '700', color: '#B23A2E', marginTop: 4 },
  cardAcoes: { flexDirection: 'row', gap: 8, marginTop: 10 },
  botaoEditar: { flex: 1, borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botaoEditarTexto: { color: '#2b2320', fontWeight: '600', fontSize: 12 },
  botaoExcluir: { flex: 1, backgroundColor: '#B23A2E', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  botaoExcluirTexto: { color: '#fff', fontWeight: '600', fontSize: 12 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCaixa: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitulo: { fontSize: 16, fontWeight: '700', color: '#2b2320' },
  botaoSalvar: { backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
