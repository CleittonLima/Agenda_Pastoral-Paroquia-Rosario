import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, Image, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ORACOES, TERCOS, MISTERIOS, MISTERIO_POR_DIA } from '../data/oracoes';
import { diaSemanaHoje } from '../utils/datas';
import { useApp } from '../context/AppContext';

const TEXTO_PAI_NOSSO = 'Pai nosso que estais nos céus,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\n\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal. Amém.';
const TEXTO_AVE_MARIA = 'Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres\ne bendito é o fruto do vosso ventre, Jesus.\n\nSanta Maria, Mãe de Deus,\nrogai por nós, pecadores,\nagora e na hora de nossa morte. Amém.\n\n(Reze dez vezes)';
const TEXTO_GLORIA = 'Glória ao Pai,\nao Filho\ne ao Espírito Santo.\n\nComo era no princípio,\nagora e sempre,\npor todos os séculos dos séculos. Amém.';

// Expande o bloco {tipo:"misterios"} nas partes do terço, inserindo
// automaticamente as 5 dezenas do mistério do dia (mesma lógica do site).
function montarPartesTerco(terco) {
  const partes = [];
  const chaveMisterio = MISTERIO_POR_DIA[diaSemanaHoje()];
  const grupo = MISTERIOS[chaveMisterio];

  for (const parte of terco.partes) {
    if (parte.tipo !== 'misterios') { partes.push(parte); continue; }
    grupo.lista.forEach((misterio, idx) => {
      const nome = typeof misterio === 'string' ? misterio : misterio.nome;
      const reflexao = (typeof misterio === 'object' && misterio.reflexao)
        ? misterio.reflexao
        : 'Anuncie este mistério e faça uma breve reflexão. ✝️';
      partes.push({ tipo: 'oracao', titulo: `${idx + 1}º Mistério — ${nome}`, subtitulo: grupo.nome, texto: reflexao });
      partes.push({ tipo: 'oracao', titulo: 'Pai-Nosso', texto: TEXTO_PAI_NOSSO });
      partes.push({ tipo: 'oracao', titulo: 'Dez Ave-Marias', texto: TEXTO_AVE_MARIA });
      partes.push({ tipo: 'oracao', titulo: 'Glória ao Pai', texto: TEXTO_GLORIA });
    });
  }
  return partes;
}

function TextoComParagrafos({ texto, estilo }) {
  return texto.split('\n').map((linha, i) =>
    linha.trim() === ''
      ? <View key={i} style={{ height: 10 }} />
      : <Text key={i} style={estilo}>{linha}</Text>
  );
}

export default function OracoesScreen() {
  const navigation = useNavigation();
  const { temaCores } = useApp();
  const [aba, setAba] = useState('lista');
  const [oracaoAberta, setOracaoAberta] = useState(null);
  const [misterioAberto, setMisterioAberto] = useState(null);
  const [indiceCarrossel, setIndiceCarrossel] = useState(0);
  const [tercoAtivo, setTercoAtivo] = useState(null); // { partes, indice }
  const [concluido, setConcluido] = useState(false);

  const tercosAtivos = useMemo(() => (Array.isArray(TERCOS) ? TERCOS.filter(t => t.status === 'ativo') : []), []);
  const misteriosSeguro = MISTERIOS || {};
  const oracoesSeguro = Array.isArray(ORACOES) ? ORACOES : [];
  const tercoSelecionado = tercosAtivos[indiceCarrossel] || tercosAtivos[0];

  function comecarTerco(terco) {
    const partes = montarPartesTerco(terco);
    setTercoAtivo({ terco, partes, indice: 0 });
    setConcluido(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: temaCores.corBackground }]}>
      <View style={[styles.cabecalho, { backgroundColor: temaCores.corCabecalho }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cabecalhoTitulo}>Orações</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.abas}>
        <TouchableOpacity
          style={[styles.aba, { backgroundColor: temaCores.corCard }, aba === 'lista' && { backgroundColor: temaCores.corBotoes, borderColor: temaCores.corBotoes }]}
          onPress={() => setAba('lista')}
        >
          <Text style={[styles.abaTexto, aba === 'lista' && styles.abaTextoAtivo]}>Orações do dia a dia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.aba, { backgroundColor: temaCores.corCard }, aba === 'terco' && { backgroundColor: temaCores.corBotoes, borderColor: temaCores.corBotoes }]}
          onPress={() => setAba('terco')}
        >
          <Text style={[styles.abaTexto, aba === 'terco' && styles.abaTextoAtivo]}>Como rezar o Santo Terço</Text>
        </TouchableOpacity>
      </View>

      {aba === 'lista' ? (
        <FlatList
          data={oracoesSeguro}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.oracaoItem, { backgroundColor: temaCores.corCard }]} onPress={() => setOracaoAberta(item)} activeOpacity={0.75}>
              <View style={[styles.oracaoIcone, { backgroundColor: (item.cor || temaCores.corBotoes) + '22' }]}>
                <Text style={{ fontSize: 18 }}>📿</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.oracaoNome, { color: temaCores.corTexto }]}>{item.nome}</Text>
                <Text style={[styles.oracaoCategoria, { color: temaCores.corTextoSecundario }]}>{item.categoria || 'Oração'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#a89b8c" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {tercosAtivos.length === 0 ? (
            <Text style={styles.vazio}>Nenhum terço disponível no momento.</Text>
          ) : (
            <>
              <View style={styles.carrosselLinha}>
                {tercosAtivos.length > 1 && (
                  <TouchableOpacity
                    style={[styles.setaTerco, { backgroundColor: temaCores.corCard }, indiceCarrossel === 0 && styles.setaDesabilitada]}
                    disabled={indiceCarrossel === 0}
                    onPress={() => setIndiceCarrossel(i => Math.max(0, i - 1))}
                  >
                    <Ionicons name="chevron-back" size={20} color={temaCores.corTexto} />
                  </TouchableOpacity>
                )}
                <View style={[styles.carrosselCard, { backgroundColor: temaCores.corCard }]}>
                  <Text style={[styles.carrosselNome, { color: temaCores.corTexto }]}>{tercoSelecionado?.nome}</Text>
                  <Text style={[styles.carrosselDesc, { color: temaCores.corTextoSecundario }]}>{tercoSelecionado?.descricao}</Text>
                  {tercosAtivos.length > 1 && (
                    <View style={styles.pontos}>
                      {tercosAtivos.map((_, i) => (
                        <View key={i} style={[styles.ponto, i === indiceCarrossel && { backgroundColor: temaCores.corBotoes }]} />
                      ))}
                    </View>
                  )}
                </View>
                {tercosAtivos.length > 1 && (
                  <TouchableOpacity
                    style={[styles.setaTerco, { backgroundColor: temaCores.corCard }, indiceCarrossel === tercosAtivos.length - 1 && styles.setaDesabilitada]}
                    disabled={indiceCarrossel === tercosAtivos.length - 1}
                    onPress={() => setIndiceCarrossel(i => Math.min(tercosAtivos.length - 1, i + 1))}
                  >
                    <Ionicons name="chevron-forward" size={20} color={temaCores.corTexto} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={[styles.botaoComecar, { backgroundColor: temaCores.corBotoes }]} onPress={() => comecarTerco(tercoSelecionado)}>
                <Text style={styles.botaoComecarTexto}>📿 Começar a rezar</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={[styles.secao, { backgroundColor: temaCores.corCard }]}>
            <Text style={[styles.secaoTitulo, { color: temaCores.corTexto }]}>Mistérios do Santo Terço</Text>
            <Text style={[styles.secaoSubtexto, { color: temaCores.corTextoSecundario }]}>Toque em um mistério para ver os detalhes e os dias em que é rezado.</Text>
            <View style={styles.misteriosGrade}>
              {Object.keys(misteriosSeguro).map(chave => {
                const m = misteriosSeguro[chave];
                return (
                  <TouchableOpacity key={chave} style={[styles.misterioBtn, { backgroundColor: temaCores.corFundoSuave }]} onPress={() => setMisterioAberto(chave)}>
                    <Text style={{ fontSize: 22 }}>{m.icone}</Text>
                    <Text style={[styles.misterioBtnNome, { color: temaCores.corTexto }]}>{m.nome}</Text>
                    <Text style={[styles.misterioBtnDias, { color: temaCores.corTextoSecundario }]}>{m.dias.join(' · ')}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {/* ---- MODAL: ORAÇÃO ---- */}
      <Modal visible={!!oracaoAberta} animationType="fade" transparent onRequestClose={() => setOracaoAberta(null)}>
        <View style={styles.modalFundo}>
          <View style={[styles.modalCaixaCentro, { backgroundColor: temaCores.corCard }]}>
            <TouchableOpacity style={styles.modalFecharX} onPress={() => setOracaoAberta(null)}>
              <Ionicons name="close" size={20} color="#2b2320" />
            </TouchableOpacity>
            {oracaoAberta && (
              <ScrollView contentContainerStyle={{ paddingTop: 6 }}>
                <View style={[styles.faixaTopo, { backgroundColor: oracaoAberta.cor || temaCores.corBotoes }]} />
                <Text style={[styles.modalCategoria, { color: temaCores.corTextoSecundario }]}>{oracaoAberta.categoria || 'Oração'}</Text>
                <Text style={[styles.modalTituloOracao, { color: temaCores.corTexto }]}>{oracaoAberta.nome}</Text>
                <TextoComParagrafos texto={oracaoAberta.texto} estilo={[styles.modalTextoOracao, { color: temaCores.corTexto }]} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ---- MODAL: MISTÉRIO ---- */}
      <Modal visible={!!misterioAberto} animationType="fade" transparent onRequestClose={() => setMisterioAberto(null)}>
        <View style={styles.modalFundo}>
          <View style={[styles.modalCaixaCentro, { backgroundColor: temaCores.corCard }]}>
            <TouchableOpacity style={styles.modalFecharX} onPress={() => setMisterioAberto(null)}>
              <Ionicons name="close" size={20} color="#2b2320" />
            </TouchableOpacity>
            {misterioAberto && (
              <ScrollView>
                <Text style={[styles.misterioModalTopo, { color: temaCores.corTexto }]}>
                  {misteriosSeguro[misterioAberto].icone} {misteriosSeguro[misterioAberto].nome}
                </Text>
                <Text style={[styles.misterioModalDias, { color: temaCores.corTextoSecundario }]}>
                  Rezado: {misteriosSeguro[misterioAberto].dias.join(' e ')}
                </Text>
                {misteriosSeguro[misterioAberto].lista.map((item, i) => {
                  const nome = typeof item === 'string' ? item : item.nome;
                  const reflexao = typeof item === 'object' ? item.reflexao : '';
                  return (
                    <View key={i} style={styles.misterioModalItem}>
                      <Text style={[styles.misterioModalNumero, { color: temaCores.corBotoes }]}>{i + 1}º</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.misterioModalNome, { color: temaCores.corTexto }]}>{nome}</Text>
                        {!!reflexao && <Text style={[styles.misterioModalReflexao, { color: temaCores.corTextoSecundario }]}>{reflexao}</Text>}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ---- MODAL: TERÇO INTERATIVO ---- */}
      <Modal visible={!!tercoAtivo} animationType="slide" transparent onRequestClose={() => setTercoAtivo(null)}>
        <View style={styles.modalFundo}>
          <View style={[styles.modalTercoCaixa, { backgroundColor: temaCores.corCard }]}>
            <TouchableOpacity style={styles.modalFecharX} onPress={() => setTercoAtivo(null)}>
              <Ionicons name="close" size={20} color="#2b2320" />
            </TouchableOpacity>
            {tercoAtivo && !concluido && (
              <View style={styles.tercoLayout}>
                {/* Cabeçalho fixo: barra de progresso + contador */}
                <View style={styles.tercoCabecalhoFixo}>
                  <View style={styles.progressoBarra}>
                    <View style={[styles.progressoPreenchimento, {
                      backgroundColor: temaCores.corBotoes,
                      width: `${Math.round((tercoAtivo.indice / tercoAtivo.partes.length) * 100)}%`,
                    }]} />
                  </View>
                  <Text style={[styles.contador, { color: temaCores.corTextoSecundario }]}>{tercoAtivo.indice + 1} de {tercoAtivo.partes.length}</Text>
                </View>

                {/* Corpo com altura fixa — rola só aqui quando o texto é grande */}
                <ScrollView style={styles.tercoCorpoFixo} contentContainerStyle={{ paddingBottom: 8 }}>
                  <Text style={[styles.tercoTitulo, { color: temaCores.corTexto }]}>{tercoAtivo.partes[tercoAtivo.indice].titulo}</Text>
                  {!!tercoAtivo.partes[tercoAtivo.indice].subtitulo && (
                    <Text style={[styles.tercoSubtitulo, { color: temaCores.corBotoes }]}>{tercoAtivo.partes[tercoAtivo.indice].subtitulo}</Text>
                  )}
                  {!!tercoAtivo.partes[tercoAtivo.indice].texto && (
                    <TextoComParagrafos texto={tercoAtivo.partes[tercoAtivo.indice].texto} estilo={[styles.tercoTexto, { color: temaCores.corTexto }]} />
                  )}
                </ScrollView>

                {/* Botões fixos embaixo, sempre no mesmo lugar */}
                <View style={styles.tercoBotoes}>
                  <TouchableOpacity
                    style={[styles.botaoSecundario, { borderColor: temaCores.corDestaque }, tercoAtivo.indice === 0 && styles.botaoDesabilitado]}
                    disabled={tercoAtivo.indice === 0}
                    onPress={() => setTercoAtivo(t => ({ ...t, indice: t.indice - 1 }))}
                  >
                    <Text style={[styles.botaoSecundarioTexto, { color: temaCores.corTexto }]}>← Anterior</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botaoPrimario, { backgroundColor: temaCores.corBotoes }]}
                    onPress={() => {
                      const ultimo = tercoAtivo.indice === tercoAtivo.partes.length - 1;
                      if (ultimo) setConcluido(true);
                      else setTercoAtivo(t => ({ ...t, indice: t.indice + 1 }));
                    }}
                  >
                    <Text style={styles.botaoPrimarioTexto}>
                      {tercoAtivo.indice === tercoAtivo.partes.length - 1 ? 'Concluir ✓' : 'Próximo →'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {tercoAtivo && concluido && (
              <View style={styles.tercoConclusaoLayout}>
                <Text style={{ fontSize: 46, marginBottom: 10 }}>🌹</Text>
                <Text style={[styles.conclusaoTitulo, { color: temaCores.corTexto }]}>Terço concluído!</Text>
                <ScrollView style={{ maxHeight: 160 }}>
                  <Text style={[styles.conclusaoTexto, { color: temaCores.corTextoSecundario }]}>{tercoAtivo.terco.conclusao}</Text>
                </ScrollView>
                <TouchableOpacity style={[styles.botaoPrimario, { backgroundColor: temaCores.corBotoes }]} onPress={() => setTercoAtivo(null)}>
                  <Text style={styles.botaoPrimarioTexto}>Fechar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  cabecalho: {
    backgroundColor: '#7A1F2B', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, paddingTop: 54,
  },
  botaoVoltar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  cabecalhoTitulo: { color: '#fff', fontWeight: '700', fontSize: 17 },
  abas: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  aba: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', borderWidth: 1, borderColor: '#e3ddd2' },
  abaTexto: { fontSize: 12, fontWeight: '700', color: '#6b6b6b' },
  abaTextoAtivo: { color: '#fff' },
  lista: { padding: 16, paddingTop: 8, gap: 10, paddingBottom: 32, width: '100%', maxWidth: 600, alignSelf: 'center' },
  vazio: { textAlign: 'center', color: '#a89b8c', marginTop: 20, fontStyle: 'italic' },
  oracaoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff',
    borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  oracaoIcone: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  oracaoNome: { fontSize: 15, fontWeight: '700', color: '#2b2320' },
  oracaoCategoria: { fontSize: 12, color: '#8a7d6f', marginTop: 2 },
  carrosselLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  carrosselCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center' },
  carrosselNome: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 6, textAlign: 'center' },
  carrosselDesc: { fontSize: 13, color: '#8a7d6f', textAlign: 'center' },
  pontos: { flexDirection: 'row', gap: 6, marginTop: 10 },
  ponto: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#e3ddd2' },
  setaTerco: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e3ddd2',
  },
  setaDesabilitada: { opacity: 0.3 },
  botaoComecar: { backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 16 },
  botaoComecarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secao: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  secaoTitulo: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 4 },
  secaoSubtexto: { fontSize: 12, color: '#8a7d6f', marginBottom: 12 },
  misteriosGrade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  misterioBtn: {
    width: '47%', backgroundColor: '#F3ECE2', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#e3ddd2', gap: 3,
  },
  misterioBtnNome: { fontSize: 13, fontWeight: '700', color: '#2b2320' },
  misterioBtnDias: { fontSize: 11, color: '#8a7d6f' },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCaixaCentro: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 480, maxHeight: '80%' },
  // Caixa do terço: altura FIXA (não varia com o tamanho do texto de
  // cada passo) — só o corpo do meio tem rolagem interna quando precisa.
  modalTercoCaixa: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 480, height: 460,
  },
  tercoLayout: { flex: 1, justifyContent: 'space-between' },
  tercoCabecalhoFixo: { gap: 8 },
  tercoCorpoFixo: { flex: 1, marginVertical: 14 },
  tercoConclusaoLayout: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  modalFecharX: {
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3ECE2',
    alignItems: 'center', justifyContent: 'center',
  },
  faixaTopo: { height: 6, borderRadius: 3, marginBottom: 14, marginTop: -6 },
  modalCategoria: { fontSize: 11, fontWeight: '700', color: '#8a7d6f', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  modalTituloOracao: { fontSize: 19, fontWeight: '700', color: '#2b2320', marginBottom: 12 },
  modalTextoOracao: { fontSize: 15, color: '#2b2320', lineHeight: 24 },
  misterioModalTopo: { fontSize: 18, fontWeight: '700', color: '#2b2320', marginBottom: 8 },
  misterioModalDias: { fontSize: 13, color: '#8a7d6f', marginBottom: 14 },
  misterioModalItem: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  misterioModalNumero: { fontWeight: '700', color: '#7A1F2B' },
  misterioModalNome: { fontSize: 14, color: '#2b2320' },
  misterioModalReflexao: { fontSize: 12, color: '#8a7d6f', fontStyle: 'italic', marginTop: 2 },
  progressoBarra: { height: 5, backgroundColor: '#e3ddd2', borderRadius: 3, overflow: 'hidden' },
  progressoPreenchimento: { height: '100%', backgroundColor: '#7A1F2B' },
  contador: { fontSize: 12, color: '#8a7d6f', textAlign: 'right' },
  tercoTitulo: { fontSize: 17, fontWeight: '700', color: '#2b2320', marginBottom: 2 },
  tercoSubtitulo: { fontSize: 13, color: '#7A1F2B', fontWeight: '600', marginBottom: 10 },
  tercoTexto: { fontSize: 15, color: '#2b2320', lineHeight: 23 },
  tercoBotoes: { flexDirection: 'row', gap: 10 },
  botaoPrimario: { flex: 1, backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  botaoSecundario: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  botaoSecundarioTexto: { color: '#2b2320', fontWeight: '700', fontSize: 14 },
  botaoDesabilitado: { opacity: 0.4 },
  conclusaoTitulo: { fontSize: 19, fontWeight: '700', color: '#2b2320', marginBottom: 14 },
  conclusaoTexto: { fontSize: 14, color: '#8a7d6f', fontStyle: 'italic', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
});
