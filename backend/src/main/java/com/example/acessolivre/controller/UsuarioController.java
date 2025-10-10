package com.example.acessolivre.controller;

import com.example.acessolivre.dto.UsuarioRequestDTO;
import com.example.acessolivre.dto.UsuarioResponseDTO;
import com.example.acessolivre.model.Usuario;
import com.example.acessolivre.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Converte UsuarioRequestDTO para Usuario
     */
    private Usuario toUsuario(UsuarioRequestDTO dto) {
        return Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .cpf(dto.getCpf())
                .role(dto.getRole())
                .imagemPerfil(dto.getImagemPerfil())
                .build();
    }

    /**
     * Converte Usuario para UsuarioResponseDTO
     */
    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpf(),
                usuario.getRole(),
                usuario.getDataCadastro(),
                usuario.getImagemPerfil()
        );
    }

    /**
     * Lista todos os usuários
     * @return ResponseEntity com lista de usuários
     */
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        List<UsuarioResponseDTO> responseDTOs = usuarios.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * Busca um usuário pelo ID
     * @param id ID do usuário
     * @return ResponseEntity com usuário se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Integer id) {
        Optional<Usuario> usuario = usuarioService.buscarPorId(id);
        return usuario.map(u -> ResponseEntity.ok(toResponseDTO(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Salva um novo usuário
     * @param requestDTO Dados do usuário a ser salvo
     * @return ResponseEntity com usuário salvo
     */
    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> salvar(@RequestBody UsuarioRequestDTO requestDTO) {
        Usuario usuario = toUsuario(requestDTO);
        Usuario usuarioSalvo = usuarioService.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponseDTO(usuarioSalvo));
    }

    /**
     * Atualiza um usuário existente
     * @param id ID do usuário a ser atualizado
     * @param requestDTO Dados atualizados do usuário
     * @return ResponseEntity com usuário atualizado ou 404 se não encontrado
     */
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Integer id, @RequestBody UsuarioRequestDTO requestDTO) {
        Optional<Usuario> usuarioExistente = usuarioService.buscarPorId(id);
        
        if (usuarioExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Usuario usuario = toUsuario(requestDTO);
        usuario.setIdUsuario(id);
        Usuario usuarioAtualizado = usuarioService.atualizar(usuario);
        return ResponseEntity.ok(toResponseDTO(usuarioAtualizado));
    }

    /**
     * Deleta um usuário pelo ID
     * @param id ID do usuário a ser deletado
     * @return ResponseEntity com status 204 (No Content) se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        Optional<Usuario> usuarioExistente = usuarioService.buscarPorId(id);
        
        if (usuarioExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
