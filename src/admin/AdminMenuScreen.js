import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from './AdminContext';

const SECOES = [
  { id: 'AdminIgrejas', icone: 'business-outline', titulo: 'Área Pastoral', desc: 'Igrejas e capelas' },
  { id: 'AdminHorarios', icone: 'time-outline', titulo: 'Horários', desc: 'Missas, confissões e mais' },
  { id: 'AdminAvisos', icone: 'megaphone-outline', titulo: 'Avisos', desc: 'Comunicados da paróquia' },
  { id: 'AdminEventos', icone: 'calendar-outline', titulo: 'Eventos', desc: 'Festas, retiros, novenas' },
  { id: 'AdminPix', icone: 'cash-outline', titulo: 'Oferta (PIX)', desc: 'QR Code e chave PIX' },
  { id: 'AdminGaleria', icone: 'images-outline', titulo: 'Galeria', desc: 'Fotos de cada igreja' },
  { id: 'AdminRedesSociais', icone: 'share-social-outline', titulo: 'Redes Sociais', desc: 'Instagram, WhatsApp e mais' },
  { id: 'AdminConfiguracoes', icone: 'settings-outline', titulo: 'Configurações Gerais', desc: 'Dados da paróquia e senha' },
];

export default function AdminMenuScreen() {
  const navigation = useNavigation();
  const { dados, carregando, recarregar } = useAdmin();

  useEffect(() => { recarregar(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.cabecalhoTitulo}>Painel Administrativo</Text>
          <Text style={styles.cabecalhoSubtitulo}>Paróquia N. Sra. do Rosário</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Principal')}
          style={styles.botaoVoltarApp}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="exit-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {carregando ? (
          <ActivityIndicator color="#7A1F2B" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.estatisticas}>
            <Card numero={dados.igrejas.length} rotulo="Igrejas" />
            <Card numero={dados.horarios.length} rotulo="Horários" />
            <Card numero={dados.avisos.length} rotulo="Avisos" />
            <Card numero={dados.eventos.length} rotulo="Eventos" />
          </View>
        )}

        <View style={styles.lista}>
          {SECOES.map(secao => (
            <TouchableOpacity key={secao.id} style={styles.item} onPress={() => navigation.navigate(secao.id)}>
              <View style={styles.itemIcone}>
                <Ionicons name={secao.icone} size={20} color="#7A1F2B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitulo}>{secao.titulo}</Text>
                <Text style={styles.itemDesc}>{secao.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#a89b8c" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Card({ numero, rotulo }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardNumero}>{numero}</Text>
      <Text style={styles.cardRotulo}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  cabecalho: {
    backgroundColor: '#7A1F2B', paddingHorizontal: 16, paddingBottom: 18, paddingTop: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  botaoVoltarApp: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  cabecalhoTitulo: { color: '#fff', fontWeight: '700', fontSize: 19 },
  cabecalhoSubtitulo: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 32 },
  estatisticas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  card: {
    flexBasis: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderLeftWidth: 4, borderLeftColor: '#7A1F2B',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardNumero: { fontSize: 26, fontWeight: '700', color: '#2b2320' },
  cardRotulo: { fontSize: 12, color: '#8a7d6f', marginTop: 2 },
  lista: { gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff',
    borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  itemIcone: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3ECE2', alignItems: 'center', justifyContent: 'center' },
  itemTitulo: { fontSize: 14, fontWeight: '700', color: '#2b2320' },
  itemDesc: { fontSize: 12, color: '#8a7d6f', marginTop: 1 },
});
