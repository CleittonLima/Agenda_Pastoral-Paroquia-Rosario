import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminHeader({ titulo, mostrarVoltar = true }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {mostrarVoltar ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botao} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      ) : <View style={styles.botao} />}
      <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
      <View style={styles.botao} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7A1F2B', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, paddingTop: 54,
  },
  botao: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  titulo: { color: '#fff', fontWeight: '700', fontSize: 17, flex: 1, textAlign: 'center' },
});
