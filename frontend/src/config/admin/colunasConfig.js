import React from 'react';
import { Platform, View } from 'react-native';
import { TextoTematizado } from '../../components/commons';
import { EtiquetaStatus } from '../../components/admin';
import { Botao } from '../../components/ui';
import { obterCategoriaLabel, obterStatusLabel, obterTipoEtiquetaStatus } from './locaisConfig';

const renderTextoTruncadoComTooltipWeb = (textoCompleto, children) => (
  <View {...(Platform.OS === 'web' ? { title: textoCompleto } : {})}>
    {children}
  </View>
);

const truncarComReticencias = (texto, limite = 32) => {
  const valor = String(texto || '').trim();
  if (!valor) return '';
  if (valor.length <= limite) return valor;
  return `${valor.slice(0, Math.max(0, limite - 3))}...`;
};

export const renderNomeUsuario = (item, altoContraste = false) => (
  renderTextoTruncadoComTooltipWeb(
    item.nome || 'Usuário sem nome',
    <TextoTematizado
      weight="bold"
      size="sm"
      numberOfLines={1}
      altoContraste={altoContraste}
      color={altoContraste ? 'textOnPrimary' : 'textPrimary'}
    >
      {truncarComReticencias(item.nome || 'Usuário sem nome', 36)}
    </TextoTematizado>
  )
);

export const renderEmailUsuario = (item, altoContraste = false) => (
  renderTextoTruncadoComTooltipWeb(
    item.email || 'E-mail não informado',
    <TextoTematizado color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={altoContraste} numberOfLines={1}>
      {truncarComReticencias(item.email || 'E-mail não informado', 42)}
    </TextoTematizado>
  )
);

export const renderRoleUsuario = (item, formatarRoleUsuario) => (
  <EtiquetaStatus
    texto={formatarRoleUsuario(item.role)}
    tipo={String(item?.role || 'ROLE_USER').toUpperCase() === 'ROLE_ADMIN' ? 'info' : 'neutro'}
  />
);

export const renderDataCadastroUsuario = (item, altoContraste = false) => (
  <TextoTematizado color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={altoContraste}>
    {formatarDataHora(item?.dataCadastro)}
  </TextoTematizado>
);

export const renderAcoesUsuario = (item, usuario, styles, carregandoAcao, onEditar, onExcluir, onReativar, altoContraste = false) => (
  usuario?.idUsuario !== item.idUsuario ? (
    <View style={styles.acoesLinha}>
      <Botao
        variant="outline"
        size="small"
        iconLeft="create-outline"
        loading={carregandoAcao}
        disabled={carregandoAcao}
        onPress={() => onEditar(item)}
      >
        Editar
      </Botao>
      {item?.ativo === false ? (
        <Botao
          variant="primary"
          size="small"
          iconLeft="refresh-outline"
          loading={carregandoAcao}
          disabled={carregandoAcao}
          onPress={() => onReativar(item)}
        >
          Reativar
        </Botao>
      ) : (
        <Botao
          variant="danger"
          size="small"
          iconLeft="trash-outline"
          loading={carregandoAcao}
          disabled={carregandoAcao}
          onPress={() => onExcluir(item)}
        >
          Excluir
        </Botao>
      )}
    </View>
  ) : (
    <TextoTematizado color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" align="center" altoContraste={altoContraste}>
      Conta atual
    </TextoTematizado>
  )
);

export const colunasUsuarios = (usuario, styles, carregandoAcao, formatarRoleUsuario, onEditar, onExcluir, onReativar, altoContraste = false) => [
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
    minWidth: 230,
    alinhamento: 'center',
    render: (item) => renderAcoesUsuario(item, usuario, styles, carregandoAcao, onEditar, onExcluir, onReativar, altoContraste),
  },
];

export const renderNomeLocal = (item, altoContraste = false) => (
  renderTextoTruncadoComTooltipWeb(
    item.nome || 'Local sem nome',
    <TextoTematizado
      weight="bold"
      size="sm"
      numberOfLines={1}
      altoContraste={altoContraste}
      color={altoContraste ? 'textOnPrimary' : 'textPrimary'}
    >
      {truncarComReticencias(item.nome || 'Local sem nome', 48)}
    </TextoTematizado>
  )
);

export const renderCategoriaLocal = (item, altoContraste = false) => (
  <EtiquetaStatus texto={obterCategoriaLabel(item?.categoria?.nome || item?.categoria)} tipo="neutro" altoContraste={altoContraste} />
);

export const renderCidadeLocal = (item, altoContraste = false) => (
  renderTextoTruncadoComTooltipWeb(
    `${item?.endereco?.cidade || 'N/I'} - ${item?.endereco?.estado || 'N/I'}`,
    <TextoTematizado color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={altoContraste} numberOfLines={1}>
      {truncarComReticencias(`${item?.endereco?.cidade || 'N/I'} - ${item?.endereco?.estado || 'N/I'}`, 30)}
    </TextoTematizado>
  )
);

export const renderStatusLocal = (item, altoContraste = false) => (
  <EtiquetaStatus
    texto={obterStatusLabel(item?.status)}
    tipo={obterTipoEtiquetaStatus(item?.status)}
    altoContraste={altoContraste}
  />
);

const formatarDataHora = (valor) => {
  if (!valor) return 'Sem data';

  const texto = String(valor).trim();

  // Backend pode enviar em "dd/MM/yyyy HH:mm:ss"; nesse caso
  // montamos o texto diretamente para evitar parse inconsistente no JS.
  const matchFormatoBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::\d{2})?$/);
  if (matchFormatoBr) {
    const [, dia, mes, ano, hora, minuto] = matchFormatoBr;
    return `${dia}/${mes}/${ano} - ${hora}:${minuto}`;
  }

  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) return 'Sem data';

  const partes = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  }).formatToParts(data);

  const mapa = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  if (!mapa.day || !mapa.month || !mapa.year || !mapa.hour || !mapa.minute) {
    return 'Sem data';
  }

  return `${mapa.day}/${mapa.month}/${mapa.year} - ${mapa.hour}:${mapa.minute}`;
};

export const renderDataCadastroLocal = (item, altoContraste = false) => (
  <TextoTematizado color={altoContraste ? 'textOnPrimary' : 'textSecondary'} size="sm" altoContraste={altoContraste}>
    {formatarDataHora(item?.dataCriacao)}
  </TextoTematizado>
);

export const renderAcoesLocal = (item, styles, carregandoAcao, onEditar, onExcluir, altoContraste = false) => (
  <View style={styles.acoesLinha}>
    <Botao
      variant="outline"
      size="small"
      iconLeft="create-outline"
      loading={carregandoAcao}
      disabled={carregandoAcao}
      onPress={() => onEditar(item)}
      altoContraste={altoContraste}
    >
      Editar
    </Botao>
    <Botao
      variant="danger"
      size="small"
      iconLeft="trash-outline"
      loading={carregandoAcao}
      disabled={carregandoAcao}
      onPress={() => onExcluir(item)}
      altoContraste={altoContraste}
    >
      Excluir
    </Botao>
  </View>
);

export const colunasLocais = (styles, carregandoAcao, onEditar, onExcluir, altoContraste = false) => [
  {
    chave: 'nome',
    titulo: 'Local',
    flex: 1.4,
    minWidth: 180,
    render: (item, _, altoContraste) => renderNomeLocal(item, altoContraste),
  },
  {
    chave: 'categoria',
    titulo: 'Categoria',
    flex: 0.9,
    minWidth: 120,
    render: (item, _, altoContraste) => renderCategoriaLocal(item, altoContraste),
  },
  {
    chave: 'cidade',
    titulo: 'Cidade / UF',
    flex: 0.9,
    minWidth: 140,
    render: (item, _, altoContraste) => renderCidadeLocal(item, altoContraste),
  },
  {
    chave: 'cadastro',
    sortKey: 'dataCriacao',
    titulo: 'Cadastro',
    flex: 1.1,
    minWidth: 170,
    render: (item, _, altoContraste) => renderDataCadastroLocal(item, altoContraste),
  },
  {
    chave: 'acoes',
    titulo: 'Ações',
    flex: 1.2,
    minWidth: 190,
    alinhamento: 'center',
    render: (item, _, altoContraste) => renderAcoesLocal(item, styles, carregandoAcao, onEditar, onExcluir, altoContraste),
  },
];
