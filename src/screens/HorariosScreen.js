import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';
import { linhaDataCompleta } from '../utils/datas';
import CabecalhoApp from '../components/CabecalhoApp';
import FiltrosIgreja from '../components/FiltrosIgreja';

export default function HorariosScreen() {
  const { dados, listarHorarios, nomeIgreja, corIgreja, recarregar } = useApp();
  const [filtro, setFiltro] = useState('todas');
  const [atualizando, setAtualizando] = useState(false);

  const itens = listarHorarios(filtro === 'todas' ? null : filtro);

  async function aoAtualizar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  return (
    <View style={styles.container}>
      <CabecalhoApp titulo="Horários" />
      <Text style={styles.tituloView}>Horários</Text>
      <FiltrosIgreja igrejas={dados.igrejas} filtroAtual={filtro} onFiltrar={setFiltro} />
      <FlatList
        data={itens}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={['#7A1F2B']} />}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum horário encontrado.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: corIgreja(item.igrejaId) }]}>
            <Text style={styles.etiquetaIgreja}>{nomeIgreja(item.igrejaId)}</Text>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.meta}>{item.tipo}</Text>
            <Text style={styles.metaData}>
              {linhaDataCompleta(item.data, item.horario)}
              {item.recorrencia ? ` · ${item.recorrencia}` : ''}
            </Text>
            {!!item.descricao && <Text style={styles.descricao}>{item.descricao}</Text>}
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
  etiquetaIgreja: {
    alignSelf: 'flex-start', backgroundColor: '#F3ECE2', color: '#6b5a48',
    fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginBottom: 6,
  },
  nome: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 2 },
  meta: { fontSize: 13, color: '#8a7d6f', marginBottom: 4 },
  metaData: { fontSize: 13, color: '#5a5048', marginBottom: 4 },
  descricao: { fontSize: 13, color: '#6b6058' },
});
