package com.example.acessolivre.service;

import com.example.acessolivre.model.Usuario;
import com.example.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Lista todos os usuários
     * @return Lista de todos os usuários
     */
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    /**
     * Busca um usuário pelo ID
     * @param id ID do usuário
     * @return Optional contendo o usuário se encontrado
     */
    public Optional<Usuario> buscarPorId(Integer id) {
        return usuarioRepository.findById(id);
    }

    /**
     * Salva um novo usuário
     * @param usuario Usuário a ser salvo
     * @return Usuário salvo
     */
    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    /**
     * Atualiza um usuário existente
     * @param usuario Usuário com os dados atualizados
     * @return Usuário atualizado
     */
    public Usuario atualizar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    /**
     * Deleta um usuário pelo ID
     * @param id ID do usuário a ser deletado
     */
    public void deletar(Integer id) {
        usuarioRepository.deleteById(id);
    }
}
