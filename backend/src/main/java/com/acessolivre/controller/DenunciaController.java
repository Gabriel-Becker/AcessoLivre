package com.acessolivre.controller;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.request.StatusUpdateRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.security.AuthenticationFacade;
import com.acessolivre.service.DenunciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/denuncias")
@RequiredArgsConstructor
@Tag(name = "Denúncias", description = "Endpoints para gerenciamento de denúncias")
public class DenunciaController {

    private final DenunciaService denunciaService;
    private final AuthenticationFacade authenticationFacade;

    @PostMapping
    @Operation(summary = "Criar uma nova denúncia")
    public ResponseEntity<DenunciaResponseDTO> criarDenuncia(@Valid @RequestBody DenunciaRequestDTO request) {
        log.info("Requisição para criar denúncia - Tipo: {}, TargetId: {}", request.getTipo(), request.getTargetId());
        
        // ✅ PROFISSIONAL: Extrai o ID do usuário diretamente do token JWT através do SecurityContext
        Long usuarioId = authenticationFacade.getAuthenticatedUserId();
        
        DenunciaResponseDTO response = denunciaService.criarDenuncia(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar denúncia por ID")
    public ResponseEntity<DenunciaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(denunciaService.buscarPorId(id));
    }

    @GetMapping
    @Operation(summary = "Listar denúncias com filtros")
    public ResponseEntity<Page<DenunciaResponseDTO>> listarDenuncias(
            @RequestParam(required = false) TipoDenuncia tipo,
            @RequestParam(required = false) StatusDenuncia status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) Long usuarioId,
            @PageableDefault(size = 20, sort = "dataCriacao", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<DenunciaResponseDTO> page = denunciaService.listarDenuncias(
                tipo, status, search, dataInicio, dataFim, usuarioId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/target")
    @Operation(summary = "Buscar denúncias por target")
    public ResponseEntity<List<DenunciaResponseDTO>> buscarPorTarget(
            @RequestParam TipoDenuncia tipo,
            @RequestParam Long targetId) {
        
        return ResponseEntity.ok(denunciaService.buscarPorTarget(tipo, targetId));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status da denúncia")
    public ResponseEntity<DenunciaResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // ✅ PROFISSIONAL: Usa o email do usuário autenticado ou fallback para o sistema
        String resolvidoPor = authenticationFacade.getAuthenticatedUserEmail();
        
        DenunciaResponseDTO response = denunciaService.atualizarStatus(
                id, request.getStatus(), resolvidoPor, request.getObservacoes());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/status/massa")
    @Operation(summary = "Atualizar status em massa")
    public ResponseEntity<Void> atualizarStatusEmMassa(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) request.get("ids");
        StatusDenuncia status = StatusDenuncia.valueOf((String) request.get("status"));
        
        // ✅ PROFISSIONAL: Usa o email do usuário autenticado
        String resolvidoPor = authenticationFacade.getAuthenticatedUserEmail();
        
        ids.forEach(id -> denunciaService.atualizarStatus(id, status, resolvidoPor, null));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir denúncia")
    public ResponseEntity<Void> excluirDenuncia(@PathVariable Long id) {
        denunciaService.excluirDenuncia(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/massa")
    @Operation(summary = "Excluir denúncias em massa")
    public ResponseEntity<Void> excluirDenunciasEmMassa(@RequestBody List<Long> ids) {
        denunciaService.excluirDenunciasEmMassa(ids);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    @Operation(summary = "Verificar se usuário já denunciou um target")
    public ResponseEntity<Map<String, Boolean>> verificarDenuncia(
            @RequestParam TipoDenuncia tipo,
            @RequestParam Long targetId) {
        
        // ✅ PROFISSIONAL: Obtém o ID do usuário autenticado
        Long usuarioId = authenticationFacade.getAuthenticatedUserId();
        
        boolean jaDenunciou = denunciaService.usuarioJaDenunciou(usuarioId, tipo, targetId);
        return ResponseEntity.ok(Map.of("reported", jaDenunciou));
    }

    @GetMapping("/estatisticas")
    @Operation(summary = "Obter estatísticas de denúncias")
    public ResponseEntity<Map<String, Long>> obterEstatisticas() {
        long pendentes = denunciaService.contarPorStatus(StatusDenuncia.PENDING);
        long emAnalise = denunciaService.contarPorStatus(StatusDenuncia.REVIEWED);
        long resolvidas = denunciaService.contarPorStatus(StatusDenuncia.RESOLVED);
        long rejeitadas = denunciaService.contarPorStatus(StatusDenuncia.REJECTED);
        
        return ResponseEntity.ok(Map.of(
                "PENDING", pendentes,
                "REVIEWED", emAnalise,
                "RESOLVED", resolvidas,
                "REJECTED", rejeitadas,
                "TOTAL", pendentes + emAnalise + resolvidas + rejeitadas
        ));
    }
}