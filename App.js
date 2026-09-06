import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppProvider, useApp } from './src/context/AppContext';
import LoadingScreen from './src/components/LoadingScreen';
import BoasVindasScreen from './src/screens/BoasVindasScreen';

import InicioScreen from './src/screens/InicioScreen';
import HorariosScreen from './src/screens/HorariosScreen';
import AvisosScreen from './src/screens/AvisosScreen';
import EventosScreen from './src/screens/EventosScreen';
import IgrejasScreen from './src/screens/IgrejasScreen';
import OfertaScreen from './src/screens/OfertaScreen';
import OracoesScreen from './src/screens/OracoesScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const COR_PRIMARIA = '#7A1F2B';

function TabNavigator() {
  const { dados } = useApp();
  const totalAvisosUrgentes = dados.avisos.filter(a => a.prioridade !== 'Normal').length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COR_PRIMARIA,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 12,
          shadowOpacity: 0.08,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const mapa = {
            'Início': focused ? 'home' : 'home-outline',
            'Horários': focused ? 'time' : 'time-outline',
            'Avisos': focused ? 'megaphone' : 'megaphone-outline',
            'Eventos': focused ? 'calendar' : 'calendar-outline',
            'Igrejas': focused ? 'business' : 'business-outline',
          };
          return <Ionicons name={mapa[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarBadge:
          route.name === 'Avisos' && totalAvisosUrgentes > 0
            ? totalAvisosUrgentes
            : undefined,
      })}
    >
      <Tab.Screen name="Início" component={InicioScreen} />
      <Tab.Screen name="Horários" component={HorariosScreen} />
      <Tab.Screen name="Avisos" component={AvisosScreen} />
      <Tab.Screen name="Eventos" component={EventosScreen} />
      <Tab.Screen name="Igrejas" component={IgrejasScreen} />
    </Tab.Navigator>
  );
}

function AppRoot() {
  const { carregando, usuario } = useApp();
  const [primeiroAcesso, setPrimeiroAcesso] = useState(null);

  useEffect(() => {
    async function verificar() {
      const u = await AsyncStorage.getItem('@paroquia_usuario');
      setPrimeiroAcesso(!u);
    }
    verificar();
  }, []);

  if (primeiroAcesso === null || carregando) return <LoadingScreen />;

  if (primeiroAcesso || !usuario) {
    return <BoasVindasScreen onConcluir={() => setPrimeiroAcesso(false)} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Principal" component={TabNavigator} />
      <Stack.Screen name="Oferta" component={OfertaScreen} />
      <Stack.Screen name="Oracoes" component={OracoesScreen} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={COR_PRIMARIA} />
          <AppRoot />
        </NavigationContainer>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
