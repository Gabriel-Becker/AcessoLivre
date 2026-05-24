import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '../../components/commons';
import { EtiquetaStatus } from '../../components/admin';
import { Button } from '../../components/ui';
import { obterCategoriaLabel, obterStatusLabel, obterTipoEtiquetaStatus } from './locaisConfig';

export const renderNomeUsuario = (item, altoContraste = false) => (
  <View>
    <ThemedText weight="bold" size="sm" altoContraste={altoContraste} color={altoContraste ? 'textOnPrimary' : 'textPrimary'}>
      {item.nome || 'Usuário sem nome'}
    </ThemedText>
  </View>
);

export const renderEmailUsuario = (item, altoContraste = false) => (
  <ThemedText color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={altoContraste}>
    {item.email || 'E-mail não informado'}
  </ThemedText>
);

export const renderRoleUsuario = (item, formatarRoleUsuario) => (
  <EtiquetaStatus
    texto={formatarRoleUsuario(item.role)}
    tipo={String(item?.role || 'ROLE_USER').toUpperCase() === 'ROLE_ADMIN' ? 'info' : 'neutro'}
  />
);

export const renderDataCadastroUsuario = (item, altoContraste = false) => (
  <ThemedText color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={altoContraste}>
    {item?.dataCadastro || 'Sem data'}
  </ThemedText>
);

export const renderAcoesUsuario = (item, usuario, styles, carregandoAcao, onEditar, onExcluir, altoContraste = false) => (
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
    <ThemedText color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" align="center" altoContraste={altoContraste}>
      Conta atual
    </ThemedText>
  )
);

export const colunasUsuarios = (usuario, styles, carregandoAcao, formatarRoleUsuario, onEditar, onExcluir, altoContraste = false) => [
  {
    chave: 'nome',
    sortKey: 'nome',
    titulo: 'Nome',
    flex: 1.4,
    minWidth: 180,
    render: (item) => renderNomeUsuario(item, altoContraste),
  },
  {
    chave: 'email',
    sortKey: 'email',
    titulo: 'E-mail',
    flex: 1.8,
    minWidth: 240,
    render: (item) => renderEmailUsuario(item, altoContraste),
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
    render: (item) => renderDataCadastroUsuario(item, altoContraste),
  },
  {
    chave: 'acoes',
    titulo: 'Ações',
    flex: 1.2,
    minWidth: 190,
    alinhamento: 'center',
    render: (item) => renderAcoesUsuario(item, usuario, styles, carregandoAcao, onEditar, onExcluir, altoContraste),
  },
];

export const renderNomeLocal = (item, altoContraste = false) => (
  <View>
    <ThemedText weight="bold" size="sm" altoContraste={altoContraste} color={altoContraste ? 'textOnPrimary' : 'textPrimary'}>
      {item.nome || 'Local sem nome'}
    </ThemedText>
  </View>
);

export const renderCategoriaLocal = (item) => (
  <EtiquetaStatus texto={obterCategoriaLabel(item?.categoria?.nome || item?.categoria)} tipo="neutro" />
);

export const renderCidadeLocal = (item, altoContraste = false) => (
  <ThemedText color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={altoContraste}>
    {item?.endereco?.cidade || 'N/I'} - {item?.endereco?.estado || 'N/I'}
  </ThemedText>
);

export const renderStatusLocal = (item) => (
  <EtiquetaStatus
    texto={obterStatusLabel(item?.status)}
    tipo={obterTipoEtiquetaStatus(item?.status)}
  />
);

export const renderAcoesLocal = (item, styles, carregandoAcao, onEditar, onExcluir, altoContraste = false) => (
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
);

export const colunasLocais = (styles, carregandoAcao, onEditar, onExcluir, altoContraste = false) => [
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
  {
    chave: 'status',
    titulo: 'Status',
    flex: 0.95,
    minWidth: 140,
    render: (item) => renderStatusLocal(item),
  },
  {
    chave: 'acoes',
    titulo: 'Ações',
    flex: 1.2,
    minWidth: 200,
    alinhamento: 'right',
    render: (item) => renderAcoesLocal(item, styles, carregandoAcao, onEditar, onExcluir, altoContraste),
  },
];
