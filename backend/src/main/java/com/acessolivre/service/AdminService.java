package com.acessolivre.service;

import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.AvaliacaoRepository;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final LocalRepository localRepository;

    // ===== GERENCIAMENTO DE USUÁRIOS =====

    public List<Usuario> listarTodosUsuarios() {
        log.info("Admin: Listando todos os usuários");
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarUsuarioPorId(Long id) {
        log.info("Admin: Buscando usuário por ID: {}", id);
        return usuarioRepository.findById(id);
    }

    @Transactional
    public boolean alterarRoleUsuario(Long idUsuario, String novaRole) {
        log.info("Admin: Alterando role do usuário ID: {} para {}", idUsuario, novaRole);
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
        if (usuarioOpt.isEmpty()) {
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
        log.info("Admin: Deletando usuário ID: {}", idUsuario);
        
        if (!usuarioRepository.existsById(idUsuario)) {
            return false;
        }
        
        usuarioRepository.deleteById(idUsuario);
        return true;
    }

    // ===== MODERAÇÃO DE AVALIAÇÕES =====

    public List<Avaliacao> listarAvaliacoesPendentes() {
        log.info("Admin: Listando avaliações pendentes de moderação");
        return avaliacaoRepository.findByModerado(false);
    }

    @Transactional
    public boolean aprovarAvaliacao(Long idAvaliacao) {
        log.info("Admin: Aprovando avaliação ID: {}", idAvaliacao);
        
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findById(idAvaliacao);
        if (avaliacaoOpt.isEmpty()) {
            return false;
        }
        
        Avaliacao avaliacao = avaliacaoOpt.get();
        avaliacao.setModerado(true);
        avaliacaoRepository.save(avaliacao);
        
        return true;
    }

    @Transactional
    public boolean rejeitarAvaliacao(Long idAvaliacao) {
        log.info("Admin: Rejeitando e deletando avaliação ID: {}", idAvaliacao);
        
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findById(idAvaliacao);
        if (avaliacaoOpt.isEmpty()) {
            return false;
        }
        
        Long idLocal = avaliacaoOpt.get().getLocal().getIdLocal();
        avaliacaoRepository.deleteById(idAvaliacao);
        
        // Recalcula média do local após deletar avaliação rejeitada
        recalcularMediaLocal(idLocal);
        
        return true;
    }

    // ===== ESTATÍSTICAS =====

    public Map<String, Object> obterEstatisticasGerais() {
        log.info("Admin: Obtendo estatísticas gerais");
        
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsuarios = usuarioRepository.count();
        long totalLocais = localRepository.count();
        long totalAvaliacoes = avaliacaoRepository.count();
        long avaliacoesPendentes = avaliacaoRepository.findByModerado(false).size();
        
        stats.put("totalUsuarios", totalUsuarios);
        stats.put("totalLocais", totalLocais);
        stats.put("totalAvaliacoes", totalAvaliacoes);
        stats.put("avaliacoesPendentes", avaliacoesPendentes);
        
        return stats;
    }

    public Map<String, Long> obterEstatisticasPorEstado() {
        log.info("Admin: Obtendo estatísticas de locais por estado");
        
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();
        
        for (Local local : locais) {
            String estado = local.getEndereco().getEstado();
            estatisticas.put(estado, estatisticas.getOrDefault(estado, 0L) + 1);
        }
        
        return estatisticas;
    }

    public Map<String, Long> obterEstatisticasPorCategoria() {
        log.info("Admin: Obtendo estatísticas de locais por categoria");
        
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();
        
        for (Local local : locais) {
            String categoria = local.getCategoria().getNome();
            estatisticas.put(categoria, estatisticas.getOrDefault(categoria, 0L) + 1);
        }
        
        return estatisticas;
    }

    public Map<String, Long> obterEstatisticasPorTipoAcessibilidade() {
        log.info("Admin: Obtendo estatísticas de locais por tipo de acessibilidade");
        
        List<Local> locais = localRepository.findAll();
        Map<String, Long> estatisticas = new HashMap<>();
        
        for (Local local : locais) {
            String tipo = local.getTipoAcessibilidade().getNome();
            estatisticas.put(tipo, estatisticas.getOrDefault(tipo, 0L) + 1);
        }
        
        return estatisticas;
    }

    // Helper privado para recalcular média
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
