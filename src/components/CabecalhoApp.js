import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar as RNStatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { obterAvatar } from '../data/avatares';

export default function CabecalhoApp({ titulo }) {
  const navigation = useNavigation();
  const { usuario, temaCores } = useApp();
  const avatar = usuario ? obterAvatar(usuario.avatar) : null;

  return (
    <View style={[styles.container, { backgroundColor: temaCores.corCabecalho }]}>
      <View style={styles.marca}>
        {avatar && <Image source={avatar.imagem} style={styles.avatar} />}
        <Text style={styles.saudacao} numberOfLines={1}>
          {titulo || (usuario ? `Olá, ${usuario.apelido}! 🙏` : '')}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Configuracoes')}
        style={styles.botaoAjustes}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="settings-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7A1F2B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 14 : 54,
  },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  saudacao: { color: '#fff', fontWeight: '700', fontSize: 15, flexShrink: 1 },
  botaoAjustes: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
