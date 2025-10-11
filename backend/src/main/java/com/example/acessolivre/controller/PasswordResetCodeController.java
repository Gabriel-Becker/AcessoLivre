package com.example.acessolivre.controller;

import com.example.acessolivre.dto.request.PasswordResetCodeRequestDTO;
import com.example.acessolivre.dto.response.PasswordResetCodeResponseDTO;
import com.example.acessolivre.mapper.PasswordResetCodeMapper;
import com.example.acessolivre.model.PasswordResetCode;
import com.example.acessolivre.service.PasswordResetCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/passwordreset")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetCodeController {

    private final PasswordResetCodeService passwordResetCodeService;

    /**
     * Lista todos os códigos de reset de senha
     * @return ResponseEntity com lista de códigos
     */
    @GetMapping
    public ResponseEntity<List<PasswordResetCodeResponseDTO>> listarTodos() {
        try {
            log.info("Recebida requisição para listar todos os códigos de reset de senha");
            List<PasswordResetCode> codigos = passwordResetCodeService.listarTodos();
            List<PasswordResetCodeResponseDTO> responseDTOs = codigos.stream()
                    .map(PasswordResetCodeMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} códigos de reset", responseDTOs.size());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar códigos de reset: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um código de reset pelo ID
     * @param id ID do código
     * @return ResponseEntity com código se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<PasswordResetCodeResponseDTO> buscarPorId(@PathVariable Long id) {
        try {
            log.info("Recebida requisição para buscar código de reset por ID: {}", id);
            Optional<PasswordResetCode> codigo = passwordResetCodeService.buscarPorId(id);
            
            if (codigo.isPresent()) {
                log.info("Código de reset encontrado com ID: {}", id);
                return ResponseEntity.ok(PasswordResetCodeMapper.toResponse(codigo.get()));
            } else {
                log.warn("Código de reset não encontrado com ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar código de reset por ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo código de reset de senha
     * @param requestDTO Dados do código a ser salvo
     * @return ResponseEntity com código salvo
     */
    @PostMapping
    public ResponseEntity<PasswordResetCodeResponseDTO> salvar(@RequestBody PasswordResetCodeRequestDTO requestDTO) {
        try {
            log.info("Recebida requisição para salvar novo código de reset de senha");
            PasswordResetCode codigo = passwordResetCodeService.salvar(requestDTO);
            log.info("Código de reset salvo com sucesso. ID: {}", codigo.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(PasswordResetCodeMapper.toResponse(codigo));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao salvar código de reset: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao salvar código de reset: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deleta um código de reset pelo ID
     * @param id ID do código a ser deletado
     * @return ResponseEntity com status 204 (No Content) se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            log.info("Recebida requisição para deletar código de reset com ID: {}", id);
            boolean deletado = passwordResetCodeService.deletar(id);
            
            if (deletado) {
                log.info("Código de reset deletado com sucesso. ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("Código de reset não encontrado para deletar. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao deletar código de reset com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Verifica se um código é válido
     * @param code Código a ser verificado
     * @return ResponseEntity com boolean indicando se o código é válido
     */
    @GetMapping("/verificar/{code}")
    public ResponseEntity<Boolean> verificarCodigo(@PathVariable String code) {
        try {
            log.info("Recebida requisição para verificar código de reset");
            boolean isValid = passwordResetCodeService.isCodigoValido(code);
            log.info("Código válido: {}", isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            log.error("Erro ao verificar código de reset: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Verifica se um código é válido para um CPF específico
     * @param code Código a ser verificado
     * @param cpf CPF do usuário
     * @return ResponseEntity com boolean indicando se o código é válido para o CPF
     */
    @GetMapping("/verificar/{code}/cpf/{cpf}")
    public ResponseEntity<Boolean> verificarCodigoParaCpf(@PathVariable String code, @PathVariable String cpf) {
        try {
            log.info("Recebida requisição para verificar código de reset para CPF: {}", cpf);
            boolean isValid = passwordResetCodeService.isCodigoValidoParaCpf(code, cpf);
            log.info("Código válido para CPF {}: {}", cpf, isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            log.error("Erro ao verificar código de reset para CPF {}: {}", cpf, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marca um código como utilizado
     * @param code Código a ser marcado como utilizado
     * @param cpf CPF do usuário
     * @return ResponseEntity com boolean indicando sucesso
     */
    @PostMapping("/usar/{code}")
    public ResponseEntity<Boolean> marcarComoUsado(@PathVariable String code, @RequestParam String cpf) {
        try {
            log.info("Recebida requisição para marcar código como utilizado: {}", code);
            boolean sucesso = passwordResetCodeService.marcarComoUsado(code, cpf);
            log.info("Código marcado como utilizado: {}", sucesso);
            return ResponseEntity.ok(sucesso);
        } catch (Exception e) {
            log.error("Erro ao marcar código como utilizado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista códigos válidos por usuário
     * @param idUsuario ID do usuário
     * @return ResponseEntity com lista de códigos válidos
     */
    @GetMapping("/usuario/{idUsuario}/validos")
    public ResponseEntity<List<PasswordResetCodeResponseDTO>> buscarCodigosValidosPorUsuario(@PathVariable Long idUsuario) {
        try {
            log.info("Recebida requisição para buscar códigos válidos do usuário ID: {}", idUsuario);
            List<PasswordResetCode> codigos = passwordResetCodeService.buscarCodigosValidosPorUsuario(idUsuario);
            List<PasswordResetCodeResponseDTO> responseDTOs = codigos.stream()
                    .map(PasswordResetCodeMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} códigos válidos para usuário ID: {}", responseDTOs.size(), idUsuario);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar códigos válidos por usuário ID {}: {}", idUsuario, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista códigos válidos por CPF
     * @param cpf CPF do usuário
     * @return ResponseEntity com lista de códigos válidos
     */
    @GetMapping("/cpf/{cpf}/validos")
    public ResponseEntity<List<PasswordResetCodeResponseDTO>> buscarCodigosValidosPorCpf(@PathVariable String cpf) {
        try {
            log.info("Recebida requisição para buscar códigos válidos para CPF: {}", cpf);
            List<PasswordResetCode> codigos = passwordResetCodeService.buscarCodigosValidosPorCpf(cpf);
            List<PasswordResetCodeResponseDTO> responseDTOs = codigos.stream()
                    .map(PasswordResetCodeMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} códigos válidos para CPF: {}", responseDTOs.size(), cpf);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar códigos válidos por CPF {}: {}", cpf, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista códigos por usuário
     * @param idUsuario ID do usuário
     * @return ResponseEntity com lista de códigos
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PasswordResetCodeResponseDTO>> buscarPorUsuario(@PathVariable Long idUsuario) {
        try {
            log.info("Recebida requisição para buscar códigos do usuário ID: {}", idUsuario);
            List<PasswordResetCode> codigos = passwordResetCodeService.buscarPorUsuario(idUsuario);
            List<PasswordResetCodeResponseDTO> responseDTOs = codigos.stream()
                    .map(PasswordResetCodeMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} códigos para usuário ID: {}", responseDTOs.size(), idUsuario);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar códigos por usuário ID {}: {}", idUsuario, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Limpa códigos expirados
     * @return ResponseEntity com número de códigos removidos
     */
    @DeleteMapping("/limpar-expirados")
    public ResponseEntity<Integer> limparCodigosExpirados() {
        try {
            log.info("Recebida requisição para limpar códigos expirados");
            int removidos = passwordResetCodeService.limparCodigosExpirados();
            log.info("Códigos expirados removidos: {}", removidos);
            return ResponseEntity.ok(removidos);
        } catch (Exception e) {
            log.error("Erro ao limpar códigos expirados: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
