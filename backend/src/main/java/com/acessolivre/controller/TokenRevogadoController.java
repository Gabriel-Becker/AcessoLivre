package com.acessolivre.controller;

import com.acessolivre.dto.request.TokenRevogadoRequestDTO;
import com.acessolivre.dto.response.TokenRevogadoResponseDTO;
import com.acessolivre.mapper.TokenRevogadoMapper;
import com.acessolivre.model.TokenRevogado;
import com.acessolivre.service.TokenRevogadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/token-revogado")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class TokenRevogadoController {

    private final TokenRevogadoService tokenRevogadoService;

    /**
     * Lista todos os tokens revogados
     * @return ResponseEntity com lista de tokens revogados
     */
    @GetMapping
    public ResponseEntity<List<TokenRevogadoResponseDTO>> listarTodos() {
        try {
            log.info("Recebida requisição para listar todos os tokens revogados");
            List<TokenRevogado> tokensRevogados = tokenRevogadoService.listarTodos();
            List<TokenRevogadoResponseDTO> responseDTOs = tokensRevogados.stream()
                    .map(TokenRevogadoMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} tokens revogados", responseDTOs.size());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar tokens revogados: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um token revogado pelo ID
     * @param id ID do token revogado
     * @return ResponseEntity com token revogado se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<TokenRevogadoResponseDTO> buscarPorId(@PathVariable Long id) {
        try {
            log.info("Recebida requisição para buscar token revogado por ID: {}", id);
            Optional<TokenRevogado> tokenRevogado = tokenRevogadoService.buscarPorId(id);
            
            if (tokenRevogado.isPresent()) {
                log.info("Token revogado encontrado com ID: {}", id);
                return ResponseEntity.ok(TokenRevogadoMapper.toResponse(tokenRevogado.get()));
            } else {
                log.warn("Token revogado não encontrado com ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar token revogado por ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo token revogado
     * @param requestDTO Dados do token revogado a ser salvo
     * @return ResponseEntity com token revogado salvo
     */
    @PostMapping
    public ResponseEntity<TokenRevogadoResponseDTO> salvar(@Valid @RequestBody TokenRevogadoRequestDTO requestDTO) {
        try {
            log.info("Recebida requisição para salvar novo token revogado");
            TokenRevogado tokenRevogado = tokenRevogadoService.salvar(requestDTO);
            log.info("Token revogado salvo com sucesso. ID: {}", tokenRevogado.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(TokenRevogadoMapper.toResponse(tokenRevogado));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao salvar token revogado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Erro ao salvar token revogado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deleta um token revogado pelo ID
     * @param id ID do token revogado a ser deletado
     * @return ResponseEntity com status 204 (No Content) se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            log.info("Recebida requisição para deletar token revogado com ID: {}", id);
            tokenRevogadoService.deletar(id);
            log.info("Token revogado deletado com sucesso. ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Token revogado não encontrado para deletar. ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Erro ao deletar token revogado com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Verifica se um token foi revogado
     * @param token Token a ser verificado
     * @return ResponseEntity com boolean indicando se o token foi revogado
     */
    @GetMapping("/verificar")
    public ResponseEntity<Boolean> verificarTokenRevogado(@RequestParam String token) {
        try {
            log.info("Recebida requisição para verificar se token foi revogado");
            boolean isRevogado = tokenRevogadoService.isTokenRevogado(token);
            log.info("Token revogado: {}", isRevogado);
            return ResponseEntity.ok(isRevogado);
        } catch (Exception e) {
            log.error("Erro ao verificar token revogado: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lista tokens revogados por usuário
     * @param idUsuario ID do usuário
     * @return ResponseEntity com lista de tokens revogados do usuário
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<TokenRevogadoResponseDTO>> buscarPorUsuario(@PathVariable Long idUsuario) {
        try {
            log.info("Recebida requisição para buscar tokens revogados do usuário ID: {}", idUsuario);
            List<TokenRevogado> tokensRevogados = tokenRevogadoService.buscarPorUsuario(idUsuario);
            List<TokenRevogadoResponseDTO> responseDTOs = tokensRevogados.stream()
                    .map(TokenRevogadoMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} tokens revogados para usuário ID: {}", responseDTOs.size(), idUsuario);
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar tokens revogados por usuário ID {}: {}", idUsuario, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
