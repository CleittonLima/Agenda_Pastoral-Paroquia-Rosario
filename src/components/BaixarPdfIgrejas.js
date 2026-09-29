import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { gerarPdfIgrejas, compartilharPdf, salvarPdfNoAparelho } from '../utils/pdfIgrejas';

// ============================================================
// Configurações → Baixar PDF
// O fiel escolhe uma ou mais igrejas e gera um PDF com os horários,
// avisos e eventos de cada uma.
// ============================================================
export default function BaixarPdfIgrejas() {
  const { dados, temaCores } = useApp();
  const igrejas = dados.igrejas || [];

  const [selecionadas, setSelecionadas] = useState([]);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);
  const [pdf, setPdf] = useState(null); // { uri, nome } depois de gerado (celular)
  const [mensagem, setMensagem] = useState('');

  const todasMarcadas = igrejas.length > 0 && selecionadas.length === igrejas.length;

  function limparResultado() {
    setPdf(null);
    setMensagem('');
  }

  function alternar(id) {
    limparResultado();
    setSelecionadas(atual => (atual.includes(id) ? atual.filter(x => x !== id) : [...atual, id]));
  }

  function alternarTodas() {
    limparResultado();
    setSelecionadas(todasMarcadas ? [] : igrejas.map(i => i.id));
  }

  async function gerar() {
    if (!selecionadas.length) return;
    setGerando(true);
    limparResultado();
    try {
      // Mantém a mesma ordem da lista de igrejas do app
      const escolhidas = igrejas.filter(i => selecionadas.includes(i.id));
      const resultado = await gerarPdfIgrejas(escolhidas, dados);
      if (resultado.web) {
        setMensagem('Na janela de impressão, escolha "Salvar como PDF" para baixar o arquivo.');
      } else {
        setPdf(resultado);
      }
    } catch (e) {
      Alert.alert('Não foi possível gerar o PDF', 'Tente novamente em alguns instantes.');
    } finally {
      setGerando(false);
    }
  }

  async function salvar() {
    if (!pdf) return;
    setSalvando(true);
    try {
      const salvou = await salvarPdfNoAparelho(pdf.uri, pdf.nome);
      if (salvou) setMensagem('PDF salvo na pasta escolhida.');
    } catch (e) {
      Alert.alert('Não foi possível salvar', 'Escolha (ou crie) uma pasta, como "Documentos/Paróquia", ou use a opção "Compartilhar".');
    } finally {
      setSalvando(false);
    }
  }

  async function compartilhar() {
    if (!pdf || compartilhando) return;
    setCompartilhando(true);
    try {
      await compartilharPdf(pdf.uri);
    } catch (e) {
      Alert.alert('Não foi possível compartilhar', e?.message || 'Tente novamente.');
    } finally {
      setCompartilhando(false);
    }
  }

  return (
    <View style={[styles.grupo, { backgroundColor: temaCores.corCard }]}>
      <Text style={[styles.grupoTitulo, { color: temaCores.corTexto }]}>Baixar PDF</Text>
      <Text style={[styles.subtexto, { color: temaCores.corTextoSecundario }]}>
        Escolha uma ou mais igrejas para gerar um PDF com os horários das missas, avisos e eventos.
      </Text>

      {igrejas.length === 0 ? (
        <Text style={[styles.vazio, { color: temaCores.corTextoSecundario }]}>Nenhuma igreja cadastrada no momento.</Text>
      ) : (
        <>
          <TouchableOpacity style={styles.linhaTodas} onPress={alternarTodas} activeOpacity={0.7}>
            <Text style={[styles.linkTodas, { color: temaCores.corBotoes }]}>
              {todasMarcadas ? 'Desmarcar todas' : 'Selecionar todas'}
            </Text>
          </TouchableOpacity>

          <View style={styles.lista}>
            {igrejas.map(igreja => {
              const marcada = selecionadas.includes(igreja.id);
              return (
                <TouchableOpacity
                  key={igreja.id}
                  style={[
                    styles.itemIgreja,
                    { backgroundColor: temaCores.corFundoSuave || '#F3ECE2' },
                    marcada && { borderColor: temaCores.corBotoes },
                  ]}
                  onPress={() => alternar(igreja.id)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={marcada ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={marcada ? temaCores.corBotoes : temaCores.corTextoSecundario}
                  />
                  <View style={[styles.corIgreja, { backgroundColor: igreja.cor }]} />
                  <Text style={[styles.nomeIgreja, { color: temaCores.corTexto }]} numberOfLines={2}>{igreja.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.botaoPrimario, { backgroundColor: temaCores.corBotoes }, !selecionadas.length && styles.botaoDesativado]}
            onPress={gerar}
            disabled={!selecionadas.length || gerando}
          >
            {gerando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.botaoConteudo}>
                <Ionicons name="document-text-outline" size={18} color="#fff" />
                <Text style={styles.botaoPrimarioTexto}>
                  {selecionadas.length
                    ? `Gerar PDF (${selecionadas.length} ${selecionadas.length === 1 ? 'igreja' : 'igrejas'})`
                    : 'Selecione ao menos uma igreja'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {!!pdf && (
            <View style={[styles.resultado, { borderColor: temaCores.corDestaque || '#e3ddd2' }]}>
              <View style={styles.resultadoTopo}>
                <Ionicons name="checkmark-circle" size={18} color="#2E7D46" />
                <Text style={[styles.resultadoTexto, { color: temaCores.corTexto }]} numberOfLines={2}>PDF pronto: {pdf.nome}</Text>
              </View>
              <View style={styles.resultadoBotoes}>
                {Platform.OS === 'android' && (
                  <TouchableOpacity style={[styles.botaoSecundario, { borderColor: temaCores.corBotoes }]} onPress={salvar} disabled={salvando}>
                    {salvando ? (
                      <ActivityIndicator color={temaCores.corBotoes} />
                    ) : (
                      <Text style={[styles.botaoSecundarioTexto, { color: temaCores.corBotoes }]}>Salvar no celular</Text>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.botaoSecundario, { borderColor: temaCores.corBotoes }]} onPress={compartilhar} disabled={compartilhando}>
                  <Text style={[styles.botaoSecundarioTexto, { color: temaCores.corBotoes }]}>
                    {Platform.OS === 'ios' ? 'Salvar ou compartilhar' : 'Compartilhar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!!mensagem && (
            <Text style={[styles.mensagem, { color: temaCores.corTextoSecundario }]}>{mensagem}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5, elevation: 1,
  },
  grupoTitulo: { fontSize: 16, fontWeight: '700', color: '#2b2320', marginBottom: 10 },
  subtexto: { fontSize: 12, color: '#8a7d6f', lineHeight: 18 },
  vazio: { fontSize: 13, fontStyle: 'italic', marginTop: 10 },
  linhaTodas: { alignSelf: 'flex-end', paddingVertical: 8 },
  linkTodas: { fontSize: 13, fontWeight: '700' },
  lista: { gap: 8 },
  itemIgreja: {
    flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12,
    paddingVertical: 11, paddingHorizontal: 12, borderWidth: 1.5, borderColor: 'transparent',
  },
  corIgreja: { width: 10, height: 10, borderRadius: 5 },
  nomeIgreja: { flex: 1, fontSize: 14, fontWeight: '600' },
  botaoPrimario: { backgroundColor: '#7A1F2B', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 14, minHeight: 46, justifyContent: 'center' },
  botaoDesativado: { opacity: 0.5 },
  botaoConteudo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resultado: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12 },
  resultadoTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  resultadoTexto: { flex: 1, fontSize: 13, fontWeight: '600' },
  resultadoBotoes: { flexDirection: 'row', gap: 8 },
  botaoSecundario: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  botaoSecundarioTexto: { fontWeight: '700', fontSize: 13 },
  mensagem: { fontSize: 12, marginTop: 10, lineHeight: 18, textAlign: 'center' },
});
