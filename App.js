import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppProvider, useApp } from './src/context/AppContext';
import { AdminProvider } from './src/admin/AdminContext';
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

// ---- Telas do Painel Administrativo ----
import AdminLoginScreen from './src/admin/AdminLoginScreen';
import AdminMenuScreen from './src/admin/AdminMenuScreen';
import AdminIgrejasScreen from './src/admin/AdminIgrejasScreen';
import AdminHorariosScreen from './src/admin/AdminHorariosScreen';
import AdminAvisosScreen from './src/admin/AdminAvisosScreen';
import AdminEventosScreen from './src/admin/AdminEventosScreen';
import AdminPixScreen from './src/admin/AdminPixScreen';
import AdminGaleriaScreen from './src/admin/AdminGaleriaScreen';
import AdminRedesSociaisScreen from './src/admin/AdminRedesSociaisScreen';
import AdminConfiguracoesScreen from './src/admin/AdminConfiguracoesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { dados, temaCores } = useApp();
  const totalAvisosUrgentes = dados.avisos.filter(a => a.prioridade !== 'Normal').length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: temaCores.corCabecalho,
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
  const { carregando, usuario, temaCores } = useApp();
  const [primeiroAcesso, setPrimeiroAcesso] = useState(null);

  useEffect(() => {
    async function verificar() {
      const u = await AsyncStorage.getItem('@paroquia_usuario');
      setPrimeiroAcesso(!u);
    }
    verificar();
  }, []);

  let conteudo;
  if (primeiroAcesso === null || carregando) {
    conteudo = <LoadingScreen />;
  } else if (primeiroAcesso || !usuario) {
    conteudo = <BoasVindasScreen onConcluir={() => setPrimeiroAcesso(false)} />;
  } else {
    conteudo = (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* ---- App público (fiéis) ---- */}
        <Stack.Screen name="Principal" component={TabNavigator} />
        <Stack.Screen name="Oferta" component={OfertaScreen} />
        <Stack.Screen name="Oracoes" component={OracoesScreen} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />

        {/* ---- Painel Administrativo (coordenador) ---- */}
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />
        <Stack.Screen name="AdminIgrejas" component={AdminIgrejasScreen} />
        <Stack.Screen name="AdminHorarios" component={AdminHorariosScreen} />
        <Stack.Screen name="AdminAvisos" component={AdminAvisosScreen} />
        <Stack.Screen name="AdminEventos" component={AdminEventosScreen} />
        <Stack.Screen name="AdminPix" component={AdminPixScreen} />
        <Stack.Screen name="AdminGaleria" component={AdminGaleriaScreen} />
        <Stack.Screen name="AdminRedesSociais" component={AdminRedesSociaisScreen} />
        <Stack.Screen name="AdminConfiguracoes" component={AdminConfiguracoesScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={temaCores.corCabecalho} />
      {conteudo}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AdminProvider>
        <NavigationContainer>
          <AppRoot />
        </NavigationContainer>
      </AdminProvider>
    </AppProvider>
  );
}
