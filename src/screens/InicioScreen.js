import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { obterAvatar } from '../data/avatares';
import { linhaDataCompleta, proximaOcorrenciaDiaSemanaComHora } from '../utils/datas';

const COR_PRIMARIA = '#7A1F2B';

function horaInicioDe(horario) {
  return String(horario || '').split(' às ')[0].trim();
}

export default function InicioScreen({ navigation }) {
  const {
    dados, usuario, carregando, comErro, semInternet,
    recarregar, listarHorarios, listarEventos, nomeIgreja,
  } = useApp();

  const { proximaCelebracao, proximaConfissao, proximoEvento } = useMemo(() => {
    const horarios = listarHorarios()
      .map(h => ({ ...h, data: proximaOcorrenciaDiaSemanaComHora(h.diaSemana, horaInicioDe(h.horario)) }))
      .sort((a, b) => `${a.data}${horaInicioDe(a.horario)}`.localeCompare(`${b.data}${horaInicioDe(b.horario)}`));

    const celebracoes = horarios.filter(h => !String(h.tipo).toLowerCase().includes('confiss'));
    const confissoes = horarios.filter(h => String(h.tipo).toLowerCase().includes('confiss'));
    const eventos = listarEventos();

    return {
      proximaCelebracao: celebracoes[0] || null,
      proximaConfissao: confissoes[0] || null,
      proximoEvento: eventos[0] || null,
    };
  }, [dados.horarios, dados.eventos]);

  const avatar = obterAvatar(usuario?.avatar);

  if (comErro) {
    return (
      <View style={styles.centro}>
        <Ionicons name="cloud-offline-outline" size={48} color={COR_PRIMARIA} />
        <Text style={styles.erroTexto}>Não foi possível carregar os dados da paróquia.</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={recarregar}>
          <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} colors={[COR_PRIMARIA]} />}
    >
      <View style={styles.cabecalho}>
        <Image source={avatar.imagem} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.saudacao}>Olá, {usuario?.apelido || 'irmão(ã)'}! 👋</Text>
          <Text style={styles.subSaudacao}>Que a paz esteja com você.</Text>
        </View>
      </View>

      {semInternet && (
        <View style={styles.avisoOffline}>
          <Ionicons name="cloud-offline-outline" size={16} color="#8A6D3B" />
          <Text style={styles.avisoOfflineTexto}>Sem internet — mostrando os últimos dados salvos.</Text>
        </View>
      )}

      <CardResumo
        icone="book-outline"
        titulo="Próxima celebração"
        item={proximaCelebracao}
        nomeIgreja={nomeIgreja}
        vazio="Nenhuma celebração cadastrada."
      />
      <CardResumo
        icone="chatbubble-ellipses-outline"
        titulo="Próxima confissão"
        item={proximaConfissao}
        nomeIgreja={nomeIgreja}
        vazio="Nenhuma confissão cadastrada."
      />
      <CardResumo
        icone="calendar-outline"
        titulo="Próximo evento"
        item={proximoEvento}
        nomeIgreja={nomeIgreja}
        vazio="Nenhum evento programado."
        campoNome="nome"
      />
    </ScrollView>
  );
}

function CardResumo({ icone, titulo, item, nomeIgreja, vazio, campoNome = 'nome' }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardCabecalho}>
        <Ionicons name={icone} size={20} color={COR_PRIMARIA} />
        <Text style={styles.cardTitulo}>{titulo}</Text>
      </View>
      {item ? (
        <>
          <Text style={styles.cardNome}>{item[campoNome]}</Text>
          <Text style={styles.cardData}>{linhaDataCompleta(item.data, item.horario)}</Text>
          {!!nomeIgreja(item.igrejaId) && (
            <Text style={styles.cardIgreja}>📍 {nomeIgreja(item.igrejaId)}</Text>
          )}
        </>
      ) : (
        <Text style={styles.cardVazio}>{vazio}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  conteudo: { padding: 20, paddingBottom: 32, gap: 14 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2', padding: 24, gap: 12 },
  erroTexto: { fontSize: 15, color: '#555', textAlign: 'center' },
  botaoTentar: { backgroundColor: COR_PRIMARIA, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  botaoTentarTexto: { color: '#fff', fontWeight: '700' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: COR_PRIMARIA },
  saudacao: { fontSize: 18, fontWeight: '700', color: '#2A2A2A' },
  subSaudacao: { fontSize: 13, color: '#777', marginTop: 2 },
  avisoOffline: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FCF3D9', borderRadius: 10, padding: 10,
  },
  avisoOfflineTexto: { color: '#8A6D3B', fontSize: 12, flex: 1 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardCabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitulo: { fontSize: 13, fontWeight: '700', color: COR_PRIMARIA, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardNome: { fontSize: 16, fontWeight: '700', color: '#2A2A2A' },
  cardData: { fontSize: 13, color: '#666', marginTop: 4 },
  cardIgreja: { fontSize: 13, color: '#666', marginTop: 2 },
  cardVazio: { fontSize: 13, color: '#999', fontStyle: 'italic' },
});
