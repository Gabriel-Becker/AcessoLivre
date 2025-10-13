package com.acessolivre.controller;

import com.acessolivre.dto.request.UsuarioRequestDTO;
import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.mapper.UsuarioMapper;
import com.acessolivre.model.Usuario;
import com.acessolivre.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Lista todos os usuários
     * @return ResponseEntity com lista de usuários
     */
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        try {
            log.info("Endpoint GET /api/usuarios - Listando todos os usuários");
            List<Usuario> usuarios = usuarioService.listarTodos();
            List<UsuarioResponseDTO> responseDTOs = usuarios.stream()
                    .map(UsuarioMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar usuários", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um usuário pelo ID
     * @param id ID do usuário
     * @return ResponseEntity com usuário se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        try {
            log.info("Endpoint GET /api/usuarios/{} - Buscando usuário por ID", id);
            Optional<Usuario> usuario = usuarioService.buscarPorId(id);
            return usuario.map(u -> ResponseEntity.ok(UsuarioMapper.toResponse(u)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar usuário por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo usuário
     * @param requestDTO Dados do usuário a ser salvo
     * @return ResponseEntity com usuário salvo
     */
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> salvar(@Valid @RequestBody UsuarioRequestDTO requestDTO) {
        try {
            log.info("Endpoint POST /api/usuarios - Salvando novo usuário: {}", requestDTO.getEmail());
            Usuario usuario = UsuarioMapper.toEntity(requestDTO);
            Usuario usuarioSalvo = usuarioService.salvar(usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioMapper.toResponse(usuarioSalvo));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao salvar usuário: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao salvar usuário", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Atualiza um usuário existente
     * @param id ID do usuário a ser atualizado
     * @param requestDTO Dados atualizados do usuário
     * @return ResponseEntity com usuário atualizado ou 404 se não encontrado
     */
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO requestDTO) {
        try {
            log.info("Endpoint PUT /api/usuarios/{} - Atualizando usuário", id);
            Optional<Usuario> usuarioExistente = usuarioService.buscarPorId(id);
            
            if (usuarioExistente.isEmpty()) {
                log.warn("Usuário não encontrado para atualização. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            Usuario usuario = usuarioExistente.get();
            UsuarioMapper.updateEntity(usuario, requestDTO);
            Usuario usuarioAtualizado = usuarioService.atualizar(usuario);
            return ResponseEntity.ok(UsuarioMapper.toResponse(usuarioAtualizado));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao atualizar usuário: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Erro ao atualizar usuário ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deleta um usuário pelo ID
     * @param id ID do usuário a ser deletado
     * @return ResponseEntity com status 204 (No Content) se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        try {
            log.info("Endpoint DELETE /api/usuarios/{} - Deletando usuário", id);
            Optional<Usuario> usuarioExistente = usuarioService.buscarPorId(id);
            
            if (usuarioExistente.isEmpty()) {
                log.warn("Usuário não encontrado para deleção. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            usuarioService.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erro ao deletar usuário ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
