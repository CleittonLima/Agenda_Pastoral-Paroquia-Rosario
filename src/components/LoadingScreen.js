import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useApp } from '../context/AppContext';

export default function LoadingScreen() {
  const { preferencias } = useApp();

  const opacidade = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (preferencias.reduzirAnimacoes) {
      opacidade.stopAnimation();
      opacidade.setValue(1);
      return;
    }

    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacidade, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animacao.start();

    return () => {
      animacao.stop();
    };
  }, [preferencias.reduzirAnimacoes, opacidade]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: opacidade }}>
        <Image
          source={require('../../assets/logos/brasao.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.texto}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7A1F2B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  texto: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
});