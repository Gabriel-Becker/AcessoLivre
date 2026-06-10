package com.acessolivre.service.imp;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.dto.response.ResolucaoDenunciaResponseDTO;
import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.exception.DenunciaException;
import com.acessolivre.mapper.DenunciaMapper;
import com.acessolivre.model.Denuncia;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.DenunciaRepository;
import com.acessolivre.repository.DenunciaSpecification;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.service.ConteudoModeracaoService;
import com.acessolivre.service.DenunciaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DenunciaServiceImpl implements DenunciaService {

    private final DenunciaRepository denunciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final DenunciaMapper denunciaMapper;
    private final ConteudoModeracaoService conteudoModeracaoService;

    @Override
    @Transactional
    public DenunciaResponseDTO criarDenuncia(DenunciaRequestDTO request, Long usuarioId) {
        log.info("Criando nova denúncia - Tipo: {}, TargetId: {}, UsuarioId: {}", 
                 request.getTipo(), request.getTargetId(), usuarioId);

        if (usuarioJaDenunciou(usuarioId, request.getTipo(), request.getTargetId())) {
            throw new IllegalStateException("Você já denunciou este item");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Denuncia denuncia = denunciaMapper.toEntity(request, usuario);
        Denuncia saved = denunciaRepository.save(denuncia);
        
        log.info("Denúncia criada com sucesso - ID: {}", saved.getId());
        return denunciaMapper.toResponseDTO(saved);
    }

    @Override
    public DenunciaResponseDTO buscarPorId(Long id) {
        return denunciaRepository.findById(id)
                .map(denunciaMapper::toResponseDTO)
                .orElseThrow(() -> new DenunciaException("Denúncia não encontrada com ID: " + id));
    }

    @Override
    public Page<DenunciaResponseDTO> listarDenuncias(
            TipoDenuncia tipo,
            StatusDenuncia status,
            String search,
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            Long usuarioId,
            Pageable pageable) {
        
        Specification<Denuncia> spec = DenunciaSpecification.withFilters(
                tipo, status, search, dataInicio, dataFim, usuarioId);
        
        return denunciaRepository.findAll(spec, pageable)
                .map(denunciaMapper::toResponseDTO);
    }

    @Override
    @Transactional
    public DenunciaResponseDTO atualizarStatus(Long id, StatusDenuncia novoStatus, String resolvidoPor, String observacoes) {
        log.info("Atualizando status da denúncia {} para {}", id, novoStatus);
        
        Denuncia denuncia = denunciaRepository.findById(id)
                .orElseThrow(() -> new DenunciaException("Denúncia não encontrada com ID: " + id));
        
        denuncia.setStatus(novoStatus);
        
        if (novoStatus == StatusDenuncia.RESOLVED || novoStatus == StatusDenuncia.REJECTED) {
            denuncia.setDataResolucao(LocalDateTime.now());
            denuncia.setResolvidoPor(resolvidoPor);
        }
        
        if (observacoes != null && !observacoes.isEmpty()) {
            denuncia.setObservacoes(observacoes);
        }
        
        Denuncia updated = denunciaRepository.save(denuncia);
        log.info("Status da denúncia {} atualizado para {}", id, novoStatus);
        return denunciaMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public ResolucaoDenunciaResponseDTO resolverDenuncia(Long id, String resolvidoPor) {
        log.info("Resolvendo denúncia - ID: {}, ResolvidoPor: {}", id, resolvidoPor);
        
        // Buscar a denúncia
        Denuncia denuncia = denunciaRepository.findById(id)
                .orElseThrow(() -> new DenunciaException("Denúncia não encontrada com ID: " + id));
        
        // Verificar se já está resolvida ou rejeitada
        if (denuncia.getStatus() == StatusDenuncia.RESOLVED) {
            throw new IllegalStateException("Denúncia já foi resolvida anteriormente");
        }
        
        if (denuncia.getStatus() == StatusDenuncia.REJECTED) {
            throw new IllegalStateException("Denúncia já foi rejeitada anteriormente");
        }
        
        String mensagemRemocao = null;
        String conteudoRemovido = null;
        
        try {
            // Remover o conteúdo denunciado (se aplicável)
            if (denuncia.getTipo() == TipoDenuncia.LOCAL || denuncia.getTipo() == TipoDenuncia.AVALIACAO) {
                conteudoRemovido = conteudoModeracaoService.removerConteudoDenunciado(
                        denuncia.getTipo(), 
                        denuncia.getTargetId()
                );
                mensagemRemocao = "Conteúdo removido com sucesso.";
                log.info("Conteúdo removido para denúncia {} - {}", id, conteudoRemovido);
            } else {
                mensagemRemocao = "Nenhum conteúdo removido (tipo de denúncia não suporta remoção automática).";
            }
            
            // Atualizar status da denúncia
            denuncia.setStatus(StatusDenuncia.RESOLVED);
            denuncia.setDataResolucao(LocalDateTime.now());
            denuncia.setResolvidoPor(resolvidoPor);
            denuncia.setObservacoes("Conteúdo removido automaticamente pelo sistema de moderação.");
            
            Denuncia saved = denunciaRepository.save(denuncia);
            
            log.info("Denúncia {} resolvida com sucesso", id);
            
            return ResolucaoDenunciaResponseDTO.builder()
                    .denunciaId(saved.getId())
                    .tipo(saved.getTipo())
                    .targetId(saved.getTargetId())
                    .targetName(saved.getTargetName())
                    .status(saved.getStatus())
                    .mensagem(mensagemRemocao)
                    .conteudoRemovido(conteudoRemovido)
                    .dataResolucao(saved.getDataResolucao())
                    .resolvidoPor(saved.getResolvidoPor())
                    .build();
                    
        } catch (Exception e) {
            log.error("Erro ao resolver denúncia {}: {}", id, e.getMessage(), e);
            throw new DenunciaException("Falha ao resolver denúncia: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResolucaoDenunciaResponseDTO rejeitarDenuncia(Long id, String resolvidoPor, String observacoes) {
        log.info("Rejeitando denúncia - ID: {}, ResolvidoPor: {}, Observacoes: {}", id, resolvidoPor, observacoes);
        
        // Buscar a denúncia
        Denuncia denuncia = denunciaRepository.findById(id)
                .orElseThrow(() -> new DenunciaException("Denúncia não encontrada com ID: " + id));
        
        // Verificar se já está resolvida ou rejeitada
        if (denuncia.getStatus() == StatusDenuncia.RESOLVED) {
            throw new IllegalStateException("Denúncia já foi resolvida anteriormente");
        }
        
        if (denuncia.getStatus() == StatusDenuncia.REJECTED) {
            throw new IllegalStateException("Denúncia já foi rejeitada anteriormente");
        }
        
        // Atualizar status da denúncia para REJECTED
        denuncia.setStatus(StatusDenuncia.REJECTED);
        denuncia.setDataResolucao(LocalDateTime.now());
        denuncia.setResolvidoPor(resolvidoPor);
        denuncia.setObservacoes(observacoes != null ? observacoes : "Denúncia rejeitada pelo moderador.");
        
        Denuncia saved = denunciaRepository.save(denuncia);
        
        log.info("Denúncia {} rejeitada com sucesso", id);
        
        return ResolucaoDenunciaResponseDTO.builder()
                .denunciaId(saved.getId())
                .tipo(saved.getTipo())
                .targetId(saved.getTargetId())
                .targetName(saved.getTargetName())
                .status(saved.getStatus())
                .mensagem("Denúncia rejeitada. Nenhum conteúdo foi removido.")
                .conteudoRemovido("Nenhum conteúdo removido - denúncia rejeitada")
                .dataResolucao(saved.getDataResolucao())
                .resolvidoPor(saved.getResolvidoPor())
                .build();
    }

    @Override
    @Transactional
    public void excluirDenuncia(Long id) {
        log.info("Excluindo denúncia - ID: {}", id);
        
        if (!denunciaRepository.existsById(id)) {
            throw new DenunciaException("Denúncia não encontrada com ID: " + id);
        }
        
        denunciaRepository.deleteById(id);
        log.info("Denúncia {} excluída com sucesso", id);
    }

    @Override
    @Transactional
    public void excluirDenunciasEmMassa(List<Long> ids) {
        log.info("Excluindo denúncias em massa - IDs: {}", ids);
        denunciaRepository.deleteAllById(ids);
        log.info("{} denúncias excluídas", ids.size());
    }

    @Override
    public boolean usuarioJaDenunciou(Long usuarioId, TipoDenuncia tipo, Long targetId) {
        return denunciaRepository.existsByTipoAndTargetIdAndUsuario(tipo, targetId, usuarioId);
    }

    @Override
    public long contarPorStatus(StatusDenuncia status) {
        return denunciaRepository.countByStatus(status);
    }

    @Override
    public List<DenunciaResponseDTO> buscarPorTarget(TipoDenuncia tipo, Long targetId) {
        return denunciaRepository.findByTipoAndTargetId(tipo, targetId)
                .stream()
                .map(denunciaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}