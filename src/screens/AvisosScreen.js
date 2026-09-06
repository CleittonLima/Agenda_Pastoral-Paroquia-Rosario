import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { formatarDataBR } from '../utils/datas';

const COR_PRIMARIA = '#7A1F2B';
const CORES_PRIORIDADE = {
  Urgente: '#C0392B',
  Importante: '#B8860B',
};

function prioridadeOrdem(prioridade) {
  if (prioridade === 'Urgente') return 0;
  if (prioridade === 'Importante') return 1;
  return 2;
}

export default function AvisosScreen() {
  const { dados, carregando, comErro, recarregar, listarAvisos, nomeIgreja } = useApp();

  const avisos = useMemo(() => {
    return listarAvisos()
      .slice()
      .sort((a, b) => {
        const diff = prioridadeOrdem(a.prioridade) - prioridadeOrdem(b.prioridade);
        if (diff !== 0) return diff;
        return new Date(a.data || 0) - new Date(b.data || 0);
      });
  }, [dados.avisos]);

  if (comErro) {
    return (
      <View style={styles.centro}>
        <Ionicons name="cloud-offline-outline" size={48} color={COR_PRIMARIA} />
        <Text style={styles.erroTexto}>Não foi possível carregar os avisos.</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={recarregar}>
          <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={avisos}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.lista}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} colors={[COR_PRIMARIA]} />}
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum aviso no momento.</Text>}
      renderItem={({ item }) => {
        const destacado = item.prioridade !== 'Normal';
        const corDestaque = CORES_PRIORIDADE[item.prioridade] || COR_PRIMARIA;
        return (
          <View style={[styles.card, destacado && { borderLeftColor: corDestaque, borderLeftWidth: 4 }]}>
            <View style={styles.cardTopo}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              {destacado && (
                <View style={[styles.badge, { backgroundColor: corDestaque }]}>
                  <Ionicons name="alert-circle" size={12} color="#fff" />
                  <Text style={styles.badgeTexto}>{item.prioridade}</Text>
                </View>
              )}
            </View>
            <Text style={styles.texto}>{item.texto}</Text>
            <View style={styles.rodape}>
              {!!item.data && <Text style={styles.meta}>📅 {formatarDataBR(item.data)}</Text>}
              {!!nomeIgreja(item.igrejaId) && <Text style={styles.meta}>📍 {nomeIgreja(item.igrejaId)}</Text>}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2', padding: 24, gap: 12 },
  erroTexto: { fontSize: 15, color: '#555', textAlign: 'center' },
  botaoTentar: { backgroundColor: COR_PRIMARIA, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  botaoTentarTexto: { color: '#fff', fontWeight: '700' },
  lista: { padding: 16, gap: 12, flexGrow: 1 },
  vazio: { textAlign: 'center', color: '#999', fontStyle: 'italic', marginTop: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
    marginBottom: 12,
  },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titulo: { fontSize: 15, fontWeight: '700', color: '#2A2A2A', flex: 1 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeTexto: { fontSize: 11, fontWeight: '700', color: '#fff' },
  texto: { fontSize: 13, color: '#555', marginTop: 8, lineHeight: 19 },
  rodape: { flexDirection: 'row', gap: 14, marginTop: 10 },
  meta: { fontSize: 12, color: '#888' },
});
