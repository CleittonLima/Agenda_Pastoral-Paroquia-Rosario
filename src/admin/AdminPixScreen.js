import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAdmin } from './AdminContext';
import { salvarPix, enviarImagem } from '../api/api';
import AdminHeader from './components/AdminHeader';
import { useSeletorImagem } from './components/RecorteImagem';
import { descricaoFormato } from './components/formatosImagem';
import { useApp } from '../context/AppContext';
import { registrarHistorico } from '../api/historico';

export default function AdminPixScreen() {
  const { dados, recarregar } = useAdmin();
  const { mostrarToast } = useApp();

  const pix = dados.pix || {};

  const [form, setForm] = useState({});
  const [enviandoImagem, setEnviandoImagem] =
    useState(false);
  const [salvando, setSalvando] = useState(false);

  const {
    escolherImagem,
    modalRecorte,
  } = useSeletorImagem();

  const formAtual = useRef(form);

  formAtual.current = form;

  useEffect(() => {
    setForm(pix);
  }, [dados.pix]);

  function mudar(campo, valor) {
    setForm(f => ({
      ...f,
      [campo]: valor,
    }));
  }

  async function escolherQrCode() {
    const foto = await escolherImagem('qrcode');

    if (!foto) return;

    setEnviandoImagem(true);

    try {
      const resposta = await enviarImagem(
        foto.uri,
        foto.fileName,
        foto.mimeType,
        foto.base64
      );

      if (!resposta.ok) {
        mostrarToast(
          resposta.erro ||
            'Não foi possível enviar a imagem.',
          'erro'
        );

        return;
      }

      const atualizado = {
        ...formAtual.current,
        QRCode: resposta.url,
      };

      setForm(atualizado);

      // Salva na hora — não depende de clicar em "Salvar"
      const salvo = await salvarPix(atualizado);

      if (!salvo.ok) {
        mostrarToast(
          salvo.erro ||
            'QR Code enviado, mas não foi possível salvar as informações.',
          'erro'
        );

        return;
      }

      await recarregar();

await registrarHistorico({
  acao: 'EDITAR',
  entidade: 'PIX',
  descricao: 'Atualizou o QR Code do PIX',
  detalhes: {
    campo: 'QRCode',
  },
});

mostrarToast(
  'QR Code enviado e salvo com sucesso!'
);
    } catch (e) {
      console.error(
        'Erro ao enviar QR Code:',
        e
      );

      mostrarToast(
        'Falha ao enviar a imagem. Verifique sua internet.',
        'erro'
      );
    } finally {
      setEnviandoImagem(false);
    }
  }

async function salvar() {
  if (salvando) return;

  setSalvando(true);

  try {
    const resultado = await salvarPix(form);

    if (!resultado.ok) {
      mostrarToast(
        resultado.erro || 'Não foi possível salvar.',
        'erro'
      );

      return;
    }

    await recarregar();

    await registrarHistorico({
      acao: 'EDITAR',
      entidade: 'PIX',
      descricao: 'Atualizou as informações do PIX',
      detalhes: {
        campos: [
          'TipoChave',
          'Chave',
          'Favorecido',
          'Banco',
          'Mensagem',
          'Tutorial',
        ],
      },
    });

    mostrarToast(
      'Informações do PIX atualizadas com sucesso!'
    );
  } catch (erro) {
    console.error('Erro ao salvar informações do PIX:', erro);

    mostrarToast(
      'Ocorreu um erro ao salvar as informações do PIX.',
      'erro'
    );
  } finally {
    setSalvando(false);
  }
}

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Oferta (PIX)" />

      <ScrollView
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.rotulo}>
          QR Code
        </Text>

        <View style={styles.imagemLinha}>
          <View style={styles.previewCaixa}>
            {enviandoImagem ? (
              <ActivityIndicator color="#7A1F2B" />
            ) : form.QRCode ? (
              <Image
                source={{ uri: form.QRCode }}
                style={styles.preview}
              />
            ) : (
              <Text style={{ fontSize: 22 }}>
                🖼️
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.botaoEscolher}
            onPress={escolherQrCode}
            disabled={enviandoImagem}
          >
            <Text
              style={styles.botaoEscolherTexto}
            >
              {form.QRCode
                ? 'Trocar QR Code'
                : 'Escolher QR Code'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dicaImagem}>
          {descricaoFormato('qrcode')}
        </Text>

        {[
          ['TipoChave', 'Tipo da chave'],
          ['Chave', 'Chave PIX'],
          ['Favorecido', 'Nome do favorecido'],
          ['Banco', 'Banco'],
        ].map(([campo, rotulo]) => (
          <View
            key={campo}
            style={styles.grupo}
          >
            <Text style={styles.rotulo}>
              {rotulo}
            </Text>

            <TextInput
              style={styles.input}
              value={form[campo] || ''}
              onChangeText={v =>
                mudar(campo, v)
              }
            />
          </View>
        ))}

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>
            Mensagem (aparece abaixo da chave, no app)
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textarea,
            ]}
            value={form.Mensagem || ''}
            onChangeText={v =>
              mudar('Mensagem', v)
            }
            multiline
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>
            Tutorial (opcional)
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textarea,
            ]}
            value={form.Tutorial || ''}
            onChangeText={v =>
              mudar('Tutorial', v)
            }
            multiline
          />
        </View>

        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={salvar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={styles.botaoSalvarTexto}
            >
              Salvar
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {modalRecorte}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  grupo: {
    marginBottom: 14,
  },

  rotulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5a5048',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#e3ddd2',
    borderRadius: 10,
    padding: 11,
    fontSize: 14,
    color: '#2b2320',
    backgroundColor: '#fff',
  },

  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  imagemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },

  dicaImagem: {
    fontSize: 11,
    color: '#8a7d6f',
    marginBottom: 16,
  },

  previewCaixa: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e3ddd2',
  },

  preview: {
    width: '100%',
    height: '100%',
  },

  botaoEscolher: {
    borderWidth: 1,
    borderColor: '#7A1F2B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  botaoEscolherTexto: {
    color: '#7A1F2B',
    fontWeight: '700',
    fontSize: 13,
  },

  botaoSalvar: {
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  botaoSalvarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});