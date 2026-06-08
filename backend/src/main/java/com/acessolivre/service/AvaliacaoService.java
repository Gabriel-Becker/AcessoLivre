package com.acessolivre.service;

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.mapper.AvaliacaoMapper;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.AvaliacaoRepository;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LocalRepository localRepository;
    private final LocalService localService;

    @Transactional(readOnly = true)
    public Page<Avaliacao> listarTodos(Pageable pageable) {
        log.info("Listando avaliações com paginação: página={}, tamanho={}", pageable.getPageNumber(), pageable.getPageSize());
        return avaliacaoRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Avaliacao> buscarPorId(Long id) {
        log.info("Buscando avaliação por ID: {}", id);
        return avaliacaoRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Avaliacao> buscarPorLocal(Long idLocal) {
        log.info("Buscando avaliações por local ID: {}", idLocal);
        return avaliacaoRepository.findByLocalIdLocal(idLocal);
    }

    @Transactional(readOnly = true)
    public List<Avaliacao> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando avaliações por usuário ID: {}", idUsuario);
        return avaliacaoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @Transactional(readOnly = true)
    public List<Avaliacao> listarPublicas() {
        log.info("Listando avaliações públicas (moderadas)");
        return avaliacaoRepository.findByModerado(true);
    }

    @Transactional(readOnly = true)
    public List<Avaliacao> buscarPublicasPorLocal(Long idLocal) {
        log.info("Buscando avaliações públicas por local ID: {}", idLocal);
        return avaliacaoRepository.findByLocalIdLocalAndModerado(idLocal, true);
    }

    @Transactional
    public Avaliacao salvar(AvaliacaoRequestDTO dto) {
        log.info("Salvando avaliação: localId={}, usuarioId={}", dto.getIdLocal(), dto.getIdUsuario());

        if (avaliacaoRepository.existsByUsuarioIdUsuarioAndLocalIdLocal(dto.getIdUsuario(), dto.getIdLocal())) {
            log.warn("Usuário já avaliou este local: usuarioId={}, localId={}", dto.getIdUsuario(), dto.getIdLocal());
            throw new IllegalArgumentException("Usuário já avaliou este local");
        }

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + dto.getIdUsuario()));

        Local local = localRepository.findById(dto.getIdLocal())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado com ID: " + dto.getIdLocal()));

        double media = ((double) dto.getNotaAcessibilidadeVisual()
                + dto.getNotaAcessibilidadeMotora()
                + dto.getNotaAcessibilidadeAuditiva()) / 3.0;

        boolean moderado = true;

        Avaliacao avaliacao = AvaliacaoMapper.toEntity(dto, usuario, local, media, moderado);
        
        Avaliacao avaliacaoSalva = avaliacaoRepository.save(avaliacao);
        
        localService.recalcularMediaAvaliacoes(dto.getIdLocal());
        
        log.info("✅ Avaliação salva com sucesso: id={}, moderado={}, notaGeral={}, usuario={}", 
                 avaliacaoSalva.getIdAvaliacao(), moderado, media, usuario.getNome());
        
        return avaliacaoSalva;
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando avaliação: id={}", id);
        
        Optional<Avaliacao> avaliacaoOpt = avaliacaoRepository.findById(id);
        if (avaliacaoOpt.isEmpty()) {
            log.warn("Avaliação não encontrada para deletar: id={}", id);
            return false;
        }
        
        Long idLocal = avaliacaoOpt.get().getLocal().getIdLocal();
        avaliacaoRepository.deleteById(id);
        localService.recalcularMediaAvaliacoes(idLocal);
        log.info("Avaliação deletada: id={}", id);
        
        return true;
    }

    /**
     * Remove uma avaliação logicamente (soft delete) - usado pelo sistema de moderação
     * Marca como não moderada (oculta), não remove fisicamente do banco
     */
    @Transactional
    public void removerAvaliacao(Long id) {
        log.info("🔨 [MODERAÇÃO] Removendo avaliação logicamente (soft delete) - ID: {}", id);
        
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Avaliação não encontrada com ID: " + id));
        
        try {
            Long idLocal = avaliacao.getLocal().getIdLocal();
            
            // Soft delete: marca como não moderada (oculta)
            avaliacao.setModerado(false);
            avaliacaoRepository.save(avaliacao);
            
            // Recalcula a média do local (agora sem esta avaliação)
            localService.recalcularMediaAvaliacoes(idLocal);
            
            log.info(" [MODERAÇÃO] Avaliação marcada como oculta (soft delete) - ID: {}, Local ID: {}", id, idLocal);
            
        } catch (Exception e) {
            log.error(" [MODERAÇÃO] Erro ao remover avaliação ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Falha ao remover avaliação: " + e.getMessage(), e);
        }
    }
}