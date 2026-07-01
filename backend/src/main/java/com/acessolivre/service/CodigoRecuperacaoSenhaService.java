package com.acessolivre.service;

import com.acessolivre.dto.request.CodigoRecuperacaoSenhaRequestDTO;
import com.acessolivre.mapper.CodigoRecuperacaoSenhaMapper;
import com.acessolivre.model.CodigoRecuperacaoSenha;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoRecuperacaoSenhaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class CodigoRecuperacaoSenhaService {

    private final CodigoRecuperacaoSenhaRepository passwordResetCodeRepository;
    private final UsuarioService usuarioService;

    public List<CodigoRecuperacaoSenha> listarTodos() {
        log.info("Listando todos os códigos de reset");
        return passwordResetCodeRepository.findAll();
    }

    public Optional<CodigoRecuperacaoSenha> buscarPorId(Long id) {
        log.info("Buscando código de reset: id={}", id);
        Long idNaoNulo = Objects.requireNonNull(id, "id não pode ser nulo");
        return passwordResetCodeRepository.findById(idNaoNulo);
    }

    @Transactional
    public CodigoRecuperacaoSenha salvar(CodigoRecuperacaoSenhaRequestDTO dto) {
        log.info("Salvando código de reset: usuarioId={}", dto.getUsuarioId());
        
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(dto.getUsuarioId());
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário não encontrado: id={}", dto.getUsuarioId());
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        List<CodigoRecuperacaoSenha> codigosValidos = passwordResetCodeRepository
            .findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(dto.getUsuarioId(), LocalDateTime.now());
        
        if (!codigosValidos.isEmpty()) {
            log.warn("Já existe código válido para este usuário: usuarioId={}", dto.getUsuarioId());
            throw new IllegalArgumentException("Já existe código válido para este usuário. Use o código existente ou aguarde expirar.");
        }
        
        CodigoRecuperacaoSenha codigo = CodigoRecuperacaoSenhaMapper.toEntity(dto, usuario);
        CodigoRecuperacaoSenha salvo = Objects.requireNonNull(
            passwordResetCodeRepository.save(codigo),
            "falha ao salvar código de reset"
        );
        log.info("Código de reset salvo: id={}", salvo.getId());
        return salvo;
    }

    @Transactional
    public void deletar(Long id) {
        log.info("Deletando código de reset: id={}", id);
        Long idNaoNulo = Objects.requireNonNull(id, "id não pode ser nulo");
        
        if (!passwordResetCodeRepository.existsById(idNaoNulo)) {
            log.warn("Código de reset não encontrado: id={}", id);
            throw new IllegalArgumentException("Código de reset não encontrado");
        }
        
        passwordResetCodeRepository.deleteById(idNaoNulo);
        log.info("Código de reset deletado: id={}", id);
    }

    public boolean codigoEhValido(String code) {
        return passwordResetCodeRepository.existsByCodeAndUsedFalseAndExpiresAtAfter(code, LocalDateTime.now());
    }

    @Transactional
    public boolean marcarComoUsado(String code, Long usuarioId) {
        log.info("Marcando código como usado: usuarioId={}", usuarioId);
        
        Optional<CodigoRecuperacaoSenha> codigoOpt = passwordResetCodeRepository.findByCodeAndUsuario_IdUsuario(code.trim(), usuarioId);
        
        if (codigoOpt.isEmpty()) {
            log.warn("Código não encontrado para usuário");
            throw new IllegalArgumentException("Código não encontrado para este usuário");
        }
        
        CodigoRecuperacaoSenha codigo = codigoOpt.get();
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

    public List<CodigoRecuperacaoSenha> buscarCodigosValidosPorUsuario(Long idUsuario) {
        log.info("Buscando códigos válidos: usuarioId={}", idUsuario);
        return passwordResetCodeRepository
                .findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(idUsuario, LocalDateTime.now());
    }

    public List<CodigoRecuperacaoSenha> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando códigos: usuarioId={}", idUsuario);
        return passwordResetCodeRepository.findByUsuario_IdUsuario(idUsuario);
    }

    @Transactional
    public int limparCodigosExpirados() {
        log.info("Limpando códigos expirados");
        List<CodigoRecuperacaoSenha> codigosExpirados = passwordResetCodeRepository
                .findByExpiresAtBefore(LocalDateTime.now());
        
        if (!codigosExpirados.isEmpty()) {
            passwordResetCodeRepository.deleteAll(codigosExpirados);
            log.info("Códigos expirados removidos: {}", codigosExpirados.size());
        }
        
        return codigosExpirados.size();
    }
}
