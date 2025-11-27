package com.acessolivre.service;

import com.acessolivre.dto.request.PasswordResetCodeRequestDTO;
import com.acessolivre.mapper.PasswordResetCodeMapper;
import com.acessolivre.model.PasswordResetCode;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.PasswordResetCodeRepository;
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
public class PasswordResetCodeService {

    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final UsuarioService usuarioService;

    public List<PasswordResetCode> listarTodos() {
        log.info("Listando todos os códigos de reset");
        return passwordResetCodeRepository.findAll();
    }

    public Optional<PasswordResetCode> buscarPorId(Long id) {
        log.info("Buscando código de reset: id={}", id);
        return passwordResetCodeRepository.findById(id);
    }

    @Transactional
    public PasswordResetCode salvar(PasswordResetCodeRequestDTO dto) {
        log.info("Salvando código de reset: usuarioId={}", dto.getUsuarioId());
        
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(dto.getUsuarioId());
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário não encontrado: id={}", dto.getUsuarioId());
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        if (!usuario.getCpf().equals(dto.getCpf().trim())) {
            log.warn("CPF não corresponde ao usuário: usuarioId={}", dto.getUsuarioId());
            throw new IllegalArgumentException("CPF não corresponde ao usuário");
        }
        
        if (passwordResetCodeRepository.existsByCpfAndUsedFalseAndExpiresAtAfter(dto.getCpf().trim(), LocalDateTime.now())) {
            log.warn("Já existe código válido para este usuário");
            throw new IllegalArgumentException("Já existe código válido para este usuário");
        }
        
        PasswordResetCode codigo = PasswordResetCodeMapper.toEntity(dto, usuario);
        PasswordResetCode salvo = passwordResetCodeRepository.save(codigo);
        log.info("Código de reset salvo: id={}", salvo.getId());
        return salvo;
    }

    @Transactional
    public void deletar(Long id) {
        log.info("Deletando código de reset: id={}", id);
        
        if (!passwordResetCodeRepository.existsById(id)) {
            log.warn("Código de reset não encontrado: id={}", id);
            throw new IllegalArgumentException("Código de reset não encontrado");
        }
        
        passwordResetCodeRepository.deleteById(id);
        log.info("Código de reset deletado: id={}", id);
    }

    public boolean isCodigoValido(String code) {
        return passwordResetCodeRepository.existsByCodeAndUsedFalseAndExpiresAtAfter(code, LocalDateTime.now());
    }

    public boolean isCodigoValidoParaCpf(String code, String cpf) {
        return passwordResetCodeRepository.findByCpfAndUsedFalseAndExpiresAtAfter(cpf, LocalDateTime.now())
                .stream()
                .anyMatch(codigo -> codigo.getCode().equals(code));
    }

    @Transactional
    public boolean marcarComoUsado(String code, String cpf) {
        log.info("Marcando código como usado: cpf={}", cpf);
        
        Optional<PasswordResetCode> codigoOpt = passwordResetCodeRepository.findByCpfAndCode(cpf.trim(), code.trim());
        
        if (codigoOpt.isEmpty()) {
            log.warn("Código não encontrado para CPF");
            throw new IllegalArgumentException("Código não encontrado para este CPF");
        }
        
        PasswordResetCode codigo = codigoOpt.get();
        if (codigo.getUsed()) {
            log.warn("Código já utilizado");
            throw new IllegalArgumentException("Código já foi utilizado");
        }
        
        if (codigo.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Código expirado");
            throw new IllegalArgumentException("Código expirado");
        }
        
        codigo.setUsed(true);
        passwordResetCodeRepository.save(codigo);
        log.info("Código marcado como usado: id={}", codigo.getId());
        return true;
    }

    public List<PasswordResetCode> buscarCodigosValidosPorUsuario(Long idUsuario) {
        log.info("Buscando códigos válidos: usuarioId={}", idUsuario);
        return passwordResetCodeRepository
                .findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(idUsuario, LocalDateTime.now());
    }

    public List<PasswordResetCode> buscarCodigosValidosPorCpf(String cpf) {
        log.info("Buscando códigos válidos por CPF");
        return passwordResetCodeRepository
                .findByCpfAndUsedFalseAndExpiresAtAfter(cpf, LocalDateTime.now());
    }

    public List<PasswordResetCode> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando códigos: usuarioId={}", idUsuario);
        return passwordResetCodeRepository.findByUsuario_IdUsuario(idUsuario);
    }

    @Transactional
    public int limparCodigosExpirados() {
        log.info("Limpando códigos expirados");
        List<PasswordResetCode> codigosExpirados = passwordResetCodeRepository
                .findByExpiresAtBefore(LocalDateTime.now());
        
        if (!codigosExpirados.isEmpty()) {
            passwordResetCodeRepository.deleteAll(codigosExpirados);
            log.info("Códigos expirados removidos: {}", codigosExpirados.size());
        }
        
        return codigosExpirados.size();
    }
}
