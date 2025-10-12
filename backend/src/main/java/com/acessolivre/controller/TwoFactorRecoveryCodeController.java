package com.example.acessolivre.controller;

import com.example.acessolivre.dto.request.TwoFactorRecoveryCodeRequestDTO;
import com.example.acessolivre.dto.response.TwoFactorRecoveryCodeResponseDTO;
import com.example.acessolivre.mapper.TwoFactorRecoveryCodeMapper;
import com.example.acessolivre.model.TwoFactorRecoveryCode;
import com.example.acessolivre.service.TwoFactorRecoveryCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/two-factor-recovery-codes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class TwoFactorRecoveryCodeController {

    private final TwoFactorRecoveryCodeService twoFactorRecoveryCodeService;

    /**
     * Lista todos os códigos de recuperação
     * @return ResponseEntity com lista de códigos
     */
    @GetMapping
    public ResponseEntity<List<TwoFactorRecoveryCodeResponseDTO>> listarTodos() {
        try {
            log.info("Recebida requisição para listar todos os códigos de recuperação 2FA");
            List<TwoFactorRecoveryCode> codigos = twoFactorRecoveryCodeService.listarTodos();
            List<TwoFactorRecoveryCodeResponseDTO> responseDTOs = TwoFactorRecoveryCodeMapper.fromEntityList(codigos);
            log.info("Retornando {} códigos de recuperação", responseDTOs.size());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar códigos de recuperação: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    /**
     * Busca um código de recuperação pelo ID
     * @param id ID do código
     * @return ResponseEntity com código se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<TwoFactorRecoveryCodeResponseDTO> buscarPorId(@PathVariable Long id) {
        try {
            log.info("Recebida requisição para buscar código de recuperação por ID: {}", id);
            Optional<TwoFactorRecoveryCode> codigo = twoFactorRecoveryCodeService.buscarPorId(id);
            
            if (codigo.isPresent()) {
                log.info("Código de recuperação encontrado com ID: {}", id);
                return ResponseEntity.ok(TwoFactorRecoveryCodeMapper.toResponse(codigo.get()));
            } else {
                log.warn("Código de recuperação não encontrado com ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar código de recuperação por ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo código de recuperação
     * @param requestDTO Dados do código a ser salvo
     * @return ResponseEntity com código salvo
     */
    @PostMapping
    public ResponseEntity<?> salvar(@Valid @RequestBody TwoFactorRecoveryCodeRequestDTO requestDTO) {
        try {
            log.info("Recebida requisição para salvar novo código de recuperação");
            TwoFactorRecoveryCode codigo = twoFactorRecoveryCodeService.salvar(requestDTO);
            log.info("Código de recuperação salvo com sucesso. ID: {}", codigo.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(TwoFactorRecoveryCodeMapper.toResponse(codigo));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao salvar código de recuperação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao salvar código de recuperação: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro interno do servidor"));
        }
    }

    /**
     * Deleta um código de recuperação pelo ID
     * @param id ID do código a ser deletado
     * @return ResponseEntity com status 204 (No Content) se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            log.info("Recebida requisição para deletar código de recuperação com ID: {}", id);
            twoFactorRecoveryCodeService.deletar(id);
            log.info("Código de recuperação deletado com sucesso. ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Código de recuperação não encontrado para deletar. ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao deletar código de recuperação com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro interno do servidor"));
        }
    }

    /**
     * Verifica se um código é válido
     * @param code Código a ser verificado
     * @return ResponseEntity com boolean indicando se o código é válido
     */
    @GetMapping("/verificar")
    public ResponseEntity<Boolean> verificarCodigo(@RequestParam String code) {
        try {
            log.info("Recebida requisição para verificar código de recuperação");
            boolean isValid = twoFactorRecoveryCodeService.isCodigoValido(code);
            log.info("Código válido: {}", isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            log.error("Erro ao verificar código de recuperação: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    /**
     * Marca um código como utilizado
     * @param code Código a ser marcado como utilizado
     * @param idUsuario ID do usuário
     * @return ResponseEntity com boolean indicando sucesso
     */
    @PostMapping("/usar")
    public ResponseEntity<?> marcarComoUsado(@RequestParam String code, @RequestParam Long idUsuario) {
        try {
            log.info("Recebida requisição para marcar código como utilizado: {}", code);
            boolean sucesso = twoFactorRecoveryCodeService.marcarComoUsado(code, idUsuario);
            log.info("Código marcado como utilizado: {}", sucesso);
            return ResponseEntity.ok(Map.of("success", sucesso));
        } catch (IllegalArgumentException e) {
            log.warn("Erro ao marcar código como utilizado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao marcar código como utilizado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro interno do servidor"));
        }
    }

    /**
     * Lista códigos válidos por usuário
     * @param idUsuario ID do usuário
     * @return ResponseEntity com lista de códigos válidos
     */
    @GetMapping("/usuario/{idUsuario}/validos")
    public ResponseEntity<List<TwoFactorRecoveryCodeResponseDTO>> buscarCodigosValidosPorUsuario(@PathVariable Long idUsuario) {
        try {
            log.info("Recebida requisição para buscar códigos válidos do usuário ID: {}", idUsuario);
            List<TwoFactorRecoveryCode> codigos = twoFactorRecoveryCodeService.buscarCodigosValidosPorUsuario(idUsuario);
            List<TwoFactorRecoveryCodeResponseDTO> responseDTOs = TwoFactorRecoveryCodeMapper.fromEntityList(codigos);
            log.info("Retornando {} códigos válidos para usuário ID: {}", responseDTOs.size(), idUsuario);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar códigos válidos por usuário ID {}: {}", idUsuario, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    /**
     * Lista códigos por usuário
     * @param idUsuario ID do usuário
     * @return ResponseEntity com lista de códigos
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<TwoFactorRecoveryCodeResponseDTO>> buscarPorUsuario(@PathVariable Long idUsuario) {
        try {
            log.info("Recebida requisição para buscar códigos do usuário ID: {}", idUsuario);
            List<TwoFactorRecoveryCode> codigos = twoFactorRecoveryCodeService.buscarPorUsuario(idUsuario);
            List<TwoFactorRecoveryCodeResponseDTO> responseDTOs = TwoFactorRecoveryCodeMapper.fromEntityList(codigos);
            log.info("Retornando {} códigos para usuário ID: {}", responseDTOs.size(), idUsuario);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar códigos por usuário ID {}: {}", idUsuario, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    /**
     * Limpa códigos expirados
     * @return ResponseEntity com número de códigos removidos
     */
    @DeleteMapping("/limpar-expirados")
    public ResponseEntity<Map<String, Integer>> limparCodigosExpirados() {
        try {
            log.info("Recebida requisição para limpar códigos expirados");
            int removidos = twoFactorRecoveryCodeService.limparCodigosExpirados();
            log.info("Códigos expirados removidos: {}", removidos);
            return ResponseEntity.ok(Map.of("removidos", removidos));
        } catch (Exception e) {
            log.error("Erro ao limpar códigos expirados: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", 0));
        }
    }
}
