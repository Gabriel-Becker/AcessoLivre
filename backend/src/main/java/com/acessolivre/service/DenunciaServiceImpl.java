package com.acessolivre.service.impl;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.exception.DenunciaException;
import com.acessolivre.mapper.DenunciaMapper;
import com.acessolivre.model.Denuncia;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.DenunciaRepository;
import com.acessolivre.repository.DenunciaSpecification;
import com.acessolivre.repository.UsuarioRepository;
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

    @Override
    @Transactional
    public DenunciaResponseDTO criarDenuncia(DenunciaRequestDTO request, Long usuarioId) {
        log.info("Criando nova denúncia - Tipo: {}, TargetId: {}, UsuarioId: {}", 
                 request.getTipo(), request.getTargetId(), usuarioId);

        // Verificar se usuário já denunciou este target
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
                .orElseThrow(() -> new DenunciaException("Denúncia não encontrada"));
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
                .orElseThrow(() -> new DenunciaException("Denúncia não encontrada"));
        
        denuncia.setStatus(novoStatus);
        
        if (novoStatus == StatusDenuncia.RESOLVED || novoStatus == StatusDenuncia.REJECTED) {
            denuncia.setDataResolucao(LocalDateTime.now());
            denuncia.setResolvidoPor(resolvidoPor);
        }
        
        if (observacoes != null && !observacoes.isEmpty()) {
            denuncia.setObservacoes(observacoes);
        }
        
        Denuncia updated = denunciaRepository.save(denuncia);
        return denunciaMapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public void excluirDenuncia(Long id) {
        log.info("Excluindo denúncia - ID: {}", id);
        
        if (!denunciaRepository.existsById(id)) {
            throw new DenunciaException("Denúncia não encontrada");
        }
        
        denunciaRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void excluirDenunciasEmMassa(List<Long> ids) {
        log.info("Excluindo denúncias em massa - IDs: {}", ids);
        denunciaRepository.deleteAllById(ids);
    }

    @Override
    public boolean usuarioJaDenunciou(Long usuarioId, TipoDenuncia tipo, Long targetId) {
        return denunciaRepository.existsByTipoAndTargetIdAndUsuarioId(tipo, targetId, usuarioId);
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