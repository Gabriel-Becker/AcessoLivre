import React from 'react';
import { View } from 'react-native';
import { ThemedText, Spacer } from '../../components/commons';
import { EtiquetaStatus } from '../../components/admin';
import { Button } from '../../components/ui';

/**
 * Renderizador de coluna Nome para usuários
 */
export const renderNomeUsuario = (item) => (
  <View>
    <ThemedText weight="bold" size="sm">
      {item.nome || 'Usuário sem nome'}
    </ThemedText>
    <Spacer size="xs" />
    <ThemedText color="textSecondary" size="xs">
      ID #{item.idUsuario}
    </ThemedText>
  </View>
);

/**
 * Renderizador de coluna E-mail para usuários
 */
export const renderEmailUsuario = (item) => (
  <ThemedText color="textSecondary" size="sm">
    {item.email || 'E-mail não informado'}
  </ThemedText>
);

/**
 * Renderizador de coluna Perfil para usuários
 */
export const renderRoleUsuario = (item, formatarRoleUsuario) => (
  <EtiquetaStatus
    texto={formatarRoleUsuario(item.role)}
    tipo={String(item?.role || 'ROLE_USER').toUpperCase() === 'ROLE_ADMIN' ? 'info' : 'neutro'}
  />
);

/**
 * Renderizador de coluna Status para usuários
 */
export const renderStatusUsuario = (item) => (
  <EtiquetaStatus texto={item?.ativo ? 'Ativo' : 'Inativo'} tipo={item?.ativo ? 'sucesso' : 'perigo'} />
);

/**
 * Renderizador de coluna Cadastro para usuários
 */
export const renderDataCadastroUsuario = (item) => (
  <ThemedText color="textSecondary" size="sm">
    {item?.dataCadastro || 'Sem data'}
  </ThemedText>
);

/**
 * Renderizador de coluna Ações para usuários
 */
export const renderAcoesUsuario = (item, usuario, styles, carregandoAcao, onEditar, onExcluir) => (
  usuario?.idUsuario !== item.idUsuario ? (
    <View style={styles.acoesLinha}>
      <Button
        variant="outline"
        size="small"
        iconLeft="create-outline"
        loading={carregandoAcao}
        disabled={carregandoAcao}
        onPress={() => onEditar(item)}
      >
        Editar
      </Button>
      <Button
        variant="danger"
        size="small"
        iconLeft="trash-outline"
        loading={carregandoAcao}
        disabled={carregandoAcao}
        onPress={() => onExcluir(item)}
      >
        Excluir
      </Button>
    </View>
  ) : (
    <ThemedText color="textSecondary" size="sm" align="center">
      Conta atual
    </ThemedText>
  )
);

/**
 * Configuração de colunas para tabela de usuários
 */
export const colunasUsuarios = (usuario, styles, carregandoAcao, formatarRoleUsuario, onEditar, onExcluir) => [
  {
    chave: 'nome',
    titulo: 'Nome',
    flex: 1.4,
    minWidth: 180,
    render: (item) => renderNomeUsuario(item),
  },
  {
    chave: 'email',
    titulo: 'E-mail',
    flex: 1.8,
    minWidth: 240,
    render: (item) => renderEmailUsuario(item),
  },
  {
    chave: 'role',
    titulo: 'Perfil',
    flex: 0.9,
    minWidth: 130,
    render: (item) => renderRoleUsuario(item, formatarRoleUsuario),
  },
  {
    chave: 'status',
    titulo: 'Status',
    flex: 0.8,
    minWidth: 110,
    render: (item) => renderStatusUsuario(item),
  },
  {
    chave: 'cadastro',
    titulo: 'Cadastro',
    flex: 1.1,
    minWidth: 150,
    render: (item) => renderDataCadastroUsuario(item),
  },
  {
    chave: 'acoes',
    titulo: 'Ações',
    flex: 1.2,
    minWidth: 190,
    alinhamento: 'center',
    render: (item) => renderAcoesUsuario(item, usuario, styles, carregandoAcao, onEditar, onExcluir),
  },
];

/**
 * Renderizador de coluna Local para locais
 */
export const renderNomeLocal = (item) => (
  <View>
    <ThemedText weight="bold" size="sm">
      {item.nome || 'Local sem nome'}
    </ThemedText>
    <Spacer size="xs" />
    <ThemedText color="textSecondary" size="xs">
      ID #{item.idLocal}
    </ThemedText>
  </View>
);

/**
 * Renderizador de coluna Categoria para locais
 */
export const renderCategoriaLocal = (item) => (
  <EtiquetaStatus texto={item?.categoria?.nome || 'Não informada'} tipo="neutro" />
);

/**
 * Renderizador de coluna Cidade para locais
 */
export const renderCidadeLocal = (item) => (
  <ThemedText color="textSecondary" size="sm">
    {item?.endereco?.cidade || 'N/I'} - {item?.endereco?.estado || 'N/I'}
  </ThemedText>
);

/**
 * Configuração de colunas para tabela de locais
 */
export const colunasLocais = () => [
  {
    chave: 'nome',
    titulo: 'Local',
    flex: 1.7,
    minWidth: 220,
    render: (item) => renderNomeLocal(item),
  },
  {
    chave: 'categoria',
    titulo: 'Categoria',
    flex: 1,
    minWidth: 160,
    render: (item) => renderCategoriaLocal(item),
  },
  {
    chave: 'cidade',
    titulo: 'Cidade / UF',
    flex: 1.1,
    minWidth: 180,
    render: (item) => renderCidadeLocal(item),
  },
];
