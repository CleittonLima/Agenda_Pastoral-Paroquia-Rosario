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
import {
  salvarConfiguracoes,
  enviarImagem,
} from '../api/api';
import { supabase } from '../supabase/config';
import AdminHeader from './components/AdminHeader';
import { useSeletorImagem } from './components/RecorteImagem';
import { descricaoFormato } from './components/formatosImagem';
import { useApp } from '../context/AppContext';

// Formato de recorte de cada imagem desta tela
const FORMATO_POR_CAMPO = {
  LogoPrincipal: 'logo',
  ImagemTelaInicial: 'imagemInicial',
};

export default function AdminConfiguracoesScreen() {
  const { dados, recarregar } = useAdmin();
  const { mostrarToast } = useApp();

  const [form, setForm] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [enviandoInicial, setEnviandoInicial] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [trocando, setTrocando] = useState(false);

  const {
    escolherImagem: escolherComRecorte,
    modalRecorte,
  } = useSeletorImagem();

  // Mantém os valores mais recentes do formulário
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

        const resultado = await salvarConfiguracoes({
          ...dados.config,
          ...atualizado,
        });

        if (!resultado.ok) {
          throw new Error(
            resultado.erro ||
              'Não foi possível salvar a configuração da imagem.'
          );
        }

        await recarregar();

        mostrarToast(
          'Imagem enviada e salva com sucesso!'
        );
      } else {
        mostrarToast(
          resposta.erro ||
            'Não foi possível enviar a imagem.',
          'erro'
        );
      }
    } catch (e) {
      mostrarToast(
        e.message ||
          'Falha ao enviar a imagem. Verifique sua internet.',
        'erro'
      );
    } finally {
      setEnviando(false);
    }
  }

  async function salvar() {
    setSalvando(true);

    try {
      const resultado = await salvarConfiguracoes({
        ...dados.config,
        ...form,
      });

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
    } catch (erro) {
      mostrarToast(
        erro.message ||
          'Ocorreu um erro ao salvar as configurações.',
        'erro'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarSenha() {
    if (!senhaAtual) {
      mostrarToast(
        'Informe sua senha atual.',
        'aviso'
      );

      return;
    }

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

  return (
    <View style={styles.container}>
      <AdminHeader titulo="Configurações Gerais" />

      <ScrollView
        contentContainerStyle={styles.scroll}
      >
        {/* NOME DA PARÓQUIA */}
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

        {/* LOGO PRINCIPAL */}
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

        {/* IMAGEM DA TELA INICIAL */}
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

        {/* PERSONALIZAÇÃO DA TELA DE BOAS-VINDAS */}
        <View style={styles.secaoPersonalizacao}>
          <Text style={styles.secaoTitulo}>
            Tela de boas-vindas
          </Text>

          <Text style={styles.dicaSecao}>
            Personalize as mensagens e os botões
            exibidos na primeira visita e nos
            próximos acessos.
          </Text>

          {/* MENSAGEM DO PRIMEIRO ACESSO */}
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>
              Mensagem do primeiro acesso
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.inputMultilinha,
              ]}
              value={
                form.MensagemBoasVindas ??
                'Que bom ter você aqui! Para começarmos, como podemos te chamar?'
              }
              onChangeText={v =>
                mudar('MensagemBoasVindas', v)
              }
              multiline
              textAlignVertical="top"
              placeholder="Que bom ter você aqui! Para começarmos, como podemos te chamar?"
            />
          </View>

          {/* MENSAGEM DE RETORNO */}
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>
              Mensagem para quem já acessou
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.inputMultilinha,
              ]}
              value={
                form.MensagemRetorno ??
                'Vivendo a fé, unidos em comunidade.'
              }
              onChangeText={v =>
                mudar('MensagemRetorno', v)
              }
              multiline
              textAlignVertical="top"
              placeholder="Vivendo a fé, unidos em comunidade."
            />
          </View>

          {/* BOTÃO DO PRIMEIRO ACESSO */}
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>
              Texto do botão de primeiro acesso
            </Text>

            <TextInput
              style={styles.input}
              value={
                form.TextoBotaoBoasVindas ??
                'Entrar 🙏'
              }
              onChangeText={v =>
                mudar('TextoBotaoBoasVindas', v)
              }
              placeholder="Entrar 🙏"
            />
          </View>

          {/* BOTÃO DE RETORNO */}
          <View style={styles.grupo}>
            <Text style={styles.rotulo}>
              Texto do botão de retorno
            </Text>

            <TextInput
              style={styles.input}
              value={
                form.TextoBotaoRetorno ??
                'Acessar aplicativo'
              }
              onChangeText={v =>
                mudar('TextoBotaoRetorno', v)
              }
              placeholder="Acessar aplicativo"
            />
          </View>
        </View>

                {/* FRASE DO RODAPÉ */}
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

        {/* TELEFONE */}
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

        {/* E-MAIL */}
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
            keyboardType="email-address"
          />
        </View>

        {/* ENDEREÇO */}
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

        {/* SALVAR CONFIGURAÇÕES */}
        <TouchableOpacity
          style={[
            styles.botaoSalvar,
            salvando && styles.botaoDesabilitado,
          ]}
          onPress={salvar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoSalvarTexto}>
              Salvar configurações
            </Text>
          )}
        </TouchableOpacity>

        {/* TROCAR SENHA */}
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
              autoCapitalize="none"
              placeholder="Digite sua senha atual"
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
              autoCapitalize="none"
              placeholder="Mínimo de 6 caracteres"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.botaoSecundario,
              trocando && styles.botaoDesabilitado,
            ]}
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
      </ScrollView>

      {modalRecorte}
    </View>
  );
}

/* =========================================================
   COMPONENTE DE ENVIO DE IMAGENS
========================================================= */

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
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.iconeImagem}>
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
            {enviando
              ? 'Enviando...'
              : valor
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

/* =========================================================
   ESTILOS
========================================================= */

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

  inputMultilinha: {
    minHeight: 76,
    paddingTop: 11,
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

  iconeImagem: {
    fontSize: 22,
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

  secaoPersonalizacao: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    marginBottom: 8,
  },

  dicaSecao: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8a7d6f',
    marginBottom: 16,
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

  botaoDesabilitado: {
    opacity: 0.6,
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
});