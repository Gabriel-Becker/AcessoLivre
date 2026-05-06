package com.acessolivre.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        log.info("Listando usuários com paginação: página={}, tamanho={}", pageable.getPageNumber(), pageable.getPageSize());
        return usuarioRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarUsuarioPorId(Long id) {
        log.info("Buscando usuário: id={}", id);
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
        log.info("Role alterada: id={}, role={}", idUsuario, normalized);
        
        return true;
    }

    @Transactional
    public boolean deletarUsuario(Long idUsuario) {
        log.info("Deletando usuário: id={}", idUsuario);
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByIdUsuarioAndAtivoTrue(idUsuario);
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário não encontrado para deletar: id={}", idUsuario);
            return false;
        }
        
        Usuario usuario = usuarioOpt.get();
        usuario.setAtivo(false);
        usuario.setTokenAtual(null);
        usuarioRepository.save(usuario);
        log.info("Usuário deletado: id={}", idUsuario);
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
        if (usuarioAutenticarOpt.isEmpty()) {
            log.warn("Credenciais não encontradas para usuário: id={}", idUsuario);
            return false;
        }

        var usuarioAutenticar = usuarioAutenticarOpt.get();
        usuarioAutenticar.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioAutenticarRepository.save(usuarioAutenticar);

        log.info("Senha alterada com sucesso para usuário: id={}", idUsuario);
        return true;
    }

    @Transactional(readOnly = true)
    public List<Avaliacao> listarAvaliacoesPendentes() {
        log.info("Listando avaliações pendentes");
        return avaliacaoRepository.findByModerado(false);
    }

    @Transactional
    public boolean aprovarAvaliacao(Long idAvaliacao) {
        log.info("Aprovando avaliação: id={}", idAvaliacao);
        
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findById(idAvaliacao);
        if (avaliacaoOpt.isEmpty()) {
            log.warn("Avaliação não encontrada para aprovar: id={}", idAvaliacao);
            return false;
        }
        
        Avaliacao avaliacao = avaliacaoOpt.get();
        avaliacao.setModerado(true);
        avaliacaoRepository.save(avaliacao);
        log.info("Avaliação aprovada: id={}", idAvaliacao);
        
        return true;
    }

    @Transactional
    public boolean rejeitarAvaliacao(Long idAvaliacao) {
        log.info("Rejeitando avaliação: id={}", idAvaliacao);
        
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findById(idAvaliacao);
        if (avaliacaoOpt.isEmpty()) {
            log.warn("Avaliação não encontrada para rejeitar: id={}", idAvaliacao);
            return false;
        }
        
        Long idLocal = avaliacaoOpt.get().getLocal().getIdLocal();
        avaliacaoRepository.deleteById(idAvaliacao);
        recalcularMediaLocal(idLocal);
        log.info("Avaliação rejeitada: id={}", idAvaliacao);
        
        return true;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasGerais() {
        log.info("Obtendo estatísticas gerais");
        
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsuarios = usuarioRepository.countByAtivoTrue();
        long totalLocais = localRepository.count();
        long totalAvaliacoes = avaliacaoRepository.count();
        long avaliacoesPendentes = avaliacaoRepository.findByModerado(false).size();
        
        stats.put("totalUsuarios", totalUsuarios);
        stats.put("totalLocais", totalLocais);
        stats.put("totalAvaliacoes", totalAvaliacoes);
        stats.put("avaliacoesPendentes", avaliacoesPendentes);
        
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> obterEstatisticasPorEstado() {
        log.info("Obtendo estatísticas por estado");
        
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
        log.info("Obtendo estatísticas por categoria");
        
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();
        
         for (Local local : locais) {
            String categoria = local.getCategoria().name();
            estatisticas.put(categoria, estatisticas.getOrDefault(categoria, 0L) + 1);
        }
        
        return estatisticas;
    }

    public Map<String, Long> obterEstatisticasPorTipoAcessibilidade() {
        log.info("Obtendo estatísticas por tipo de acessibilidade");
        
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();
        
         for (Local local : locais) {
            String tipo = local.getTipoAcessibilidade().name();
            estatisticas.put(tipo, estatisticas.getOrDefault(tipo, 0L) + 1);
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
