package com.acessolivre.controller;

import com.acessolivre.dto.request.AdminBootstrapRequestDTO;
import com.acessolivre.dto.response.UsuarioAdminResponseDTO;
import com.acessolivre.service.AdminBootstrapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

/**
 * Endpoint público para criação inicial do primeiro usuário ADMIN.
 * Requer o header 'X-Admin-Bootstrap-Secret' com o segredo configurado.
 * Após existir um ADMIN o endpoint retorna 409.
 */
@RestController
@RequestMapping("/api/admin/bootstrap")
@RequiredArgsConstructor
@Tag(name = "Admin Bootstrap", description = "Endpoint para criação inicial do usuário administrador")
@Slf4j
public class AdminBootstrapController {

    private final AdminBootstrapService adminBootstrapService;

    @PostMapping
    @Operation(
        summary = "Criar primeiro usuário ADMIN",
        description = "Cria o primeiro usuário com role ADMIN. Protegido por segredo (ADMIN_BOOTSTRAP_SECRET). " +
                      "Só pode ser executado uma vez - após existir um admin, retorna 409 Conflict."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Administrador criado com sucesso",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UsuarioAdminResponseDTO.class)
            )
        ),
        @ApiResponse(responseCode = "400", description = "Dados inválidos fornecidos"),
        @ApiResponse(responseCode = "403", description = "Segredo inválido ou ausente"),
        @ApiResponse(responseCode = "409", description = "Já existe um administrador cadastrado"),
        @ApiResponse(responseCode = "500", description = "Segredo de bootstrap não configurado no servidor")
    })
    public ResponseEntity<UsuarioAdminResponseDTO> bootstrap(
            @Parameter(description = "Segredo de bootstrap configurado via variável de ambiente ADMIN_BOOTSTRAP_SECRET", required = true)
            @RequestHeader(name = "X-Admin-Bootstrap-Secret", required = false) String secretHeader,
            @RequestParam(name = "secret", required = false) String secretQuery,
            @Valid @RequestBody AdminBootstrapRequestDTO dto) {
        String efetivo = secretHeader != null ? secretHeader : secretQuery; // fallback para diagnóstico
        log.info("[AdminBootstrapController] Recebido header? {} query? {} lengthHeader={} lengthQuery={} lengthUsado={}",
                secretHeader != null, secretQuery != null,
                secretHeader != null ? secretHeader.length() : 0,
                secretQuery != null ? secretQuery.length() : 0,
                efetivo != null ? efetivo.length() : 0);
        UsuarioAdminResponseDTO resp = adminBootstrapService.criarAdminSeInexistente(efetivo, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }
}