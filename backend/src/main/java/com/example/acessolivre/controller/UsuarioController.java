package com.example.acessolivre.controller;

import com.example.acessolivre.model.Usuario;
import com.example.acessolivre.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Lista todos os usuários
     * @return ResponseEntity com lista de usuários
     */
    @GetMapping("/")
    public ResponseEntity<List<Usuario>> listarTodos() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Busca um usuário pelo ID
     * @param id ID do usuário
     * @return ResponseEntity com usuário se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Integer id) {
        Optional<Usuario> usuario = usuarioService.buscarPorId(id);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Salva um novo usuário
     * @param usuario Usuário a ser salvo
     * @return ResponseEntity com usuário salvo
     */
    @PostMapping("/")
    public ResponseEntity<Usuario> salvar(@RequestBody Usuario usuario) {
        Usuario usuarioSalvo = usuarioService.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioSalvo);
    }

    /**
     * Atualiza um usuário existente
     * @param id ID do usuário a ser atualizado
     * @param usuario Usuário com dados atualizados
     * @return ResponseEntity com usuário atualizado ou 404 se não encontrado
     */
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Integer id, @RequestBody Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioService.buscarPorId(id);
        
        if (usuarioExistente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        usuario.setIdUsuario(id);
        Usuario usuarioAtualizado = usuarioService.atualizar(usuario);
        return ResponseEntity.ok(usuarioAtualizado);
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
