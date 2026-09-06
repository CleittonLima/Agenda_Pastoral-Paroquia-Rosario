import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { linhaDataCompleta } from '../utils/datas';

const COR_PRIMARIA = '#7A1F2B';

export default function HorariosScreen() {
  const {
    dados, carregando, comErro, recarregar,
    listarHorarios, nomeIgreja, corIgreja,
  } = useApp();
  const [igrejaFiltro, setIgrejaFiltro] = useState(null);

  const horarios = useMemo(() => {
    return listarHorarios(igrejaFiltro)
      .slice()
      .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));
  }, [dados.horarios, igrejaFiltro]);

  if (comErro) {
    return (
      <View style={styles.centro}>
        <Ionicons name="cloud-offline-outline" size={48} color={COR_PRIMARIA} />
        <Text style={styles.erroTexto}>Não foi possível carregar os horários.</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={recarregar}>
          <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {dados.igrejas.length > 0 && (
        <FlatList
          data={[{ id: null, nome: 'Todas', cor: COR_PRIMARIA }, ...dados.igrejas]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.filtros}
          renderItem={({ item }) => {
            const ativo = igrejaFiltro === item.id;
            return (
              <TouchableOpacity
                style={[styles.chip, ativo && { backgroundColor: item.cor || COR_PRIMARIA }]}
                onPress={() => setIgrejaFiltro(item.id)}
              >
                <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{item.nome}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <FlatList
        style={{ flex: 1 }}
        data={horarios}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} colors={[COR_PRIMARIA]} />}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum horário cadastrado{igrejaFiltro ? ' para essa igreja' : ''}.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: corIgreja(item.igrejaId) }]}>
            <View style={styles.cardTopo}>
              <Text style={styles.nome}>{item.nome}</Text>
              {!!item.tipo && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{item.tipo}</Text>
                </View>
              )}
            </View>
            <Text style={styles.data}>{linhaDataCompleta(item.data, item.horario)}</Text>
            {!igrejaFiltro && !!nomeIgreja(item.igrejaId) && (
              <Text style={styles.igreja}>📍 {nomeIgreja(item.igrejaId)}</Text>
            )}
            {!!item.descricao && <Text style={styles.descricao}>{item.descricao}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2', padding: 24, gap: 12 },
  erroTexto: { fontSize: 15, color: '#555', textAlign: 'center' },
  botaoTentar: { backgroundColor: COR_PRIMARIA, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  botaoTentarTexto: { color: '#fff', fontWeight: '700' },
  filtros: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#EFE7E1', marginRight: 8,
  },
  chipTexto: { fontSize: 13, fontWeight: '600', color: '#555' },
  chipTextoAtivo: { color: '#fff' },
  lista: { padding: 16, paddingTop: 4, gap: 12, flexGrow: 1 },
  vazio: { textAlign: 'center', color: '#999', fontStyle: 'italic', marginTop: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  nome: { fontSize: 15, fontWeight: '700', color: '#2A2A2A', flex: 1 },
  badge: { backgroundColor: '#F1E4E6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTexto: { fontSize: 11, fontWeight: '700', color: COR_PRIMARIA },
  data: { fontSize: 13, color: '#666', marginTop: 6 },
  igreja: { fontSize: 12, color: '#888', marginTop: 4 },
  descricao: { fontSize: 12, color: '#888', marginTop: 6, fontStyle: 'italic' },
});
