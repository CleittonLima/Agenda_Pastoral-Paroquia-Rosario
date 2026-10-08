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
import { salvarConfiguracoes, enviarImagem } from '../api/api';
import { supabase } from '../supabase/config';
import AdminHeader from './components/AdminHeader';
import ConfirmModal from './components/ConfirmModal';
import { useSeletorImagem } from './components/RecorteImagem';
import { descricaoFormato } from './components/formatosImagem';
import { useApp } from '../context/AppContext';

// Formato de recorte de cada imagem desta tela
// (ver formatosImagem.js)
const FORMATO_POR_CAMPO = {
  LogoPrincipal: 'logo',
  ImagemTelaInicial: 'imagemInicial',
};

export default function AdminConfiguracoesScreen() {
  const { dados, recarregar, sair } = useAdmin();

  const { mostrarToast } = useApp();

  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [enviandoInicial, setEnviandoInicial] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [trocando, setTrocando] = useState(false);
  const [confirmandoSair, setConfirmandoSair] = useState(false);

  const {
    escolherImagem: escolherComRecorte,
    modalRecorte,
  } = useSeletorImagem();

  // Valores mais recentes
  // (mesmo após esperar o envio da imagem)
  const formAtual = useRef(form);

  formAtual.current = form;

  useEffect(() => {
    setForm(dados.config || {});
  }, [dados.config]);

  function mudar(campo, valor) {
    setForm(f => ({
      ...f,
      [campo]: valor,
    }));
  }

  async function escolherImagem(campo, setEnviando) {
    const foto = await escolherComRecorte(
      FORMATO_POR_CAMPO[campo] || 'livre'
    );

    if (!foto) return;

    setEnviando(true);

    try {
      const resposta = await enviarImagem(
        foto.uri,
        foto.fileName,
        foto.mimeType,
        foto.base64
      );

      if (resposta.ok) {
        const atualizado = {
          ...formAtual.current,
          [campo]: resposta.url,
        };

        setForm(atualizado);

        await salvarConfiguracoes({
          ...dados.config,
          ...atualizado,
        });

        await recarregar();

        mostrarToast('Imagem enviada e salva com sucesso!');
      } else {
        mostrarToast(
          resposta.erro ||
            'Não foi possível enviar a imagem.',
          'erro'
        );
      }
    } catch (e) {
      mostrarToast(
        'Falha ao enviar a imagem. Verifique sua internet.',
        'erro'
      );
    } finally {
      setEnviando(false);
    }
  }

  async function salvar() {
    setSalvando(true);

    const resultado = await salvarConfiguracoes({
      ...dados.config,
      ...form,
    });

    setSalvando(false);

    if (resultado.ok) {
      await recarregar();

      mostrarToast(
        'Configurações atualizadas com sucesso!'
      );
    } else {
      mostrarToast(
        resultado.erro ||
          'Não foi possível salvar.',
        'erro'
      );
    }
  }

  async function alterarSenha() {
    if (senhaNova.length < 6) {
      mostrarToast(
        'A nova senha deve ter pelo menos 6 caracteres.',
        'aviso'
      );

      return;
    }

    setTrocando(true);

    try {
      // Identifica o usuário atualmente conectado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error(
          'Não foi possível identificar o usuário.'
        );
      }

      // Confirma a senha atual
      const {
        error: erroSenhaAtual,
      } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual,
      });

      if (erroSenhaAtual) {
        mostrarToast(
          'A senha atual informada está incorreta.',
          'aviso'
        );

        return;
      }

      // Altera a senha
      const { error } =
        await supabase.auth.updateUser({
          password: senhaNova,
        });

      if (error) {
        throw error;
      }

      setSenhaAtual('');
      setSenhaNova('');

      mostrarToast(
        'Senha alterada com sucesso!'
      );
    } catch (erro) {
      console.error(
        'Erro ao alterar senha:',
        erro
      );

      mostrarToast(
        erro.message ||
          'Não foi possível trocar a senha.',
        'erro'
      );
    } finally {
      setTrocando(false);
    }
  }

  function confirmarSair() {
    setConfirmandoSair(true);
  }

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Configurações Gerais" />

      <ScrollView
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.grupo}>
          <Text style={styles.rotulo}>
            Nome da paróquia
          </Text>

          <TextInput
            style={styles.input}
            value={form.NomeParoquia || ''}
            onChangeText={v =>
              mudar('NomeParoquia', v)
            }
          />
        </View>

        <ImagemComUpload
          rotulo="Logo principal"
          valor={form.LogoPrincipal}
          enviando={enviandoLogo}
          dica={`${descricaoFormato(
            'logo'
          )} · aparece em Configurações → Sobre`}
          onEscolher={() =>
            escolherImagem(
              'LogoPrincipal',
              setEnviandoLogo
            )
          }
        />

        <ImagemComUpload
          rotulo="Imagem da tela inicial"
          valor={form.ImagemTelaInicial}
          enviando={enviandoInicial}
          dica={descricaoFormato(
            'imagemInicial'
          )}
          onEscolher={() =>
            escolherImagem(
              'ImagemTelaInicial',
              setEnviandoInicial
            )
          }
        />

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>
            Frase do rodapé / versículo
          </Text>

          <TextInput
            style={styles.input}
            value={form.FraseRodape || ''}
            onChangeText={v =>
              mudar('FraseRodape', v)
            }
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>
            Telefone
          </Text>

          <TextInput
            style={styles.input}
            value={form.Telefone || ''}
            onChangeText={v =>
              mudar('Telefone', v)
            }
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>
            E-mail
          </Text>

          <TextInput
            style={styles.input}
            value={form.Email || ''}
            onChangeText={v =>
              mudar('Email', v)
            }
            autoCapitalize="none"
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.rotulo}>
            Endereço
          </Text>

          <TextInput
            style={styles.input}
            value={form.Endereco || ''}
            onChangeText={v =>
              mudar('Endereco', v)
            }
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
            <Text style={styles.botaoSalvarTexto}>
              Salvar
            </Text>
          )}
        </TouchableOpacity>

        {/* ---- TROCAR SENHA ---- */}
        <View style={styles.secaoSenha}>
          <Text style={styles.secaoTitulo}>
            Trocar senha do painel
          </Text>

          <View style={styles.grupo}>
            <Text style={styles.rotulo}>
              Senha atual
            </Text>

            <TextInput
              style={styles.input}
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              secureTextEntry
            />
          </View>

          <View style={styles.grupo}>
            <Text style={styles.rotulo}>
              Nova senha
            </Text>

            <TextInput
              style={styles.input}
              value={senhaNova}
              onChangeText={setSenhaNova}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={alterarSenha}
            disabled={trocando}
          >
            {trocando ? (
              <ActivityIndicator color="#7A1F2B" />
            ) : (
              <Text
                style={styles.botaoSecundarioTexto}
              >
                Trocar senha
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.botaoSair}
          onPress={confirmarSair}
        >
          <Text style={styles.botaoSairTexto}>
            🚪 Sair do painel
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visivel={confirmandoSair}
        titulo="Sair do painel"
        mensagem="Deseja mesmo sair do painel administrativo?"
        textoConfirmar="Sair"
        onConfirmar={() => {
          setConfirmandoSair(false);
          sair();
        }}
        onCancelar={() =>
          setConfirmandoSair(false)
        }
      />

      {modalRecorte}
    </View>
  );
}

function ImagemComUpload({
  rotulo,
  valor,
  enviando,
  onEscolher,
  dica,
}) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>
        {rotulo}
      </Text>

      <View style={styles.imagemLinha}>
        <View style={styles.previewCaixa}>
          {enviando ? (
            <ActivityIndicator color="#7A1F2B" />
          ) : valor ? (
            <Image
              source={{ uri: valor }}
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
          onPress={onEscolher}
          disabled={enviando}
        >
          <Text style={styles.botaoEscolherTexto}>
            {valor
              ? 'Trocar imagem'
              : 'Escolher imagem'}
          </Text>
        </TouchableOpacity>
      </View>

      {!!dica && (
        <Text style={styles.dicaImagem}>
          {dica}
        </Text>
      )}
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

  imagemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  previewCaixa: {
    width: 60,
    height: 60,
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

  dicaImagem: {
    fontSize: 11,
    color: '#8a7d6f',
    marginTop: 6,
  },

  botaoSalvar: {
    backgroundColor: '#7A1F2B',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },

  botaoSalvarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  secaoSenha: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 26,
  },

  secaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2b2320',
    marginBottom: 12,
  },

  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#7A1F2B',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },

  botaoSecundarioTexto: {
    color: '#7A1F2B',
    fontWeight: '700',
    fontSize: 14,
  },

  botaoSair: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },

  botaoSairTexto: {
    color: '#B23A2E',
    fontWeight: '700',
    fontSize: 14,
  },
});