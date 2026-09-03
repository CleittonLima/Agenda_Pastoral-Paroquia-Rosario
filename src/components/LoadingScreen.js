import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

export default function LoadingScreen() {
  const opacidade = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(opacidade, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
