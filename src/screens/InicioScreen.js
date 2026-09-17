import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { linhaDataCompleta } from '../utils/datas';
import CabecalhoApp from '../components/CabecalhoApp';

// Verdadeiro quando um horário é do tipo "Confissão" (aceita variações)
function ehTipoConfissao(tipo, nome) {
  const texto = `${tipo || ''} ${nome || ''}`.toLowerCase();
  return texto.includes('conf');
}

function CardResumo({ titulo, item, mensagemVazia, nomeIgreja }) {
  const { temaCores } = useApp();
  return (
    <View style={[styles.card, { backgroundColor: temaCores.corCard, borderLeftColor: temaCores.corDestaque }]}>
      <Text style={[styles.cardEyebrow, { color: temaCores.corTextoSecundario }]}>{titulo}</Text>
      {item ? (
        <>
          <Text style={[styles.cardNome, { color: temaCores.corTexto }]}>{item.nome}</Text>
          <Text style={[styles.cardLinha, { color: temaCores.corTexto }]}>{linhaDataCompleta(item.data, item.horario)}</Text>
          <Text style={[styles.cardLinha2, { color: temaCores.corTextoSecundario }]}>
            {nomeIgreja(item.igrejaId)}{item.local ? ' · ' + item.local : ''}
          </Text>
        </>
      ) : (
        <Text style={styles.cardVazio}>{mensagemVazia}</Text>
      )}
    </View>
  );
}

export default function InicioScreen() {
  const navigation = useNavigation();
  const { dados, listarHorarios, listarEventos, nomeIgreja, semInternet, temaCores } = useApp();

  const horarios = listarHorarios();
  const proximasCelebracoes = horarios.filter(h => !ehTipoConfissao(h.tipo, h.nome));
  const proximasConfissoes = horarios.filter(h => ehTipoConfissao(h.tipo, h.nome));
  const eventos = listarEventos();

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const avisosDestaque = dados.avisos.filter(a => a.prioridade !== 'Normal').slice(0, 2);
  const config = dados.config || {};
  const nomeParoquia = config.nomeParoquia || 'Paróquia N. Sra. do Rosário';

  const atalhos = [
    { icone: '🙏', rotulo: 'Oferta', onPress: () => navigation.navigate('Oferta') },
    { icone: '📿', rotulo: 'Orações', onPress: () => navigation.navigate('Oracoes') },
    { icone: '⚙️', rotulo: 'Ajustes', onPress: () => navigation.navigate('Configuracoes') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: temaCores.corBackground }]}>
      <CabecalhoApp />
      <ScrollView contentContainerStyle={styles.scroll}>
        {semInternet && (
          <View style={styles.avisoOffline}>
            <Text style={styles.avisoOfflineTexto}>📡 Sem internet — mostrando os últimos dados salvos</Text>
          </View>
        )}

        {/* ---- Identidade da paróquia: imagem circular + nome ---- */}
        <View style={styles.identidade}>
          {config.imagemTelaInicial ? (
            <Image source={{ uri: config.imagemTelaInicial }} style={styles.imagemPrincipal} />
          ) : (
            <View style={[styles.imagemPrincipal, styles.imagemPrincipalFallback]}>
              <Text style={{ fontSize: 40 }}>✝️</Text>
            </View>
          )}
          <Text style={[styles.nomeParoquia, { color: temaCores.corTexto }]}>{nomeParoquia}</Text>
        </View>

        <Text style={[styles.tituloView, { color: temaCores.corTexto }]}>Início</Text>
        <Text style={[styles.dataAtual, { color: temaCores.corTextoSecundario }]}>{hoje}</Text>

        <CardResumo
          titulo="Próxima celebração"
          item={proximasCelebracoes[0]}
          mensagemVazia="Nenhuma celebração cadastrada."
          nomeIgreja={nomeIgreja}
        />
        <CardResumo
          titulo="Próxima confissão"
          item={proximasConfissoes[0]}
          mensagemVazia="Nenhuma confissão cadastrada."
          nomeIgreja={nomeIgreja}
        />
        <CardResumo
          titulo="Próximo evento"
          item={eventos[0]}
          mensagemVazia="Nenhum evento cadastrado."
          nomeIgreja={nomeIgreja}
        />

        {avisosDestaque.length > 0 && (
          <View style={{ gap: 8, marginBottom: 8 }}>
            {avisosDestaque.map(a => (
              <View
                key={a.id}
                style={[styles.avisoDestaque, { backgroundColor: a.prioridade === 'Urgente' ? '#B23A2E' : '#B98B2E' }]}
              >
                <Text style={styles.avisoDestaqueTitulo}>{a.titulo}</Text>
                <Text style={styles.avisoDestaqueTexto}>{a.texto}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.atalhosGrid}>
          {atalhos.map(at => (
            <TouchableOpacity
              key={at.rotulo}
              style={[styles.atalho, { backgroundColor: temaCores.corCard }]}
              onPress={at.onPress}
              activeOpacity={0.75}
            >
              <Text style={styles.atalhoIcone}>{at.icone}</Text>
              <Text style={[styles.atalhoTexto, { color: temaCores.corTexto }]}>{at.rotulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 32, gap: 12, width: '100%', maxWidth: 640, alignSelf: 'center' },
  avisoOffline: { backgroundColor: '#F1E4D3', borderRadius: 10, padding: 10, marginBottom: 4 },
  avisoOfflineTexto: { color: '#6b4423', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  identidade: { alignItems: 'center', marginBottom: 4 },
  imagemPrincipal: { width: 96, height: 96, borderRadius: 48, marginBottom: 8, borderWidth: 3, borderColor: '#fff' },
  imagemPrincipalFallback: { backgroundColor: '#F3ECE2', alignItems: 'center', justifyContent: 'center' },
  nomeParoquia: { fontSize: 16, fontWeight: '700', color: '#2b2320', textAlign: 'center' },
  tituloView: { fontSize: 22, fontWeight: '700', color: '#2b2320', marginTop: 8 },
  dataAtual: { color: '#8a7d6f', fontSize: 13, marginBottom: 4, textTransform: 'capitalize' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderLeftWidth: 4, borderLeftColor: '#7A1F2B',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardEyebrow: { fontSize: 11, fontWeight: '700', color: '#8a7d6f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  cardNome: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 3 },
  cardLinha: { fontSize: 13, color: '#5a5048', marginBottom: 2 },
  cardLinha2: { fontSize: 13, color: '#8a7d6f' },
  cardVazio: { fontSize: 13, color: '#a89b8c', fontStyle: 'italic' },
  avisoDestaque: { borderRadius: 10, padding: 12 },
  avisoDestaqueTitulo: { color: '#fff', fontWeight: '700', fontSize: 13, marginBottom: 2 },
  avisoDestaqueTexto: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  atalhosGrid: { flexDirection: 'row', gap: 10, marginTop: 6 },
  atalho: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  atalhoIcone: { fontSize: 26 },
  atalhoTexto: { fontSize: 12, fontWeight: '600', color: '#2b2320' },
});
