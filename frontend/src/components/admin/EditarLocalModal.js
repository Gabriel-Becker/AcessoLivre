import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, CartaoSelecao, Input, Select } from '../ui';
import { Spacer, ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import LocalService from '../../services/LocalService';
import toastHelper from '../../utils/toastHelper';
import { CATEGORIAS } from '../../constants/enums';
import { RECURSOS_ACESSIBILIDADE, STATUS_LOCAL_OPCOES } from '../../config/admin/locaisConfig';
import { obterCategoriaIcone, obterCategoriaLabel } from '../../config/categoriasConfig';
import { getTheme } from '../../config/theme';

const FORMULARIO_INICIAL = {
  nome: '',
  descricao: '',
  categoria: '',
  status: 'EM_ANALISE',
  tiposAcessibilidade: [],
  idUsuario: null,
  idEndereco: null,
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
};

export default function EditarLocalModal({ visible, onClose, local, onSucesso, altoContraste = false }) {
  const { isHighContrast, fontSizeMultiplier } = useThemeContext();
  const contrasteAtivo = typeof altoContraste === 'boolean' ? altoContraste : isHighContrast;
  const t = useMemo(() => getTheme(contrasteAtivo, fontSizeMultiplier), [contrasteAtivo, fontSizeMultiplier]);
  const { width } = useWindowDimensions();
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState('');
  const [dadosOriginais, setDadosOriginais] = useState(FORMULARIO_INICIAL);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  const opcoesCategoria = useMemo(
    () => CATEGORIAS.map((categoria) => ({
      value: categoria,
      label: obterCategoriaLabel(categoria),
      icon: obterCategoriaIcone(categoria),
    })),
    []
  );

  const isWideLayout = width >= 1200;
  const estilos = useMemo(() => criarEstilos(t, isWideLayout, contrasteAtivo), [t, isWideLayout, contrasteAtivo]);
  const larguraModal = width < 768 ? '96%' : width < 1100 ? '90%' : '88%';

  const normalizarArray = (valor) => (Array.isArray(valor) ? [...valor].sort().join('|') : '');

  const carregarDadosLocal = useCallback(async () => {
    if (!visible || !local?.idLocal) {
      return;
    }

    setCarregandoDados(true);
    setErro('');

    try {
      const dados = await LocalService.obterLocal(local.idLocal);
      const endereco = dados?.endereco || {};
      const tiposAcessibilidade = Array.isArray(dados?.tiposAcessibilidade) ? dados.tiposAcessibilidade : [];
      const formularioCarregado = {
        nome: String(dados?.nome || local?.nome || ''),
        descricao: String(dados?.descricao || local?.descricao || ''),
        categoria: String(dados?.categoria || local?.categoria || ''),
        status: String(dados?.status || local?.status || 'EM_ANALISE').toUpperCase(),
        tiposAcessibilidade,
        idUsuario: dados?.idUsuario || local?.idUsuario || null,
        idEndereco: endereco?.idEndereco || dados?.idEndereco || null,
        cep: String(endereco?.cep || ''),
        logradouro: String(endereco?.logradouro || ''),
        numero: String(endereco?.numero || ''),
        complemento: String(endereco?.complemento || ''),
        bairro: String(endereco?.bairro || ''),
        cidade: String(endereco?.cidade || ''),
        estado: String(endereco?.estado || ''),
      };

      setFormulario(formularioCarregado);
      setDadosOriginais(formularioCarregado);
    } catch (error) {
      const mensagem = error?.response?.data?.message || 'Não foi possível carregar os dados do local.';
      setErro(mensagem);
      toastHelper.showError(mensagem, 'Falha ao carregar local');

      const tiposAcessibilidade = Array.isArray(local?.tiposAcessibilidade) ? local.tiposAcessibilidade : [];
      const fallback = {
        ...FORMULARIO_INICIAL,
        nome: String(local?.nome || ''),
        descricao: String(local?.descricao || ''),
        categoria: String(local?.categoria || ''),
        status: String(local?.status || 'EM_ANALISE').toUpperCase(),
        tiposAcessibilidade,
        idUsuario: local?.idUsuario || null,
        idEndereco: local?.endereco?.idEndereco || null,
        cep: String(local?.endereco?.cep || ''),
        logradouro: String(local?.endereco?.logradouro || ''),
        numero: String(local?.endereco?.numero || ''),
        complemento: String(local?.endereco?.complemento || ''),
        bairro: String(local?.endereco?.bairro || ''),
        cidade: String(local?.endereco?.cidade || ''),
        estado: String(local?.endereco?.estado || ''),
      };

      setFormulario(fallback);
      setDadosOriginais(fallback);
    } finally {
      setCarregandoDados(false);
    }
  }, [visible, local]);

  useEffect(() => {
    if (visible) {
      const timeoutId = setTimeout(() => {
        carregarDadosLocal();
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setFormulario(FORMULARIO_INICIAL);
      setDadosOriginais(FORMULARIO_INICIAL);
      setErro('');
      setCarregandoDados(false);
      setSubmitting(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [visible, local?.idLocal, carregarDadosLocal]);

  const atualizarCampo = (campo) => (valor) => {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const alternarRecurso = (enumValue) => {
    setFormulario((anterior) => {
      const tipos = new Set(anterior.tiposAcessibilidade);
      if (tipos.has(enumValue)) {
        tipos.delete(enumValue);
      } else {
        tipos.add(enumValue);
      }

      return {
        ...anterior,
        tiposAcessibilidade: Array.from(tipos),
      };
    });
  };

  const houveMudancas = useMemo(() => {
    return [
      formulario.nome.trim(),
      formulario.descricao.trim(),
      String(formulario.categoria || '').trim(),
      String(formulario.status || '').trim().toUpperCase(),
      normalizarArray(formulario.tiposAcessibilidade),
      String(formulario.cep || '').trim(),
      String(formulario.logradouro || '').trim(),
      String(formulario.numero || '').trim(),
      String(formulario.complemento || '').trim(),
      String(formulario.bairro || '').trim(),
      String(formulario.cidade || '').trim(),
      String(formulario.estado || '').trim().toUpperCase(),
    ].join('~') !== [
      dadosOriginais.nome.trim(),
      dadosOriginais.descricao.trim(),
      String(dadosOriginais.categoria || '').trim(),
      String(dadosOriginais.status || '').trim().toUpperCase(),
      normalizarArray(dadosOriginais.tiposAcessibilidade),
      String(dadosOriginais.cep || '').trim(),
      String(dadosOriginais.logradouro || '').trim(),
      String(dadosOriginais.numero || '').trim(),
      String(dadosOriginais.complemento || '').trim(),
      String(dadosOriginais.bairro || '').trim(),
      String(dadosOriginais.cidade || '').trim(),
      String(dadosOriginais.estado || '').trim().toUpperCase(),
    ].join('~');
  }, [dadosOriginais, formulario]);

  const validarFormulario = () => {
    if (!formulario.nome.trim()) {
      setErro('Nome do local é obrigatório.');
      return false;
    }

    if (!formulario.descricao.trim()) {
      setErro('Descrição é obrigatória.');
      return false;
    }

    if (!formulario.categoria) {
      setErro('Categoria é obrigatória.');
      return false;
    }

    if (!formulario.idUsuario) {
      setErro('Não foi possível identificar o usuário responsável.');
      return false;
    }

    if (!formulario.cep.trim() || !formulario.logradouro.trim() || !formulario.numero.trim() || !formulario.bairro.trim() || !formulario.cidade.trim() || !formulario.estado.trim()) {
      setErro('Preencha os campos de endereço antes de salvar.');
      return false;
    }

    if (!Array.isArray(formulario.tiposAcessibilidade) || formulario.tiposAcessibilidade.length === 0) {
      setErro('Selecione ao menos um recurso de acessibilidade.');
      return false;
    }

    return true;
  };

  const handleSalvar = async () => {
    if (submitting || carregandoDados) {
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    if (!houveMudancas) {
      setErro('Faça uma alteração para habilitar o salvamento.');
      return;
    }

    setSubmitting(true);
    setErro('');

    try {
      const payload = {
        nome: formulario.nome.trim(),
        descricao: formulario.descricao.trim(),
        categoria: formulario.categoria,
        status: formulario.status || 'EM_ANALISE',
        tiposAcessibilidade: formulario.tiposAcessibilidade,
        idUsuario: formulario.idUsuario,
        idEndereco: formulario.idEndereco || undefined,
        endereco: {
          idUsuario: formulario.idUsuario,
          cep: formulario.cep.replace(/\D/g, ''),
          logradouro: formulario.logradouro.trim(),
          numero: formulario.numero.trim(),
          complemento: formulario.complemento.trim(),
          bairro: formulario.bairro.trim(),
          cidade: formulario.cidade.trim(),
          estado: formulario.estado.trim().toUpperCase(),
        },
      };

      await LocalService.atualizarLocal(local.idLocal, payload);
      toastHelper.showSuccess('Local atualizado com sucesso.');
      onSucesso?.();
      onClose?.();
    } catch (error) {
      const mensagem = error?.response?.data?.message || 'Não foi possível salvar as alterações do local.';
      setErro(mensagem);
      toastHelper.showError(mensagem, 'Falha ao atualizar local');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting || carregandoDados) {
      return;
    }

    setFormulario(FORMULARIO_INICIAL);
    setDadosOriginais(FORMULARIO_INICIAL);
    setErro('');
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={estilos.overlay}>
        <View style={[estilos.container, { backgroundColor: t.colors.surface, width: larguraModal }]}> 
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={estilos.conteudoScroll}
          >
            <View style={estilos.header}>
              <View style={estilos.headerTexto}>
                <ThemedText variant="h2" weight="bold" altoContraste={contrasteAtivo} color={contrasteAtivo ? 'textOnPrimary' : 'textPrimary'} style={estilos.titulo}>
                  Editar local
                </ThemedText>
                <Spacer size="xs" />
                <ThemedText color={contrasteAtivo ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={contrasteAtivo} style={estilos.headerSubtitulo}>
                  Ajuste os dados essenciais sem sair do painel de administração.
                </ThemedText>
              </View>

              <TouchableOpacity onPress={handleClose} style={estilos.botaoFechar}>
                <Ionicons name="close" size={22} color={contrasteAtivo ? t.colors.textOnPrimary : t.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Spacer size="lg" />

            {carregandoDados ? (
              <View style={estilos.estadoCentralizado}>
                <ThemedText color={contrasteAtivo ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={contrasteAtivo}>
                  Carregando dados do local...
                </ThemedText>
              </View>
            ) : null}

            {!carregandoDados ? (
              <>
                <View style={estilos.grid}>
                  <View style={estilos.campoDuplo}>
                    <Input
                      label="Nome do local"
                      placeholder="Digite o nome do local"
                      value={formulario.nome}
                      onChangeText={atualizarCampo('nome')}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Select
                      label="Categoria"
                      placeholder="Selecione a categoria"
                      value={formulario.categoria}
                      options={opcoesCategoria}
                      onSelect={(valor) => atualizarCampo('categoria')(valor)}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Select
                      label="Status"
                      placeholder="Selecione o status"
                      value={formulario.status}
                      options={STATUS_LOCAL_OPCOES}
                      onSelect={(valor) => atualizarCampo('status')(valor)}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Input
                      label="CEP"
                      placeholder="00000000"
                      value={formulario.cep}
                      onChangeText={atualizarCampo('cep')}
                      keyboardType="numeric"
                      maxLength={9}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Input
                      label="Logradouro"
                      placeholder="Rua, avenida, praça"
                      value={formulario.logradouro}
                      onChangeText={atualizarCampo('logradouro')}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Input
                      label="Número"
                      placeholder="123"
                      value={formulario.numero}
                      onChangeText={atualizarCampo('numero')}
                      keyboardType="numeric"
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Input
                      label="Complemento"
                      placeholder="Sala, bloco, andar"
                      value={formulario.complemento}
                      onChangeText={atualizarCampo('complemento')}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Input
                      label="Bairro"
                      placeholder="Centro"
                      value={formulario.bairro}
                      onChangeText={atualizarCampo('bairro')}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Input
                      label="Cidade"
                      placeholder="Florianópolis"
                      value={formulario.cidade}
                      onChangeText={atualizarCampo('cidade')}
                      altoContraste={contrasteAtivo}
                    />
                  </View>

                  <View style={estilos.campoDuplo}>
                    <Input
                      label="Estado"
                      placeholder="UF"
                      value={formulario.estado}
                      onChangeText={atualizarCampo('estado')}
                      autoCapitalize="characters"
                      maxLength={2}
                      altoContraste={contrasteAtivo}
                    />
                  </View>
                </View>

                <Input
                  label="Descrição"
                  placeholder="Descreva o local e as condições de acessibilidade"
                  value={formulario.descricao}
                  onChangeText={atualizarCampo('descricao')}
                  multiline
                  numberOfLines={4}
                  altoContraste={contrasteAtivo}
                />

                <Spacer size="sm" />

                <View style={estilos.blocoRecursos}>
                  <ThemedText variant="h3" weight="bold" altoContraste={contrasteAtivo} color={contrasteAtivo ? 'textOnPrimary' : 'textPrimary'}>
                    Recursos de acessibilidade
                  </ThemedText>
                  <Spacer size="xs" />
                  <ThemedText color={contrasteAtivo ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={contrasteAtivo}>
                    Selecione os recursos que o local realmente possui.
                  </ThemedText>

                  <Spacer size="md" />

                  <View style={estilos.recursosGrid}>
                    {RECURSOS_ACESSIBILIDADE.map((recurso) => (
                      <CartaoSelecao
                        key={recurso.id}
                        titulo={recurso.titulo}
                        descricao={recurso.descricao}
                        icone={recurso.icon}
                        corDestaque={t.colors.accessibility?.[recurso.cor] || t.colors.primary}
                        selecionado={formulario.tiposAcessibilidade.includes(recurso.enumValue)}
                        onPress={() => alternarRecurso(recurso.enumValue)}
                        altoContraste={contrasteAtivo}
                        style={estilos.recursoItem}
                      />
                    ))}
                  </View>
                </View>

                {erro ? (
                  <>
                    <Spacer size="md" />
                    <ThemedText color="error" size="sm" align="center" altoContraste={contrasteAtivo}>
                      {erro}
                    </ThemedText>
                  </>
                ) : null}

                <Spacer size="lg" />

                <View style={estilos.botoes}>
                  <Button
                    variant="primary"
                    size="medium"
                    fullWidth
                    onPress={handleSalvar}
                    loading={submitting}
                    disabled={submitting || carregandoDados}
                    altoContraste={contrasteAtivo}
                  >
                    Salvar alterações
                  </Button>

                  <Button
                    variant="outline"
                    size="medium"
                    fullWidth
                    onPress={handleClose}
                    disabled={submitting || carregandoDados}
                    altoContraste={contrasteAtivo}
                  >
                    Cancelar
                  </Button>
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function criarEstilos(t, isWideLayout, altoContraste) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: altoContraste ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.55)',
      padding: t.spacing.md,
    },
    container: {
      maxHeight: '92%',
      borderRadius: t.borderRadius.xl,
      padding: t.spacing.xl,
      overflow: 'hidden',
      borderWidth: altoContraste ? 2 : 0,
      borderColor: altoContraste ? t.colors.border : 'transparent',
      ...t.shadows.lg,
    },
    conteudoScroll: {
      paddingBottom: t.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: t.spacing.md,
    },
    headerTexto: {
      flex: 1,
    },
    titulo: {
      fontSize: 26,
      lineHeight: 32,
    },
    headerSubtitulo: {
      fontSize: 16,
      lineHeight: 24,
    },
    botaoFechar: {
      width: 36,
      height: 36,
      borderRadius: t.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: altoContraste ? t.colors.surfaceSecondary : t.colors.backgroundTertiary,
      borderWidth: altoContraste ? 1 : 0,
      borderColor: altoContraste ? t.colors.border : 'transparent',
    },
    estadoCentralizado: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: t.spacing.xl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.sm,
      marginBottom: t.spacing.sm,
    },
    campoDuplo: {
      width: isWideLayout ? '31.5%' : '48%',
      minWidth: isWideLayout ? 220 : 240,
      flexGrow: 1,
    },
    blocoRecursos: {
      marginTop: t.spacing.sm,
      paddingTop: t.spacing.md,
      paddingHorizontal: altoContraste ? t.spacing.sm : 0,
      paddingBottom: altoContraste ? t.spacing.sm : 0,
      borderRadius: altoContraste ? t.borderRadius.md : 0,
      borderTopWidth: 1,
      borderTopColor: t.colors.borderLight,
      backgroundColor: altoContraste ? t.colors.surfaceSecondary : 'transparent',
    },
    recursosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.sm,
      marginBottom: t.spacing.sm,
    },
    recursoItem: {
      width: isWideLayout ? '31.5%' : '48%',
      minWidth: isWideLayout ? 220 : 240,
      flexGrow: 1,
    },
    botoes: {
      gap: t.spacing.sm,
    },
  });
}