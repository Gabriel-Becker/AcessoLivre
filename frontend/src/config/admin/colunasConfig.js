import React from 'react';
import { View } from 'react-native';
import { ThemedText, Spacer } from '../../components/commons';
import { EtiquetaStatus } from '../../components/admin';
import { Button } from '../../components/ui';

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

export const renderEmailUsuario = (item) => (
  <ThemedText color="textSecondary" size="sm">
    {item.email || 'E-mail não informado'}
  </ThemedText>
);

export const renderRoleUsuario = (item, formatarRoleUsuario) => (
  <EtiquetaStatus
    texto={formatarRoleUsuario(item.role)}
    tipo={String(item?.role || 'ROLE_USER').toUpperCase() === 'ROLE_ADMIN' ? 'info' : 'neutro'}
  />
);

export const renderDataCadastroUsuario = (item) => (
  <ThemedText color="textSecondary" size="sm">
    {item?.dataCadastro || 'Sem data'}
  </ThemedText>
);

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

export const colunasUsuarios = (usuario, styles, carregandoAcao, formatarRoleUsuario, onEditar, onExcluir) => [
  {
    chave: 'nome',
    sortKey: 'nome',
    titulo: 'Nome',
    flex: 1.4,
    minWidth: 180,
    render: (item) => renderNomeUsuario(item),
  },
  {
    chave: 'email',
    sortKey: 'email',
    titulo: 'E-mail',
    flex: 1.8,
    minWidth: 240,
    render: (item) => renderEmailUsuario(item),
  },
  {
    chave: 'role',
    sortKey: 'role',
    titulo: 'Perfil',
    flex: 0.9,
    minWidth: 130,
    render: (item) => renderRoleUsuario(item, formatarRoleUsuario),
  },
  {
    chave: 'cadastro',
    sortKey: 'dataCadastro',
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

export const renderCategoriaLocal = (item) => (
  <EtiquetaStatus texto={item?.categoria?.nome || 'Não informada'} tipo="neutro" />
);

export const renderCidadeLocal = (item) => (
  <ThemedText color="textSecondary" size="sm">
    {item?.endereco?.cidade || 'N/I'} - {item?.endereco?.estado || 'N/I'}
  </ThemedText>
);

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
