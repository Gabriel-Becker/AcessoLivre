package com.example.acessolivre.service;

import com.example.acessolivre.dto.request.TwoFactorRecoveryCodeRequestDTO;
import com.example.acessolivre.mapper.TwoFactorRecoveryCodeMapper;
import com.example.acessolivre.model.TwoFactorRecoveryCode;
import com.example.acessolivre.model.Usuario;
import com.example.acessolivre.repository.TwoFactorRecoveryCodeRepository;
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

    /**
     * Lista todos os códigos de recuperação
     * @return Lista de todos os códigos de recuperação
     */
    public List<TwoFactorRecoveryCode> listarTodos() {
        log.info("Listando todos os códigos de recuperação 2FA");
        List<TwoFactorRecoveryCode> codigos = twoFactorRecoveryCodeRepository.findAll();
        log.info("Encontrados {} códigos de recuperação", codigos.size());
        return codigos;
    }

    /**
     * Busca um código de recuperação pelo ID
     * @param id ID do código de recuperação
     * @return Optional contendo o código se encontrado
     */
    public Optional<TwoFactorRecoveryCode> buscarPorId(Long id) {
        log.info("Buscando código de recuperação por ID: {}", id);
        Optional<TwoFactorRecoveryCode> codigo = twoFactorRecoveryCodeRepository.findById(id);
        
        if (codigo.isPresent()) {
            log.info("Código de recuperação encontrado com ID: {}", id);
        } else {
            log.warn("Código de recuperação não encontrado com ID: {}", id);
        }
        
        return codigo;
    }

    /**
     * Salva um novo código de recuperação
     * @param dto DTO com dados do código de recuperação
     * @return Código de recuperação salvo
     * @throws IllegalArgumentException se usuário não encontrado ou código duplicado
     */
    @Transactional
    public TwoFactorRecoveryCode salvar(TwoFactorRecoveryCodeRequestDTO dto) {
        log.info("Salvando novo código de recuperação para usuário ID: {}", dto.getUsuarioId());
        
        // Busca o usuário
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(dto.getUsuarioId());
        if (usuarioOpt.isEmpty()) {
            log.error("Usuário não encontrado com ID: {}", dto.getUsuarioId());
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + dto.getUsuarioId());
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verifica se o código já existe
        if (twoFactorRecoveryCodeRepository.findByCodeAndUsuario_IdUsuario(dto.getCode().trim(), dto.getUsuarioId()).isPresent()) {
            log.warn("Código de recuperação já existe para este usuário: {}", dto.getCode());
            throw new IllegalArgumentException("Código de recuperação já existe para este usuário");
        }
        
        try {
            TwoFactorRecoveryCode codigo = TwoFactorRecoveryCodeMapper.toEntity(dto, usuario);
            TwoFactorRecoveryCode codigoSalvo = twoFactorRecoveryCodeRepository.save(codigo);
            log.info("Código de recuperação salvo com sucesso. ID: {}", codigoSalvo.getId());
            return codigoSalvo;
        } catch (Exception e) {
            log.error("Erro ao salvar código de recuperação: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao salvar código de recuperação", e);
        }
    }

    /**
     * Deleta um código de recuperação pelo ID
     * @param id ID do código a ser deletado
     * @throws IllegalArgumentException se o código não for encontrado
     */
    @Transactional
    public void deletar(Long id) {
        log.info("Tentando deletar código de recuperação com ID: {}", id);
        
        if (!twoFactorRecoveryCodeRepository.existsById(id)) {
            log.warn("Código de recuperação não encontrado para deletar. ID: {}", id);
            throw new IllegalArgumentException("Código de recuperação não encontrado com ID: " + id);
        }
        
        try {
            twoFactorRecoveryCodeRepository.deleteById(id);
            log.info("Código de recuperação deletado com sucesso. ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar código de recuperação com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao deletar código de recuperação", e);
        }
    }

    /**
     * Verifica se um código de recuperação é válido
     * @param code Código a ser verificado
     * @return true se o código é válido, false caso contrário
     */
    public boolean isCodigoValido(String code) {
        log.debug("Verificando se código de recuperação é válido: {}", code);
        return twoFactorRecoveryCodeRepository.existsByCodeAndUsedFalseAndExpiresAtAfter(code, LocalDateTime.now());
    }

    /**
     * Marca um código como utilizado
     * @param code Código a ser marcado como utilizado
     * @param idUsuario ID do usuário
     * @return true se marcado com sucesso, false se não encontrado
     * @throws IllegalArgumentException se código não encontrado, já usado ou expirado
     */
    @Transactional
    public boolean marcarComoUsado(String code, Long idUsuario) {
        log.info("Marcando código como utilizado: {} para usuário ID: {}", code, idUsuario);
        
        Optional<TwoFactorRecoveryCode> codigoOpt = twoFactorRecoveryCodeRepository
                .findByCodeAndUsuario_IdUsuario(code.trim(), idUsuario);
        
        if (codigoOpt.isEmpty()) {
            log.warn("Código não encontrado: {} para usuário ID: {}", code, idUsuario);
            throw new IllegalArgumentException("Código não encontrado para este usuário");
        }
        
        TwoFactorRecoveryCode codigo = codigoOpt.get();
        if (codigo.getUsed()) {
            log.warn("Código já foi utilizado: {}", code);
            throw new IllegalArgumentException("Código já foi utilizado");
        }
        
        if (codigo.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Código expirado: {}", code);
            throw new IllegalArgumentException("Código expirado");
        }
        
        try {
            codigo.setUsed(true);
            twoFactorRecoveryCodeRepository.save(codigo);
            log.info("Código marcado como utilizado com sucesso: {}", code);
            return true;
        } catch (Exception e) {
            log.error("Erro ao marcar código como utilizado: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao marcar código como utilizado", e);
        }
    }

    /**
     * Lista códigos válidos por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos válidos do usuário
     */
    public List<TwoFactorRecoveryCode> buscarCodigosValidosPorUsuario(Long idUsuario) {
        log.info("Buscando códigos válidos para usuário ID: {}", idUsuario);
        List<TwoFactorRecoveryCode> codigos = twoFactorRecoveryCodeRepository
                .findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(idUsuario, LocalDateTime.now());
        log.info("Encontrados {} códigos válidos para usuário ID: {}", codigos.size(), idUsuario);
        return codigos;
    }

    /**
     * Lista códigos por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos do usuário
     */
    public List<TwoFactorRecoveryCode> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando códigos de recuperação para usuário ID: {}", idUsuario);
        List<TwoFactorRecoveryCode> codigos = twoFactorRecoveryCodeRepository.findByUsuario_IdUsuario(idUsuario);
        log.info("Encontrados {} códigos para usuário ID: {}", codigos.size(), idUsuario);
        return codigos;
    }

    /**
     * Limpa códigos expirados
     * @return Número de códigos removidos
     */
    @Transactional
    public int limparCodigosExpirados() {
        log.info("Limpando códigos de recuperação expirados");
        List<TwoFactorRecoveryCode> codigosExpirados = twoFactorRecoveryCodeRepository
                .findByExpiresAtBefore(LocalDateTime.now());
        
        if (!codigosExpirados.isEmpty()) {
            twoFactorRecoveryCodeRepository.deleteAll(codigosExpirados);
            log.info("Removidos {} códigos expirados", codigosExpirados.size());
        } else {
            log.info("Nenhum código expirado encontrado");
        }
        
        return codigosExpirados.size();
    }
}
