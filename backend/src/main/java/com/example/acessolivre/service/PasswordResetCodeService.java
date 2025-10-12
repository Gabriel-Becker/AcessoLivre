package com.example.acessolivre.service;

import com.example.acessolivre.dto.request.PasswordResetCodeRequestDTO;
import com.example.acessolivre.mapper.PasswordResetCodeMapper;
import com.example.acessolivre.model.PasswordResetCode;
import com.example.acessolivre.model.Usuario;
import com.example.acessolivre.repository.PasswordResetCodeRepository;
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

    /**
     * Lista todos os códigos de reset de senha
     * @return Lista de todos os códigos de reset
     */
    public List<PasswordResetCode> listarTodos() {
        log.info("Listando todos os códigos de reset de senha");
        List<PasswordResetCode> codigos = passwordResetCodeRepository.findAll();
        log.info("Encontrados {} códigos de reset", codigos.size());
        return codigos;
    }

    /**
     * Busca um código de reset pelo ID
     * @param id ID do código de reset
     * @return Optional contendo o código se encontrado
     */
    public Optional<PasswordResetCode> buscarPorId(Long id) {
        log.info("Buscando código de reset por ID: {}", id);
        Optional<PasswordResetCode> codigo = passwordResetCodeRepository.findById(id);
        
        if (codigo.isPresent()) {
            log.info("Código de reset encontrado com ID: {}", id);
        } else {
            log.warn("Código de reset não encontrado com ID: {}", id);
        }
        
        return codigo;
    }

    /**
     * Salva um novo código de reset de senha
     * @param dto DTO com dados do código de reset
     * @return Código de reset salvo
     * @throws IllegalArgumentException se usuário não encontrado, CPF não corresponde ou código duplicado
     */
    @Transactional
    public PasswordResetCode salvar(PasswordResetCodeRequestDTO dto) {
        log.info("Salvando novo código de reset para usuário ID: {}", dto.getUsuarioId());
        
        // Busca o usuário
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(dto.getUsuarioId().intValue());
        if (usuarioOpt.isEmpty()) {
            log.error("Usuário não encontrado com ID: {}", dto.getUsuarioId());
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + dto.getUsuarioId());
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verifica se o CPF corresponde ao usuário
        if (!usuario.getCpf().equals(dto.getCpf().trim())) {
            log.error("CPF não corresponde ao usuário. CPF informado: {}, CPF do usuário: {}", 
                     dto.getCpf(), usuario.getCpf());
            throw new IllegalArgumentException("CPF não corresponde ao usuário");
        }
        
        // Verifica se já existe código válido para este usuário
        if (passwordResetCodeRepository.existsByCpfAndUsedFalseAndExpiresAtAfter(dto.getCpf().trim(), LocalDateTime.now())) {
            log.warn("Já existe código válido para este usuário com CPF: {}", dto.getCpf());
            throw new IllegalArgumentException("Já existe código válido para este usuário");
        }
        
        try {
            PasswordResetCode codigo = PasswordResetCodeMapper.toEntity(dto, usuario);
            PasswordResetCode codigoSalvo = passwordResetCodeRepository.save(codigo);
            log.info("Código de reset salvo com sucesso. ID: {}", codigoSalvo.getId());
            return codigoSalvo;
        } catch (Exception e) {
            log.error("Erro ao salvar código de reset: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao salvar código de reset", e);
        }
    }

    /**
     * Deleta um código de reset pelo ID
     * @param id ID do código a ser deletado
     * @throws IllegalArgumentException se o código não for encontrado
     */
    @Transactional
    public void deletar(Long id) {
        log.info("Tentando deletar código de reset com ID: {}", id);
        
        if (!passwordResetCodeRepository.existsById(id)) {
            log.warn("Código de reset não encontrado para deletar. ID: {}", id);
            throw new IllegalArgumentException("Código de reset não encontrado com ID: " + id);
        }
        
        try {
            passwordResetCodeRepository.deleteById(id);
            log.info("Código de reset deletado com sucesso. ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar código de reset com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao deletar código de reset", e);
        }
    }

    /**
     * Verifica se um código de reset é válido
     * @param code Código a ser verificado
     * @return true se o código é válido, false caso contrário
     */
    public boolean isCodigoValido(String code) {
        log.debug("Verificando se código de reset é válido: {}", code);
        return passwordResetCodeRepository.existsByCodeAndUsedFalseAndExpiresAtAfter(code, LocalDateTime.now());
    }

    /**
     * Verifica se um código de reset é válido para um CPF específico
     * @param code Código a ser verificado
     * @param cpf CPF do usuário
     * @return true se o código é válido para o CPF, false caso contrário
     */
    public boolean isCodigoValidoParaCpf(String code, String cpf) {
        log.debug("Verificando se código de reset é válido para CPF: {} - {}", code, cpf);
        return passwordResetCodeRepository.findByCpfAndUsedFalseAndExpiresAtAfter(cpf, LocalDateTime.now())
                .stream()
                .anyMatch(codigo -> codigo.getCode().equals(code));
    }

    /**
     * Marca um código como utilizado
     * @param code Código a ser marcado como utilizado
     * @param cpf CPF do usuário
     * @return true se marcado com sucesso
     * @throws IllegalArgumentException se código não encontrado, já usado ou expirado
     */
    @Transactional
    public boolean marcarComoUsado(String code, String cpf) {
        log.info("Marcando código como utilizado: {} para CPF: {}", code, cpf);
        
        Optional<PasswordResetCode> codigoOpt = passwordResetCodeRepository.findByCpfAndCode(cpf.trim(), code.trim());
        
        if (codigoOpt.isEmpty()) {
            log.warn("Código não encontrado: {} para CPF: {}", code, cpf);
            throw new IllegalArgumentException("Código não encontrado para este CPF");
        }
        
        PasswordResetCode codigo = codigoOpt.get();
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
            passwordResetCodeRepository.save(codigo);
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
    public List<PasswordResetCode> buscarCodigosValidosPorUsuario(Long idUsuario) {
        log.info("Buscando códigos válidos para usuário ID: {}", idUsuario);
        List<PasswordResetCode> codigos = passwordResetCodeRepository
                .findByUsuarioIdUsuarioAndUsedFalseAndExpiresAtAfter(idUsuario, LocalDateTime.now());
        log.info("Encontrados {} códigos válidos para usuário ID: {}", codigos.size(), idUsuario);
        return codigos;
    }

    /**
     * Lista códigos válidos por CPF
     * @param cpf CPF do usuário
     * @return Lista de códigos válidos para o CPF
     */
    public List<PasswordResetCode> buscarCodigosValidosPorCpf(String cpf) {
        log.info("Buscando códigos válidos para CPF: {}", cpf);
        List<PasswordResetCode> codigos = passwordResetCodeRepository
                .findByCpfAndUsedFalseAndExpiresAtAfter(cpf, LocalDateTime.now());
        log.info("Encontrados {} códigos válidos para CPF: {}", codigos.size(), cpf);
        return codigos;
    }

    /**
     * Lista códigos por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos do usuário
     */
    public List<PasswordResetCode> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando códigos de reset para usuário ID: {}", idUsuario);
        List<PasswordResetCode> codigos = passwordResetCodeRepository.findByUsuarioIdUsuario(idUsuario);
        log.info("Encontrados {} códigos para usuário ID: {}", codigos.size(), idUsuario);
        return codigos;
    }

    /**
     * Limpa códigos expirados
     * @return Número de códigos removidos
     */
    @Transactional
    public int limparCodigosExpirados() {
        log.info("Limpando códigos de reset expirados");
        List<PasswordResetCode> codigosExpirados = passwordResetCodeRepository
                .findByExpiresAtBefore(LocalDateTime.now());
        
        if (!codigosExpirados.isEmpty()) {
            passwordResetCodeRepository.deleteAll(codigosExpirados);
            log.info("Removidos {} códigos expirados", codigosExpirados.size());
        } else {
            log.info("Nenhum código expirado encontrado");
        }
        
        return codigosExpirados.size();
    }
}
