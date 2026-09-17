import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

// O Alert.alert do React Native, quando tem mais de um botão, não
// funciona de forma confiável no modo Web (react-native-web não
// implementa isso direito) — por isso usamos um modal próprio para
// qualquer confirmação importante (excluir, sair etc.), que funciona
// igual no celular e no navegador.
export default function ConfirmModal({ visivel, titulo, mensagem, textoConfirmar = 'Confirmar', destrutivo = true, onConfirmar, onCancelar }) {
  return (
    <Modal visible={visivel} animationType="fade" transparent onRequestClose={onCancelar}>
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensagem}>{mensagem}</Text>
          <View style={styles.botoes}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={onCancelar}>
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoConfirmar, destrutivo && styles.botaoConfirmarDestrutivo]}
              onPress={onConfirmar}
            >
              <Text style={styles.botaoConfirmarTexto}>{textoConfirmar}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  caixa: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 8 },
  mensagem: { fontSize: 14, color: '#5a5048', lineHeight: 20, marginBottom: 18 },
  botoes: { flexDirection: 'row', gap: 10 },
  botaoCancelar: { flex: 1, borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  botaoCancelarTexto: { color: '#2b2320', fontWeight: '700', fontSize: 14 },
  botaoConfirmar: { flex: 1, backgroundColor: '#7A1F2B', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  botaoConfirmarDestrutivo: { backgroundColor: '#B23A2E' },
  botaoConfirmarTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
