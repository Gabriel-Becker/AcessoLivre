package com.acessolivre.service;

import com.acessolivre.dto.request.CodigoRecuperacaoDoisFatoresRequestDTO;
import com.acessolivre.mapper.CodigoRecuperacaoDoisFatoresMapper;
import com.acessolivre.model.CodigoRecuperacaoDoisFatores;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoRecuperacaoDoisFatoresRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodigoRecuperacaoDoisFatoresService {

    private final CodigoRecuperacaoDoisFatoresRepository twoFactorRecoveryCodeRepository;
    private final UsuarioService usuarioService;

    public List<CodigoRecuperacaoDoisFatores> listarTodos() {
        log.info("Listando todos os códigos de recuperação 2FA");
        return twoFactorRecoveryCodeRepository.findAll();
    }

    public Optional<CodigoRecuperacaoDoisFatores> buscarPorId(Long id) {
        log.info("Buscando código de recuperação 2FA: id={}", id);
        return twoFactorRecoveryCodeRepository.findById(id);
    }

    @Transactional
    public CodigoRecuperacaoDoisFatores salvar(CodigoRecuperacaoDoisFatoresRequestDTO dto) {
        log.info("Salvando código de recuperação 2FA: usuarioId={}", dto.getUsuarioId());
        
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(dto.getUsuarioId());
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário não encontrado: id={}", dto.getUsuarioId());
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        if (twoFactorRecoveryCodeRepository.findByCodigoAndUsuario_IdUsuario(dto.getCodigo().trim(), dto.getUsuarioId()).isPresent()) {
            log.warn("Código de recuperação já existe");
            throw new IllegalArgumentException("Código de recuperação já existe para este usuário");
        }
        
        CodigoRecuperacaoDoisFatores codigo = CodigoRecuperacaoDoisFatoresMapper.toEntity(dto, usuario);
        CodigoRecuperacaoDoisFatores salvo = twoFactorRecoveryCodeRepository.save(codigo);
        log.info("Código de recuperação 2FA salvo: id={}", salvo.getId());
        return salvo;
    }

    @Transactional
    public void deletar(Long id) {
        log.info("Deletando código de recuperação 2FA: id={}", id);
        
        if (!twoFactorRecoveryCodeRepository.existsById(id)) {
            log.warn("Código de recuperação 2FA não encontrado: id={}", id);
            throw new IllegalArgumentException("Código de recuperação não encontrado");
        }
        
        twoFactorRecoveryCodeRepository.deleteById(id);
        log.info("Código de recuperação 2FA deletado: id={}", id);
    }

    public boolean codigoEhValido(String code) {
        return twoFactorRecoveryCodeRepository.existsByCodigoAndUtilizadoFalseAndDataExpiracaoAfter(code, LocalDateTime.now());
    }

    @Transactional
    public boolean marcarComoUsado(String code, Long idUsuario) {
        log.info("Marcando código 2FA como usado: usuarioId={}", idUsuario);
        
        Optional<CodigoRecuperacaoDoisFatores> codigoOpt = twoFactorRecoveryCodeRepository
                .findByCodigoAndUsuario_IdUsuario(code.trim(), idUsuario);
        
        if (codigoOpt.isEmpty()) {
            log.warn("Código 2FA não encontrado para usuário");
            throw new IllegalArgumentException("Código não encontrado para este usuário");
        }
        
        CodigoRecuperacaoDoisFatores codigo = codigoOpt.get();
        if (codigo.getUtilizado()) {
            log.warn("Código 2FA já utilizado");
            throw new IllegalArgumentException("Código já foi utilizado");
        }
        
        if (codigo.getDataExpiracao().isBefore(LocalDateTime.now())) {
            log.warn("Código 2FA expirado");
            throw new IllegalArgumentException("Código expirado");
        }
        
        codigo.setUtilizado(true);
        twoFactorRecoveryCodeRepository.save(codigo);
        log.info("Código 2FA marcado como usado: id={}", codigo.getId());
        return true;
    }

    public List<CodigoRecuperacaoDoisFatores> buscarCodigosValidosPorUsuario(Long idUsuario) {
        log.info("Buscando códigos 2FA válidos: usuarioId={}", idUsuario);
        return twoFactorRecoveryCodeRepository
                .findByUsuario_IdUsuarioAndUtilizadoFalseAndDataExpiracaoAfter(idUsuario, LocalDateTime.now());
    }

    public List<CodigoRecuperacaoDoisFatores> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando códigos 2FA: usuarioId={}", idUsuario);
        return twoFactorRecoveryCodeRepository.findByUsuario_IdUsuario(idUsuario);
    }

    @Transactional
    public int limparCodigosExpirados() {
        log.info("Limpando códigos 2FA expirados");
        List<CodigoRecuperacaoDoisFatores> codigosExpirados = twoFactorRecoveryCodeRepository
                .findByDataExpiracaoBefore(LocalDateTime.now());
        
        if (!codigosExpirados.isEmpty()) {
            twoFactorRecoveryCodeRepository.deleteAll(codigosExpirados);
            log.info("Códigos 2FA expirados removidos: {}", codigosExpirados.size());
        }
        
        return codigosExpirados.size();
    }
}
