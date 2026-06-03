package com.acessolivre.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
        long totalEmailVerificado = usuarios.stream().filter(u -> Boolean.TRUE.equals(u.getEmailVerified())).count();

        var agora = LocalDateTime.now();
        var limite30Dias = agora.minusDays(30);
        long cadastrosUltimos30Dias = usuarios.stream()
            .filter(u -> u.getDataCadastro() != null && !u.getDataCadastro().isBefore(limite30Dias))
            .count();

        Map<String, Long> distribuicaoPorPerfil = new LinkedHashMap<>();
        distribuicaoPorPerfil.put("Usuário", totalUsuariosComuns);
        distribuicaoPorPerfil.put("Admin", totalAdmins);

        Map<String, Long> cadastrosUltimosSeisMeses = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth referencia = java.time.YearMonth.now().minusMonths(i);
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
                dto.put("emailVerificado", Boolean.TRUE.equals(usuario.getEmailVerified()));
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
        relatorio.put("totalEmailVerificado", totalEmailVerificado);
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
        long totalLocais = locais.size();
        long locaisComAvaliacao = locais.stream()
            .filter(l -> l.getAvaliacaoMedia() != null && l.getAvaliacaoMedia() > 0)
            .count();
        long locaisSemAvaliacao = totalLocais - locaisComAvaliacao;

        double mediaAvaliacaoGeral = locais.stream()
            .map(Local::getAvaliacaoMedia)
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
        relatorio.put("totalAvaliacoes", avaliacaoRepository.count());
        relatorio.put("distribuicaoPorStatus", distribuicaoPorStatus);
        relatorio.put("distribuicaoPorCategoria", distribuicaoPorCategoria);
        relatorio.put("distribuicaoPorEstado", distribuicaoPorEstado);
        relatorio.put("distribuicaoPorTipoAcessibilidade", distribuicaoPorTipoAcessibilidade);
        relatorio.put("locaisMaisBemAvaliados", locaisMaisBemAvaliados);
        relatorio.put("locaisRecentes", locaisRecentes);
        relatorio.put("filtroDataInicio", dataInicio);
        relatorio.put("filtroDataFim", dataFim);
        relatorio.put("geradoEm", LocalDateTime.now());

        return relatorio;
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
