import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SeletorOpcoes({ rotulo, valor, rotuloValor, opcoes, onSelecionar }) {
  const [aberto, setAberto] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.campo} onPress={() => setAberto(true)}>
        <Text style={valor ? styles.valorTexto : styles.placeholderTexto}>
          {rotuloValor || 'Selecionar...'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#8a7d6f" />
      </TouchableOpacity>

      <Modal visible={aberto} animationType="fade" transparent onRequestClose={() => setAberto(false)}>
        <TouchableOpacity style={styles.fundo} activeOpacity={1} onPress={() => setAberto(false)}>
          <View style={styles.caixa}>
            <Text style={styles.titulo}>{rotulo}</Text>
            <FlatList
              data={opcoes}
              keyExtractor={(item, i) => String(item.valor ?? item ?? i)}
              renderItem={({ item }) => {
                const v = typeof item === 'object' ? item.valor : item;
                const r = typeof item === 'object' ? item.rotulo : item;
                const ativo = v === valor;
                return (
                  <TouchableOpacity
                    style={[styles.opcao, ativo && styles.opcaoAtiva]}
                    onPress={() => { onSelecionar(v, r); setAberto(false); }}
                  >
                    <Text style={[styles.opcaoTexto, ativo && styles.opcaoTextoAtivo]}>{r}</Text>
                    {ativo && <Ionicons name="checkmark" size={18} color="#fff" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10, padding: 11,
    backgroundColor: '#FAF7F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  valorTexto: { fontSize: 14, color: '#2b2320' },
  placeholderTexto: { fontSize: 14, color: '#a89b8c' },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  caixa: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', maxWidth: 400, maxHeight: '70%' },
  titulo: { fontSize: 15, fontWeight: '700', color: '#2b2320', marginBottom: 10 },
  opcao: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4,
  },
  opcaoAtiva: { backgroundColor: '#7A1F2B' },
  opcaoTexto: { fontSize: 14, color: '#2b2320' },
  opcaoTextoAtivo: { color: '#fff', fontWeight: '700' },
});
