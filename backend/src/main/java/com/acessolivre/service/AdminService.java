package com.acessolivre.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Comparator;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.acessolivre.enums.Role;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.AvaliacaoRepository;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private static final String UTF8_BOM = "\uFEFF";
    private static final DateTimeFormatter FMT_DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FMT_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final ZoneId ZONA_PADRAO_RELATORIO = ZoneId.of("America/Sao_Paulo");

    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final LocalRepository localRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<Usuario> listarTodosUsuarios(Pageable pageable) {
        log.info("Listando usuários ativos com paginação: página={}, tamanho={}",
                pageable.getPageNumber(), pageable.getPageSize());
        return usuarioRepository.findAllByAtivoTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Usuario> listarUsuariosPorStatus(Pageable pageable, Boolean ativo) {
        boolean ativoNormalizado = ativo == null || Boolean.TRUE.equals(ativo);
        log.info("Listando usuários por status com paginação: página={}, tamanho={}, ativo={}",
                pageable.getPageNumber(), pageable.getPageSize(), ativoNormalizado);

        if (ativoNormalizado) {
            return usuarioRepository.findAllByAtivoTrue(pageable);
        }

        return usuarioRepository.findAllByAtivoFalse(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional
    public boolean alterarRoleUsuario(Long idUsuario, String novaRole) {
        log.info("Alterando role do usuário: id={}, novaRole={}", idUsuario, novaRole);

        Optional<Usuario> usuarioOpt = usuarioRepository.findByIdUsuarioAndAtivoTrue(idUsuario);
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário não encontrado para alteração de role: id={}", idUsuario);
            return false;
        }

        Usuario usuario = usuarioOpt.get();
        String normalized = (novaRole != null ? novaRole.trim().toUpperCase() : "USER");
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }

        usuario.setRole(com.acessolivre.enums.Role.valueOf(normalized));
        usuarioRepository.save(usuario);
        return true;
    }

    @Transactional
    public boolean deletarUsuario(Long idUsuario) {
        log.info("Deletando usuário logicamente: id={}", idUsuario);

        Optional<Usuario> usuarioOpt = usuarioRepository.findByIdUsuarioAndAtivoTrue(idUsuario);
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário não encontrado para deletar: id={}", idUsuario);
            return false;
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setAtivo(false);
        usuario.setTokenAtual(null);
        usuarioRepository.save(usuario);

        return true;
    }

    @Transactional
    public boolean reativarUsuario(Long idUsuario) {
        log.info("Reativando usuário: id={}", idUsuario);

        Optional<Usuario> usuarioOpt = usuarioRepository.findByIdUsuarioAndAtivoFalse(idUsuario);
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário inativo não encontrado para reativar: id={}", idUsuario);
            return false;
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setAtivo(true);
        usuarioRepository.save(usuario);

        return true;
    }

    @Transactional
    public boolean alterarSenhaUsuario(Long idUsuario, String novaSenha) {
        log.info("Alterando senha do usuário: id={}", idUsuario);

        if (usuarioRepository.findByIdUsuarioAndAtivoTrue(idUsuario).isEmpty()) {
            log.warn("Usuário não encontrado para alterar senha: id={}", idUsuario);
            return false;
        }

        var usuarioAutenticarOpt = usuarioAutenticarRepository.findByUsuario_IdUsuario(idUsuario);
        if (usuarioAutenticarOpt.isEmpty()) return false;

        var usuarioAutenticar = usuarioAutenticarOpt.get();
        usuarioAutenticar.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioAutenticarRepository.save(usuarioAutenticar);

        return true;
    }

    @Transactional(readOnly = true)
    public List<Avaliacao> listarAvaliacoesPendentes() {
        return avaliacaoRepository.findByModerado(false);
    }

    @Transactional
    public boolean aprovarAvaliacao(Long idAvaliacao) {
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findById(idAvaliacao);
        if (avaliacaoOpt.isEmpty()) return false;

        Avaliacao avaliacao = avaliacaoOpt.get();
        avaliacao.setModerado(true);
        avaliacaoRepository.save(avaliacao);
        return true;
    }

    @Transactional
    public boolean rejeitarAvaliacao(Long idAvaliacao) {
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findById(idAvaliacao);
        if (avaliacaoOpt.isEmpty()) return false;

        Long idLocal = avaliacaoOpt.get().getLocal().getIdLocal();
        avaliacaoRepository.deleteById(idAvaliacao);
        recalcularMediaLocal(idLocal);
        return true;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasGerais() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsuarios", usuarioRepository.countByAtivoTrue());
        stats.put("totalLocais", localRepository.count());
        stats.put("totalAvaliacoes", avaliacaoRepository.count());
        stats.put("avaliacoesPendentes", avaliacaoRepository.findByModerado(false).size());

        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterRelatorioUsuarios(LocalDate dataInicio, LocalDate dataFim) {
        List<Usuario> usuarios = usuarioRepository.findAll().stream()
                .filter(u -> estaNoPeriodo(u.getDataCadastro(), dataInicio, dataFim))
                .toList();
        long totalUsuarios = usuarios.size();
        long totalAtivos = usuarios.stream().filter(u -> Boolean.TRUE.equals(u.getAtivo())).count();
        long totalInativos = totalUsuarios - totalAtivos;
        long totalAdmins = usuarios.stream().filter(u -> Role.ROLE_ADMIN.equals(u.getRole())).count();
        long totalUsuariosComuns = totalUsuarios - totalAdmins;

        var agora = agoraRelatorio();
        var limite30Dias = agora.minusDays(30);
        long cadastrosUltimos30Dias = usuarios.stream()
            .filter(u -> u.getDataCadastro() != null && !u.getDataCadastro().isBefore(limite30Dias))
            .count();

        Map<String, Long> distribuicaoPorPerfil = new LinkedHashMap<>();
        distribuicaoPorPerfil.put("Usuário", totalUsuariosComuns);
        distribuicaoPorPerfil.put("Admin", totalAdmins);

        Map<String, Long> cadastrosUltimosSeisMeses = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth referencia = java.time.YearMonth.now(ZONA_PADRAO_RELATORIO).minusMonths(i);
            String chave = String.format("%02d/%d", referencia.getMonthValue(), referencia.getYear());
            cadastrosUltimosSeisMeses.put(chave, 0L);
        }

        usuarios.stream()
            .filter(u -> u.getDataCadastro() != null)
            .forEach(u -> {
                String chave = String.format("%02d/%d", u.getDataCadastro().getMonthValue(), u.getDataCadastro().getYear());
                if (cadastrosUltimosSeisMeses.containsKey(chave)) {
                cadastrosUltimosSeisMeses.put(chave, cadastrosUltimosSeisMeses.get(chave) + 1);
                }
            });

        List<Map<String, Object>> ultimosUsuarios = usuarios.stream()
            .sorted(Comparator.comparing(Usuario::getDataCadastro, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .limit(10)
            .map(usuario -> {
                Map<String, Object> dto = new LinkedHashMap<>();
                dto.put("idUsuario", usuario.getIdUsuario());
                dto.put("nome", usuario.getNome());
                dto.put("email", usuario.getEmail());
                dto.put("role", usuario.getRole() != null ? usuario.getRole().name() : "SEM_ROLE");
                dto.put("ativo", Boolean.TRUE.equals(usuario.getAtivo()));
                dto.put("twoFactorEnabled", Boolean.TRUE.equals(usuario.getTwoFactorEnabled()));
                dto.put("dataCadastro", usuario.getDataCadastro());
                return dto;
            })
            .toList();

        Map<String, Object> relatorio = new LinkedHashMap<>();
        relatorio.put("totalUsuarios", totalUsuarios);
        relatorio.put("totalAtivos", totalAtivos);
        relatorio.put("totalInativos", totalInativos);
        relatorio.put("totalAdmins", totalAdmins);
        relatorio.put("totalUsuariosComuns", totalUsuariosComuns);
        relatorio.put("cadastrosUltimos30Dias", cadastrosUltimos30Dias);
        relatorio.put("distribuicaoPorPerfil", distribuicaoPorPerfil);
        relatorio.put("cadastrosUltimosSeisMeses", cadastrosUltimosSeisMeses);
        relatorio.put("ultimosUsuarios", ultimosUsuarios);
        relatorio.put("filtroDataInicio", dataInicio);
        relatorio.put("filtroDataFim", dataFim);
        relatorio.put("geradoEm", agora);

        return relatorio;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterRelatorioLocais(LocalDate dataInicio, LocalDate dataFim) {
        List<Local> locais = localRepository.findAll().stream()
                .filter(l -> estaNoPeriodo(l.getDataCriacao(), dataInicio, dataFim))
                .toList();
        Set<Long> idsLocaisFiltrados = locais.stream()
            .map(Local::getIdLocal)
            .filter(id -> id != null)
            .collect(Collectors.toCollection(HashSet::new));

        List<Avaliacao> avaliacoesFiltradas = avaliacaoRepository.findAll().stream()
            .filter(av -> av.getLocal() != null && idsLocaisFiltrados.contains(av.getLocal().getIdLocal()))
            .filter(av -> estaNoPeriodo(av.getDataAvaliacao(), dataInicio, dataFim))
            .toList();

        long totalLocais = locais.size();
        long locaisComAvaliacao = avaliacoesFiltradas.stream()
            .map(av -> av.getLocal() != null ? av.getLocal().getIdLocal() : null)
            .filter(id -> id != null)
            .distinct()
            .count();
        long locaisSemAvaliacao = totalLocais - locaisComAvaliacao;

        double mediaAvaliacaoGeral = avaliacoesFiltradas.stream()
            .map(Avaliacao::getNotaGeral)
            .filter(nota -> nota != null && nota > 0)
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);

        Map<String, Long> distribuicaoPorStatus = locais.stream()
            .collect(Collectors.groupingBy(
                l -> l.getStatus() != null ? l.getStatus().name() : "SEM_STATUS",
                Collectors.counting()
            ));

        Map<String, Long> distribuicaoPorCategoria = locais.stream()
            .collect(Collectors.groupingBy(
                l -> l.getCategoria() != null ? l.getCategoria().name() : "SEM_CATEGORIA",
                Collectors.counting()
            ));

        Map<String, Long> distribuicaoPorEstado = locais.stream()
            .collect(Collectors.groupingBy(
                l -> {
                    if (l.getEndereco() == null || l.getEndereco().getEstado() == null || l.getEndereco().getEstado().isBlank()) {
                    return "NÃO INFORMADO";
                    }
                    return l.getEndereco().getEstado().trim().toUpperCase();
                },
                Collectors.counting()
            ));

        Map<String, Long> distribuicaoPorTipoAcessibilidade = new HashMap<>();
        locais.forEach(local -> {
            if (local.getTiposAcessibilidade() == null) {
                return;
            }
            local.getTiposAcessibilidade().forEach(tipo -> {
            String chave = tipo != null ? tipo.name() : "SEM_TIPO";
            distribuicaoPorTipoAcessibilidade.put(chave, distribuicaoPorTipoAcessibilidade.getOrDefault(chave, 0L) + 1);
            });
        });

        List<Map<String, Object>> locaisMaisBemAvaliados = locais.stream()
            .filter(l -> l.getAvaliacaoMedia() != null)
            .sorted(Comparator.comparing(Local::getAvaliacaoMedia, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .limit(10)
            .map(local -> {
                Map<String, Object> dto = new LinkedHashMap<>();
                dto.put("idLocal", local.getIdLocal());
                dto.put("nome", local.getNome());
                dto.put("categoria", local.getCategoria() != null ? local.getCategoria().name() : "SEM_CATEGORIA");
                dto.put("status", local.getStatus() != null ? local.getStatus().name() : "SEM_STATUS");
                dto.put("avaliacaoMedia", local.getAvaliacaoMedia());
                dto.put("cidade", local.getEndereco() != null ? local.getEndereco().getCidade() : null);
                dto.put("estado", local.getEndereco() != null ? local.getEndereco().getEstado() : null);
                dto.put("dataCriacao", local.getDataCriacao());
                return dto;
            })
            .toList();

        List<Map<String, Object>> locaisRecentes = locais.stream()
            .sorted(Comparator.comparing(Local::getDataCriacao, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .limit(10)
            .map(local -> {
                Map<String, Object> dto = new LinkedHashMap<>();
                dto.put("idLocal", local.getIdLocal());
                dto.put("nome", local.getNome());
                dto.put("categoria", local.getCategoria() != null ? local.getCategoria().name() : "SEM_CATEGORIA");
                dto.put("status", local.getStatus() != null ? local.getStatus().name() : "SEM_STATUS");
                dto.put("cidade", local.getEndereco() != null ? local.getEndereco().getCidade() : null);
                dto.put("estado", local.getEndereco() != null ? local.getEndereco().getEstado() : null);
                dto.put("dataCriacao", local.getDataCriacao());
                return dto;
            })
            .toList();

        Map<String, Object> relatorio = new LinkedHashMap<>();
        relatorio.put("totalLocais", totalLocais);
        relatorio.put("locaisComAvaliacao", locaisComAvaliacao);
        relatorio.put("locaisSemAvaliacao", locaisSemAvaliacao);
        relatorio.put("mediaAvaliacaoGeral", mediaAvaliacaoGeral);
        relatorio.put("totalAvaliacoes", avaliacoesFiltradas.size());
        relatorio.put("distribuicaoPorStatus", distribuicaoPorStatus);
        relatorio.put("distribuicaoPorCategoria", distribuicaoPorCategoria);
        relatorio.put("distribuicaoPorEstado", distribuicaoPorEstado);
        relatorio.put("distribuicaoPorTipoAcessibilidade", distribuicaoPorTipoAcessibilidade);
        relatorio.put("locaisMaisBemAvaliados", locaisMaisBemAvaliados);
        relatorio.put("locaisRecentes", locaisRecentes);
        relatorio.put("filtroDataInicio", dataInicio);
        relatorio.put("filtroDataFim", dataFim);
        relatorio.put("geradoEm", agoraRelatorio());

        return relatorio;
    }

    @Transactional(readOnly = true)
    public byte[] exportarRelatorioUsuariosCsv(LocalDate dataInicio, LocalDate dataFim) {
        Map<String, Object> relatorio = obterRelatorioUsuarios(dataInicio, dataFim);
        StringBuilder csv = new StringBuilder();
        csv.append("Metrica;Valor\n");
        csv.append("Total Usuarios;").append(relatorio.get("totalUsuarios")).append("\n");
        csv.append("Total Ativos;").append(relatorio.get("totalAtivos")).append("\n");
        csv.append("Total Inativos;").append(relatorio.get("totalInativos")).append("\n");
        csv.append("Total Admins;").append(relatorio.get("totalAdmins")).append("\n");
        csv.append("Total Usuarios Comuns;").append(relatorio.get("totalUsuariosComuns")).append("\n");
        csv.append("Cadastros Ultimos 30 Dias;").append(relatorio.get("cadastrosUltimos30Dias")).append("\n");
        csv.append("Período;").append(formatarPeriodo(relatorio.get("filtroDataInicio"), relatorio.get("filtroDataFim"))).append("\n");
        csv.append("Gerado Em;").append(formatarData(relatorio.get("geradoEm"))).append("\n\n");

        csv.append("Perfil;Total\n");
        Object distribuicaoPorPerfilObj = relatorio.get("distribuicaoPorPerfil");
        if (distribuicaoPorPerfilObj instanceof Map<?, ?> distribuicaoPorPerfil) {
            distribuicaoPorPerfil.forEach((perfil, total) -> csv.append(sanitizarCsv(String.valueOf(perfil)))
                .append(';').append(String.valueOf(total)).append("\n"));
        }

        csv.append("\nMes;Total Cadastros\n");
        Object cadastrosUltimosSeisMesesObj = relatorio.get("cadastrosUltimosSeisMeses");
        if (cadastrosUltimosSeisMesesObj instanceof Map<?, ?> cadastrosUltimosSeisMeses) {
            cadastrosUltimosSeisMeses.forEach((mes, total) -> csv.append(sanitizarCsv(String.valueOf(mes)))
                .append(';').append(String.valueOf(total)).append("\n"));
        }

        csv.append("\nId;Nome;Email;Role;Ativo;2FA;Data Cadastro\n");
        Object ultimosUsuariosObj = relatorio.get("ultimosUsuarios");
        if (ultimosUsuariosObj instanceof List<?> ultimosUsuarios) {
            for (Object itemObj : ultimosUsuarios) {
                if (!(itemObj instanceof Map<?, ?> item)) {
                    continue;
                }
                csv.append(String.valueOf(item.get("idUsuario"))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("nome")))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("email")))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("role")))).append(';')
                        .append(String.valueOf(item.get("ativo"))).append(';')
                        .append(String.valueOf(item.get("twoFactorEnabled"))).append(';')
                        .append(formatarData(item.get("dataCadastro"))).append("\n");
            }
        }

        return exportarCsvComUtf8Bom(csv);
    }

    @Transactional(readOnly = true)
    public byte[] exportarRelatorioLocaisCsv(LocalDate dataInicio, LocalDate dataFim) {
        Map<String, Object> relatorio = obterRelatorioLocais(dataInicio, dataFim);
        DecimalFormat df = new DecimalFormat("0.00");
        StringBuilder csv = new StringBuilder();
        csv.append("Metrica;Valor\n");
        csv.append("Total Locais;").append(relatorio.get("totalLocais")).append("\n");
        csv.append("Locais Com Avaliacao;").append(relatorio.get("locaisComAvaliacao")).append("\n");
        csv.append("Locais Sem Avaliacao;").append(relatorio.get("locaisSemAvaliacao")).append("\n");
        csv.append("Media Avaliacao Geral;").append(df.format((Double) relatorio.getOrDefault("mediaAvaliacaoGeral", 0.0))).append("\n");
        csv.append("Total Avaliacoes;").append(relatorio.get("totalAvaliacoes")).append("\n");
        csv.append("Período;").append(formatarPeriodo(relatorio.get("filtroDataInicio"), relatorio.get("filtroDataFim"))).append("\n");
        csv.append("Gerado Em;").append(formatarData(relatorio.get("geradoEm"))).append("\n\n");

        csv.append("Categoria;Total\n");
        Object distribuicaoPorCategoriaObj = relatorio.get("distribuicaoPorCategoria");
        if (distribuicaoPorCategoriaObj instanceof Map<?, ?> distribuicaoPorCategoria) {
            distribuicaoPorCategoria.forEach((categoria, total) -> csv.append(sanitizarCsv(String.valueOf(categoria)))
                .append(';').append(String.valueOf(total)).append("\n"));
        }

        csv.append("\nEstado;Total\n");
        Object distribuicaoPorEstadoObj = relatorio.get("distribuicaoPorEstado");
        if (distribuicaoPorEstadoObj instanceof Map<?, ?> distribuicaoPorEstado) {
            distribuicaoPorEstado.forEach((estado, total) -> csv.append(sanitizarCsv(String.valueOf(estado)))
                .append(';').append(String.valueOf(total)).append("\n"));
        }

        csv.append("\nRecurso;Total\n");
        Object distribuicaoPorTipoAcessibilidadeObj = relatorio.get("distribuicaoPorTipoAcessibilidade");
        if (distribuicaoPorTipoAcessibilidadeObj instanceof Map<?, ?> distribuicaoPorTipoAcessibilidade) {
            distribuicaoPorTipoAcessibilidade.forEach((tipo, total) -> csv.append(sanitizarCsv(String.valueOf(tipo)))
                .append(';').append(String.valueOf(total)).append("\n"));
        }

        csv.append("\nId;Nome;Categoria;Status;Avaliacao Media;Cidade;Estado;Data Criacao\n");
        Object locaisMaisBemAvaliadosObj = relatorio.get("locaisMaisBemAvaliados");
        if (locaisMaisBemAvaliadosObj instanceof List<?> locaisMaisBemAvaliados) {
            for (Object itemObj : locaisMaisBemAvaliados) {
                if (!(itemObj instanceof Map<?, ?> item)) {
                    continue;
                }
                csv.append(String.valueOf(item.get("idLocal"))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("nome")))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("categoria")))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("status")))).append(';')
                        .append(String.valueOf(item.get("avaliacaoMedia"))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("cidade")))).append(';')
                        .append(sanitizarCsv(String.valueOf(item.get("estado")))).append(';')
                        .append(formatarData(item.get("dataCriacao"))).append("\n");
            }
        }

        return exportarCsvComUtf8Bom(csv);
    }

    @Transactional(readOnly = true)
    public byte[] exportarRelatorioUsuariosPdf(LocalDate dataInicio, LocalDate dataFim) {
        Map<String, Object> relatorio = obterRelatorioUsuarios(dataInicio, dataFim);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setCompressionLevel(0);
            document.open();
            Font titulo = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font secao = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font texto = new Font(Font.HELVETICA, 10);

            document.add(new Paragraph("Relatorio de Usuarios - AcessoLivre", titulo));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Período: " + formatarPeriodo(relatorio.get("filtroDataInicio"), relatorio.get("filtroDataFim")), texto));
            document.add(new Paragraph("Gerado em: " + formatarData(relatorio.get("geradoEm")), texto));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Resumo", secao));
            document.add(new Paragraph("Total usuarios: " + relatorio.get("totalUsuarios"), texto));
            document.add(new Paragraph("Total ativos: " + relatorio.get("totalAtivos"), texto));
            document.add(new Paragraph("Total inativos: " + relatorio.get("totalInativos"), texto));
            document.add(new Paragraph("Total admins: " + relatorio.get("totalAdmins"), texto));
            document.add(new Paragraph("Total usuarios comuns: " + relatorio.get("totalUsuariosComuns"), texto));
            document.add(new Paragraph("Cadastros ultimos 30 dias: " + relatorio.get("cadastrosUltimos30Dias"), texto));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Distribuicao por perfil", secao));
            document.add(criarTabelaSimples(
                List.of("Perfil", "Total"),
                ((Map<?, ?>) relatorio.get("distribuicaoPorPerfil")).entrySet().stream()
                    .map(entrada -> List.of(String.valueOf(entrada.getKey()), String.valueOf(entrada.getValue())))
                    .toList()));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Cadastros ultimos 6 meses", secao));
            document.add(criarTabelaSimples(
                List.of("Mes", "Total"),
                ((Map<?, ?>) relatorio.get("cadastrosUltimosSeisMeses")).entrySet().stream()
                    .map(entrada -> List.of(String.valueOf(entrada.getKey()), String.valueOf(entrada.getValue())))
                    .toList()));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Lista de usuarios", secao));
            PdfPTable tabelaUsuarios = new PdfPTable(7);
            tabelaUsuarios.setWidthPercentage(100);
            try {
                tabelaUsuarios.setWidths(new float[] {0.9f, 2.5f, 3.5f, 1.3f, 0.9f, 0.9f, 2.1f});
            } catch (DocumentException e) {
                throw new IllegalStateException("Falha ao configurar tabela de usuarios", e);
            }
            adicionarCabecalhos(tabelaUsuarios, List.of("ID", "Nome", "Email", "Role", "Ativo", "2FA", "Data cadastro"));
            Object ultimosUsuariosObj = relatorio.get("ultimosUsuarios");
            if (ultimosUsuariosObj instanceof List<?> ultimosUsuarios) {
                for (Object itemObj : ultimosUsuarios) {
                    if (!(itemObj instanceof Map<?, ?> item)) {
                        continue;
                    }
                    tabelaUsuarios.addCell(textoSeguro(item.get("idUsuario")));
                    tabelaUsuarios.addCell(textoSeguro(item.get("nome")));
                    tabelaUsuarios.addCell(textoSeguro(item.get("email")));
                    tabelaUsuarios.addCell(textoSeguro(item.get("role")));
                    tabelaUsuarios.addCell(textoSeguro(item.get("ativo")));
                    tabelaUsuarios.addCell(textoSeguro(item.get("twoFactorEnabled")));
                    tabelaUsuarios.addCell(textoSeguro(item.get("dataCadastro")));
                }
            }
            document.add(tabelaUsuarios);
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao gerar PDF de usuarios", e);
        } finally {
            document.close();
        }
        return baos.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportarRelatorioLocaisPdf(LocalDate dataInicio, LocalDate dataFim) {
        Map<String, Object> relatorio = obterRelatorioLocais(dataInicio, dataFim);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setCompressionLevel(0);
            document.open();
            Font titulo = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font texto = new Font(Font.HELVETICA, 10);
            DecimalFormat df = new DecimalFormat("0.00");

            document.add(new Paragraph("Relatorio de Locais - AcessoLivre", titulo));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Período: " + formatarPeriodo(relatorio.get("filtroDataInicio"), relatorio.get("filtroDataFim")), texto));
            document.add(new Paragraph("Gerado em: " + formatarData(relatorio.get("geradoEm")), texto));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total locais: " + relatorio.get("totalLocais"), texto));
            document.add(new Paragraph("Locais com avaliacao: " + relatorio.get("locaisComAvaliacao"), texto));
            document.add(new Paragraph("Locais sem avaliacao: " + relatorio.get("locaisSemAvaliacao"), texto));
            document.add(new Paragraph("Media avaliacao geral: " + df.format((Double) relatorio.getOrDefault("mediaAvaliacaoGeral", 0.0)), texto));
            document.add(new Paragraph("Total avaliacoes: " + relatorio.get("totalAvaliacoes"), texto));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Distribuicao por categoria", secaoTexto()));
            document.add(criarTabelaSimples(
                List.of("Categoria", "Total"),
                ((Map<?, ?>) relatorio.get("distribuicaoPorCategoria")).entrySet().stream()
                    .map(entrada -> List.of(String.valueOf(entrada.getKey()), String.valueOf(entrada.getValue())))
                    .toList()));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Distribuicao por estado", secaoTexto()));
            document.add(criarTabelaSimples(
                List.of("Estado", "Total"),
                ((Map<?, ?>) relatorio.get("distribuicaoPorEstado")).entrySet().stream()
                    .map(entrada -> List.of(String.valueOf(entrada.getKey()), String.valueOf(entrada.getValue())))
                    .toList()));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Distribuicao por recurso", secaoTexto()));
            document.add(criarTabelaSimples(
                List.of("Recurso", "Total"),
                ((Map<?, ?>) relatorio.get("distribuicaoPorTipoAcessibilidade")).entrySet().stream()
                    .map(entrada -> List.of(String.valueOf(entrada.getKey()), String.valueOf(entrada.getValue())))
                    .toList()));

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Lista de locais", secaoTexto()));
            PdfPTable tabelaLocais = new PdfPTable(8);
            tabelaLocais.setWidthPercentage(100);
            try {
                tabelaLocais.setWidths(new float[] {0.8f, 2.6f, 1.5f, 1.5f, 0.9f, 2.0f, 1.0f, 2.1f});
            } catch (DocumentException e) {
                throw new IllegalStateException("Falha ao configurar tabela de locais", e);
            }
            adicionarCabecalhos(tabelaLocais, List.of("ID", "Nome", "Categoria", "Status", "Media", "Cidade", "Estado", "Data criacao"));
            Object locaisMaisBemAvaliadosObj = relatorio.get("locaisMaisBemAvaliados");
            if (locaisMaisBemAvaliadosObj instanceof List<?> locaisMaisBemAvaliados) {
                for (Object itemObj : locaisMaisBemAvaliados) {
                    if (!(itemObj instanceof Map<?, ?> item)) {
                        continue;
                    }
                    tabelaLocais.addCell(textoSeguro(item.get("idLocal")));
                    tabelaLocais.addCell(textoSeguro(item.get("nome")));
                    tabelaLocais.addCell(textoSeguro(item.get("categoria")));
                    tabelaLocais.addCell(textoSeguro(item.get("status")));
                    tabelaLocais.addCell(textoSeguro(item.get("avaliacaoMedia")));
                    tabelaLocais.addCell(textoSeguro(item.get("cidade")));
                    tabelaLocais.addCell(textoSeguro(item.get("estado")));
                    tabelaLocais.addCell(textoSeguro(item.get("dataCriacao")));
                }
            }
            document.add(tabelaLocais);
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao gerar PDF de locais", e);
        } finally {
            document.close();
        }
        return baos.toByteArray();
    }

    private String sanitizarCsv(String valor) {
        return String.valueOf(valor == null ? "" : valor).replace(';', ',').replace('\n', ' ').replace('\r', ' ');
    }

    private byte[] exportarCsvComUtf8Bom(StringBuilder csv) {
        return (UTF8_BOM + csv).getBytes(StandardCharsets.UTF_8);
    }

    private void adicionarCabecalhos(PdfPTable tabela, List<String> cabecalhos) {
        cabecalhos.forEach(cabecalho -> tabela.addCell(new Phrase(cabecalho)));
    }

    private PdfPTable criarTabelaSimples(List<String> cabecalhos, List<List<String>> linhas) {
        PdfPTable tabela = new PdfPTable(cabecalhos.size());
        tabela.setWidthPercentage(100);
        adicionarCabecalhos(tabela, cabecalhos);
        for (List<String> linha : linhas) {
            for (String valor : linha) {
                tabela.addCell(textoSeguro(valor));
            }
        }
        return tabela;
    }

    private Font secaoTexto() {
        return new Font(Font.HELVETICA, 12, Font.BOLD);
    }

    private String textoSeguro(Object valor) {
        return formatarData(valor);
    }

    private String formatarData(Object valor) {
        if (valor == null) return "";
        if (valor instanceof LocalDateTime dt) return dt.format(FMT_DATA_HORA);
        if (valor instanceof java.time.LocalDate d) return d.format(FMT_DATA);
        return String.valueOf(valor);
    }

    private String formatarPeriodo(Object inicio, Object fim) {
        String di = formatarData(inicio);
        String df = formatarData(fim);
        if (di.isEmpty() && df.isEmpty()) return "Todo o período";
        if (di.isEmpty()) return "Até " + df;
        if (df.isEmpty()) return "A partir de " + di;
        return di + " até " + df;
    }

    private LocalDateTime agoraRelatorio() {
        return LocalDateTime.now(ZONA_PADRAO_RELATORIO);
    }

    private boolean estaNoPeriodo(LocalDateTime dataReferencia, LocalDate dataInicio, LocalDate dataFim) {
        if (dataReferencia == null) {
            return false;
        }

        LocalDate data = dataReferencia.toLocalDate();
        boolean atendeInicio = dataInicio == null || !data.isBefore(dataInicio);
        boolean atendeFim = dataFim == null || !data.isAfter(dataFim);
        return atendeInicio && atendeFim;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> obterEstatisticasPorEstado() {
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();

        for (Local local : locais) {
            String estado = local.getEndereco().getEstado();
            estatisticas.put(estado, estatisticas.getOrDefault(estado, 0L) + 1);
        }

        return estatisticas;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> obterEstatisticasPorCategoria() {
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();

        for (Local local : locais) {
            String categoria = local.getCategoria().name();
            estatisticas.put(categoria, estatisticas.getOrDefault(categoria, 0L) + 1);
        }

        return estatisticas;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> obterEstatisticasPorTipoAcessibilidade() {
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();

        for (Local local : locais) {
            local.getTiposAcessibilidade().forEach(tipo -> {
                String nome = tipo.name();
                estatisticas.put(nome, estatisticas.getOrDefault(nome, 0L) + 1);
            });
        }

        return estatisticas;
    }

    private void recalcularMediaLocal(Long idLocal) {
        Optional<Local> localOpt = localRepository.findById(idLocal);
        if (localOpt.isPresent()) {
            Local local = localOpt.get();
            Double media = avaliacaoRepository.calcularMediaPorLocal(idLocal);
            local.setAvaliacaoMedia(media != null ? media : 0.0);
            localRepository.save(local);
        }
    }
}
