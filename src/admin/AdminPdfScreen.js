import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from './AdminContext';
import { salvarConfiguracoes, enviarImagem } from '../api/api';
import AdminHeader from './components/AdminHeader';
import { useSeletorImagem } from './components/RecorteImagem';
import { descricaoFormato } from './components/formatosImagem';
import { urlImagemOtimizada } from '../utils/imagens';

// ============================================================
// PAINEL ADM → PDF PARA OS FIÉIS
// Logo e cabeçalho do PDF que os fiéis baixam em
// Configurações → Baixar PDF. Os valores ficam na aba "Configuracoes"
// da planilha, nas colunas abaixo.
// ============================================================
const COLUNAS_PDF = ['PdfLogo', 'PdfTitulo', 'PdfSubtitulo', 'PdfInfo'];
const FONTE_SERIFADA = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' });

export default function AdminPdfScreen() {
  const { dados, senha, recarregar } = useAdmin();
  const config = dados.config || {};
  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const { escolherImagem, modalRecorte } = useSeletorImagem();
  const formAtual = useRef(form);
  formAtual.current = form;

  useEffect(() => { setForm(dados.config || {}); }, [dados.config]);

  // O Apps Script só grava colunas que já existem na planilha
  const colunasFaltando = COLUNAS_PDF.filter(c => !Object.prototype.hasOwnProperty.call(config, c));

  function mudar(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  async function salvarNaPlanilha(valores) {
    const resultado = await salvarConfiguracoes(senha, { ...dados.config, ...valores });
    if (resultado.ok) await recarregar();
    return resultado;
  }

  async function escolherLogo() {
    const foto = await escolherImagem('logoPdf');
    if (!foto) return;
    setEnviandoLogo(true);
    try {
      const resposta = await enviarImagem(senha, foto.uri, foto.fileName, foto.mimeType, foto.base64);
      if (!resposta.ok) {
        Alert.alert('Erro', resposta.erro || 'Não foi possível enviar a imagem.');
        return;
      }
      const atualizado = { ...formAtual.current, PdfLogo: resposta.url };
      setForm(atualizado);
      const salvo = await salvarNaPlanilha(atualizado);
      if (salvo.ok) Alert.alert('Pronto', 'Logo do PDF enviada e salva!');
      else Alert.alert('Erro', salvo.erro || 'Não foi possível salvar.');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao enviar a imagem. Verifique sua internet.');
    } finally {
      setEnviandoLogo(false);
    }
  }

  async function usarLogoPrincipal() {
    const atualizado = { ...form, PdfLogo: '' };
    setForm(atualizado);
    const salvo = await salvarNaPlanilha(atualizado);
    if (!salvo.ok) Alert.alert('Erro', salvo.erro || 'Não foi possível salvar.');
  }

  async function salvar() {
    setSalvando(true);
    try {
      const resultado = await salvarNaPlanilha(form);
      if (resultado.ok) Alert.alert('Salvo', 'Cabeçalho do PDF atualizado.');
      else Alert.alert('Erro', resultado.erro || 'Não foi possível salvar.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar. Verifique sua internet.');
    } finally {
      setSalvando(false);
    }
  }

  // Valores efetivos (o que realmente vai sair no PDF)
  const logoEfetiva = form.PdfLogo || form.LogoPrincipal || '';
  const tituloEfetivo = form.PdfTitulo || form.NomeParoquia || 'Paróquia Nossa Senhora do Rosário';
  const infoPadrao = [form.Endereco, form.Telefone, form.Email].filter(Boolean).join('  ·  ');
  const infoEfetiva = form.PdfInfo || infoPadrao;

  return (
    <View style={styles.container}>
      <AdminHeader titulo="PDF para os fiéis" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dica}>
          Estas informações aparecem no topo de cada folha do PDF que os fiéis baixam em
          Configurações → Baixar PDF. Campos em branco usam os dados das Configurações Gerais.
        </Text>

        {colunasFaltando.length > 0 && (
          <View style={styles.alerta}>
            <Ionicons name="alert-circle-outline" size={18} color="#8a5a12" />
            <Text style={styles.alertaTexto}>
              Para salvar estas opções, adicione na aba <Text style={styles.negrito}>Configuracoes</Text> da planilha
              (linha 1, depois da última coluna) as colunas:{' '}
              <Text style={styles.negrito}>{colunasFaltando.join(', ')}</Text>.
            </Text>
          </View>
        )}

        {/* ---- Prévia do cabeçalho ---- */}
        <Text style={styles.secaoTitulo}>Prévia do cabeçalho</Text>
        <View style={styles.previa}>
          {logoEfetiva ? (
            <Image source={{ uri: urlImagemOtimizada(logoEfetiva, 300) }} style={styles.previaLogo} resizeMode="contain" />
          ) : (
            <Text style={styles.previaCruz}>✝</Text>
          )}
          <Text style={styles.previaTitulo}>{tituloEfetivo}</Text>
          {!!form.PdfSubtitulo && <Text style={styles.previaSubtitulo}>{form.PdfSubtitulo}</Text>}
          {!!infoEfetiva && <Text style={styles.previaInfo}>{infoEfetiva}</Text>}
          <View style={styles.previaFilete} />
        </View>

        {/* ---- Logo ---- */}
        <View style={styles.bloco}>
          <Text style={styles.rotulo}>Logo do PDF</Text>
          <View style={styles.imagemLinha}>
            <View style={styles.previewCaixa}>
              {enviandoLogo ? <ActivityIndicator color="#7A1F2B" /> : form.PdfLogo ? (
                <Image source={{ uri: urlImagemOtimizada(form.PdfLogo, 200) }} style={styles.preview} resizeMode="contain" />
              ) : <Text style={{ fontSize: 22 }}>🖼️</Text>}
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <TouchableOpacity style={styles.botaoEscolher} onPress={escolherLogo} disabled={enviandoLogo}>
                <Text style={styles.botaoEscolherTexto}>{form.PdfLogo ? 'Trocar logo' : 'Escolher logo'}</Text>
              </TouchableOpacity>
              {!!form.PdfLogo && (
                <TouchableOpacity onPress={usarLogoPrincipal} disabled={enviandoLogo}>
                  <Text style={styles.link}>Usar a logo principal</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.dicaImagem}>
            {form.PdfLogo ? descricaoFormato('logoPdf') : 'Sem logo própria — o PDF usa a logo principal (Configurações Gerais).'}
          </Text>
        </View>

        {/* ---- Cabeçalho ---- */}
        <View style={styles.bloco}>
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>Título</Text>
            <TextInput
              style={styles.input}
              value={form.PdfTitulo || ''}
              onChangeText={(v) => mudar('PdfTitulo', v)}
              placeholder={form.NomeParoquia || 'Paróquia Nossa Senhora do Rosário'}
              placeholderTextColor="#a89b8c"
            />
          </View>
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>Subtítulo (opcional)</Text>
            <TextInput
              style={styles.input}
              value={form.PdfSubtitulo || ''}
              onChangeText={(v) => mudar('PdfSubtitulo', v)}
              placeholder="Ex.: Diocese de ... · Serra Talhada – PE"
              placeholderTextColor="#a89b8c"
            />
          </View>
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>Informações de contato</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.PdfInfo || ''}
              onChangeText={(v) => mudar('PdfInfo', v)}
              placeholder={infoPadrao || 'Endereço · Telefone · E-mail'}
              placeholderTextColor="#a89b8c"
              multiline
            />
          </View>
        </View>

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} disabled={salvando}>
          {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoSalvarTexto}>Salvar</Text>}
        </TouchableOpacity>
      </ScrollView>
      {modalRecorte}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  scroll: { padding: 16, paddingBottom: 40 },
  dica: { fontSize: 12, color: '#8a7d6f', marginBottom: 14, lineHeight: 17 },
  alerta: {
    flexDirection: 'row', gap: 8, backgroundColor: '#FBF1DD', borderRadius: 12,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EBD3A2',
  },
  alertaTexto: { flex: 1, fontSize: 12, color: '#6b4a12', lineHeight: 18 },
  negrito: { fontWeight: '700' },
  secaoTitulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', marginBottom: 6 },
  previa: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 16,
    alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#e3ddd2',
  },
  previaLogo: { width: 64, height: 64, marginBottom: 8 },
  previaCruz: { fontSize: 30, color: '#7A1F2B', marginBottom: 4 },
  previaTitulo: { fontSize: 17, fontWeight: '700', color: '#7A1F2B', textAlign: 'center', fontFamily: FONTE_SERIFADA },
  previaSubtitulo: { fontSize: 13, fontStyle: 'italic', color: '#5a5048', textAlign: 'center', marginTop: 2, fontFamily: FONTE_SERIFADA },
  previaInfo: { fontSize: 11, color: '#6b6058', textAlign: 'center', marginTop: 5 },
  previaFilete: { alignSelf: 'stretch', height: 4, borderTopWidth: 2, borderBottomWidth: 1, borderColor: '#B98B2E', marginTop: 12 },
  bloco: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  grupo: { marginBottom: 14 },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#5a5048', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e3ddd2', borderRadius: 10, padding: 11, fontSize: 14, color: '#2b2320', backgroundColor: '#FAF7F2' },
  textarea: { minHeight: 70, textAlignVertical: 'top' },
  imagemLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewCaixa: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#FAF7F2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#e3ddd2' },
  preview: { width: '100%', height: '100%' },
  botaoEscolher: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#7A1F2B', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  botaoEscolherTexto: { color: '#7A1F2B', fontWeight: '700', fontSize: 13 },
  link: { color: '#7A1F2B', fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  dicaImagem: { fontSize: 11, color: '#8a7d6f', marginTop: 8 },
  botaoSalvar: { backgroundColor: '#7A1F2B', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  botaoSalvarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
