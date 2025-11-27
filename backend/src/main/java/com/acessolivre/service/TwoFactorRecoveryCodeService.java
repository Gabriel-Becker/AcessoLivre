package com.acessolivre.service;

import com.acessolivre.dto.request.TwoFactorRecoveryCodeRequestDTO;
import com.acessolivre.mapper.TwoFactorRecoveryCodeMapper;
import com.acessolivre.model.TwoFactorRecoveryCode;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TwoFactorRecoveryCodeRepository;
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
public class TwoFactorRecoveryCodeService {

    private final TwoFactorRecoveryCodeRepository twoFactorRecoveryCodeRepository;
    private final UsuarioService usuarioService;

    public List<TwoFactorRecoveryCode> listarTodos() {
        log.info("Listando todos os códigos de recuperação 2FA");
        return twoFactorRecoveryCodeRepository.findAll();
    }

    public Optional<TwoFactorRecoveryCode> buscarPorId(Long id) {
        log.info("Buscando código de recuperação 2FA: id={}", id);
        return twoFactorRecoveryCodeRepository.findById(id);
    }

    @Transactional
    public TwoFactorRecoveryCode salvar(TwoFactorRecoveryCodeRequestDTO dto) {
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
        
        TwoFactorRecoveryCode codigo = TwoFactorRecoveryCodeMapper.toEntity(dto, usuario);
        TwoFactorRecoveryCode salvo = twoFactorRecoveryCodeRepository.save(codigo);
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

    public boolean isCodigoValido(String code) {
        return twoFactorRecoveryCodeRepository.existsByCodigoAndUtilizadoFalseAndDataExpiracaoAfter(code, LocalDateTime.now());
    }

    @Transactional
    public boolean marcarComoUsado(String code, Long idUsuario) {
        log.info("Marcando código 2FA como usado: usuarioId={}", idUsuario);
        
        Optional<TwoFactorRecoveryCode> codigoOpt = twoFactorRecoveryCodeRepository
                .findByCodigoAndUsuario_IdUsuario(code.trim(), idUsuario);
        
        if (codigoOpt.isEmpty()) {
            log.warn("Código 2FA não encontrado para usuário");
            throw new IllegalArgumentException("Código não encontrado para este usuário");
        }
        
        TwoFactorRecoveryCode codigo = codigoOpt.get();
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

    public List<TwoFactorRecoveryCode> buscarCodigosValidosPorUsuario(Long idUsuario) {
        log.info("Buscando códigos 2FA válidos: usuarioId={}", idUsuario);
        return twoFactorRecoveryCodeRepository
                .findByUsuario_IdUsuarioAndUtilizadoFalseAndDataExpiracaoAfter(idUsuario, LocalDateTime.now());
    }

    public List<TwoFactorRecoveryCode> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando códigos 2FA: usuarioId={}", idUsuario);
        return twoFactorRecoveryCodeRepository.findByUsuario_IdUsuario(idUsuario);
    }

    @Transactional
    public int limparCodigosExpirados() {
        log.info("Limpando códigos 2FA expirados");
        List<TwoFactorRecoveryCode> codigosExpirados = twoFactorRecoveryCodeRepository
                .findByDataExpiracaoBefore(LocalDateTime.now());
        
        if (!codigosExpirados.isEmpty()) {
            twoFactorRecoveryCodeRepository.deleteAll(codigosExpirados);
            log.info("Códigos 2FA expirados removidos: {}", codigosExpirados.size());
        }
        
        return codigosExpirados.size();
    }
}
