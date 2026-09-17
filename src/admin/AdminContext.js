import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarTudoAdmin, login as loginApi } from '../api/api';

const CHAVE_SENHA = '@paroquia_admin_senha';

const DADOS_VAZIOS = {
  igrejas: [], horarios: [], avisos: [], eventos: [], pix: {}, config: {},
};

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [senha, setSenha] = useState(null); // null = ainda não checou / não logado
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [dados, setDados] = useState(DADOS_VAZIOS);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    verificarSessaoSalva();
  }, []);

  async function verificarSessaoSalva() {
    const senhaSalva = await AsyncStorage.getItem(CHAVE_SENHA);
    if (senhaSalva) {
      const resposta = await loginApi(senhaSalva);
      if (resposta && resposta.ok) {
        setSenha(senhaSalva);
        await carregarDados(senhaSalva);
      } else {
        await AsyncStorage.removeItem(CHAVE_SENHA);
      }
    }
    setVerificandoSessao(false);
  }

  async function entrar(senhaDigitada) {
    const resposta = await loginApi(senhaDigitada);
    if (resposta && resposta.ok) {
      setSenha(senhaDigitada);
      await AsyncStorage.setItem(CHAVE_SENHA, senhaDigitada);
      await carregarDados(senhaDigitada);
      return { ok: true };
    }
    return { ok: false, erro: 'Senha incorreta.' };
  }

  async function sair() {
    setSenha(null);
    setDados(DADOS_VAZIOS);
    await AsyncStorage.removeItem(CHAVE_SENHA);
  }

  const carregarDados = useCallback(async (senhaAtual) => {
    setCarregando(true);
    try {
      const resposta = await buscarTudoAdmin(senhaAtual || senha);
      if (resposta && resposta.ok !== false) {
        setDados({
          igrejas: resposta.igrejas || [],
          horarios: resposta.horarios || [],
          avisos: resposta.avisos || [],
          eventos: resposta.eventos || [],
          pix: resposta.pix || {},
          config: resposta.config || {},
        });
      }
    } catch (e) {
      // silencioso — a tela que chamou decide o que mostrar em caso de erro
    } finally {
      setCarregando(false);
    }
  }, [senha]);

  function nomeIgrejaPorId(id) {
    const i = dados.igrejas.find(x => x.ID === id);
    return i ? i.Nome : '—';
  }

  return (
    <AdminContext.Provider value={{
      senha, logado: !!senha, verificandoSessao,
      dados, carregando,
      entrar, sair, recarregar: () => carregarDados(),
      nomeIgrejaPorId,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin deve ser usado dentro de AdminProvider');
  return ctx;
}
