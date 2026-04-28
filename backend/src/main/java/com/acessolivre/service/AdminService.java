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
        return usuarioRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional
    public boolean alterarRoleUsuario(Long idUsuario, String novaRole) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
        if (usuarioOpt.isEmpty()) return false;

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
        if (!usuarioRepository.existsById(idUsuario)) return false;
        usuarioRepository.deleteById(idUsuario);
        return true;
    }

    @Transactional
    public boolean alterarSenhaUsuario(Long idUsuario, String novaSenha) {
        if (!usuarioRepository.existsById(idUsuario)) return false;

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

        stats.put("totalUsuarios", usuarioRepository.count());
        stats.put("totalLocais", localRepository.count());
        stats.put("totalAvaliacoes", avaliacaoRepository.count());
        stats.put("avaliacoesPendentes", avaliacaoRepository.findByModerado(false).size());

        return stats;
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

    // ✅ MÉTODO CORRIGIDO PARA SET<TipoAcessibilidade>
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
