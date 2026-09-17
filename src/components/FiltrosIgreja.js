import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ScrollView, View } from 'react-native';
import { useApp } from '../context/AppContext';

export default function FiltrosIgreja({ igrejas, filtroAtual, onFiltrar }) {
  const { temaCores } = useApp();
  const opcoes = [{ id: 'todas', nome: 'Todas' }, ...igrejas];
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {opcoes.map(op => {
          const ativo = filtroAtual === op.id;
          return (
            <TouchableOpacity
              key={op.id}
              onPress={() => onFiltrar(op.id)}
              style={[
                styles.chip,
                ativo && { backgroundColor: temaCores.corBotoes, borderColor: temaCores.corBotoes },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.texto, ativo && styles.textoAtivo]}>{op.nome}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Altura fixa no "wrapper" — em vez de flexGrow:0 na própria
  // ScrollView, que em algumas plataformas (principalmente Web) faz a
  // linha de filtros ficar cortada, mostrando só uma fatia dos chips.
  wrapper: { height: 46, marginBottom: 12 },
  container: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3ddd2',
    justifyContent: 'center',
  },
  texto: { fontSize: 13, fontWeight: '600', color: '#6b6b6b' },
  textoAtivo: { color: '#fff' },
});
