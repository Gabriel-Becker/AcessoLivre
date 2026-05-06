package com.acessolivre.controller;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.acessolivre.dto.request.AlterarRoleRequestDTO;
import com.acessolivre.dto.response.AvaliacaoResponseDTO;
import com.acessolivre.dto.response.UsuarioAdminResponseDTO;
import com.acessolivre.mapper.AvaliacaoMapper;
import com.acessolivre.model.Usuario;
import com.acessolivre.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    /**
     * Lista todos os usuários com paginação
     * @param page Número da página (padrão: 0)
     * @param size Tamanho da página (padrão: 20)
     * @param sort Campo para ordenação (padrão: dataCadastro)
     */
    @GetMapping("/usuarios")
    public ResponseEntity<Page<UsuarioAdminResponseDTO>> listarUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "dataCadastro") String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort));
        Page<UsuarioAdminResponseDTO> usuarios = adminService.listarTodosUsuarios(pageable)
                .map(this::toUsuarioAdminResponse);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioAdminResponseDTO> buscarUsuario(@PathVariable Long id) {
        return adminService.buscarUsuarioPorId(id)
                .map(this::toUsuarioAdminResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/usuarios/{id}/role")
    public ResponseEntity<Void> alterarRole(
            @PathVariable Long id,
            @Valid @RequestBody AlterarRoleRequestDTO dto) {
        boolean alterado = adminService.alterarRoleUsuario(id, dto.getNovaRole());
        return alterado ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/usuarios/{id}/senha")
    public ResponseEntity<Void> alterarSenhaUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String novaSenha = body != null ? body.get("novaSenha") : null;
        if (novaSenha == null || novaSenha.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        boolean alterado = adminService.alterarSenhaUsuario(id, novaSenha);
        return alterado ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        boolean deletado = adminService.deletarUsuario(id);
        return deletado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/moderacao/avaliacoes/pendentes")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarAvaliacoesPendentes() {
        List<AvaliacaoResponseDTO> avaliacoes = adminService.listarAvaliacoesPendentes()
                .stream()
                .map(AvaliacaoMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(avaliacoes);
    }

    @PutMapping("/moderacao/avaliacoes/{id}/aprovar")
    public ResponseEntity<Void> aprovarAvaliacao(@PathVariable Long id) {
        boolean aprovada = adminService.aprovarAvaliacao(id);
        return aprovada ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/moderacao/avaliacoes/{id}/rejeitar")
    public ResponseEntity<Void> rejeitarAvaliacao(@PathVariable Long id) {
        boolean rejeitada = adminService.rejeitarAvaliacao(id);
        return rejeitada ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/relatorios/estatisticas-gerais")
    public ResponseEntity<Map<String, Object>> obterEstatisticasGerais() {
        return ResponseEntity.ok(adminService.obterEstatisticasGerais());
    }

    @GetMapping("/relatorios/locais-por-estado")
    public ResponseEntity<Map<String, Long>> obterLocaisPorEstado() {
        return ResponseEntity.ok(adminService.obterEstatisticasPorEstado());
    }

    @GetMapping("/relatorios/locais-por-categoria")
    public ResponseEntity<Map<String, Long>> obterLocaisPorCategoria() {
        return ResponseEntity.ok(adminService.obterEstatisticasPorCategoria());
    }

    @GetMapping("/relatorios/locais-por-tipo-acessibilidade")
    public ResponseEntity<Map<String, Long>> obterLocaisPorTipoAcessibilidade() {
        return ResponseEntity.ok(adminService.obterEstatisticasPorTipoAcessibilidade());
    }

    private UsuarioAdminResponseDTO toUsuarioAdminResponse(Usuario usuario) {
    return UsuarioAdminResponseDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
        .role(usuario.getRole() != null ? usuario.getRole().name() : null)
            .ativo(usuario.getAtivo())
                .dataCadastro(usuario.getDataCadastro() != null ? 
                        usuario.getDataCadastro().format(FORMATTER) : null)
                .build();
    }
}
