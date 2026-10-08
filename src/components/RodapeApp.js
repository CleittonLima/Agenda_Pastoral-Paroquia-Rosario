import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function RodapeApp() {
  const { dados, temaCores } = useApp();

  const frase = dados?.config?.fraseRodape?.trim();

  // Se não houver frase configurada, não exibe o rodapé.
  if (!frase) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.texto,
          {
            color: temaCores.corTextoSecundario,
          },
        ]}
      >
        {frase}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    marginTop: 8,
  },

  texto: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});