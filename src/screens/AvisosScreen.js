import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AvisosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>AvisosScreen — em construção</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2' },
  texto: { fontSize: 16, color: '#7A1F2B', fontWeight: '600' },
});
