import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';
import { formatarDataBR } from '../utils/datas';
import CabecalhoApp from '../components/CabecalhoApp';
import FiltrosIgreja from '../components/FiltrosIgreja';

const CORES_PRIORIDADE = {
  Urgente: '#B23A2E',
  Importante: '#B98B2E',
  Normal: '#8a7d6f',
};

export default function AvisosScreen() {
  const { dados, listarAvisos, nomeIgreja, corIgreja, recarregar, temaCores } = useApp();
  const [filtro, setFiltro] = useState('todas');
  const [atualizando, setAtualizando] = useState(false);

  const itens = listarAvisos(filtro === 'todas' ? null : filtro);

  async function aoAtualizar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: temaCores.corBackground }]}>
      <CabecalhoApp titulo="Avisos" />
      <Text style={[styles.tituloView, { color: temaCores.corTexto }]}>Avisos</Text>
      <FiltrosIgreja igrejas={dados.igrejas} filtroAtual={filtro} onFiltrar={setFiltro} />
      <FlatList
        data={itens}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={[temaCores.corBotoes]} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum aviso no momento.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: temaCores.corCard, borderLeftColor: corIgreja(item.igrejaId) }]}>
            <View style={styles.linhaTopo}>
              <Text style={styles.etiquetaIgreja}>{nomeIgreja(item.igrejaId)}</Text>
              <Text style={[styles.prioridade, { color: CORES_PRIORIDADE[item.prioridade] || '#8a7d6f' }]}>
                {item.prioridade}
              </Text>
            </View>
            <Text style={[styles.titulo, { color: temaCores.corTexto }]}>{item.titulo}</Text>
            <Text style={[styles.meta, { color: temaCores.corTextoSecundario }]}>📅 {formatarDataBR(item.data)}</Text>
            <Text style={[styles.texto, { color: temaCores.corTexto }]}>{item.texto}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  tituloView: { fontSize: 22, fontWeight: '700', color: '#2b2320', paddingHorizontal: 16, paddingTop: 12, marginBottom: 10 },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  vazio: { textAlign: 'center', color: '#a89b8c', marginTop: 40, fontStyle: 'italic' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  etiquetaIgreja: {
    backgroundColor: '#F3ECE2', color: '#6b5a48',
    fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
  },
  prioridade: { fontSize: 11, fontWeight: '700' },
  titulo: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 4 },
  meta: { fontSize: 12, color: '#8a7d6f', marginBottom: 6 },
  texto: { fontSize: 13, color: '#5a5048', lineHeight: 19 },
});
