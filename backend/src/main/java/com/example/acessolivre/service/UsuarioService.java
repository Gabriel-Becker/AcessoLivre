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
     * @throws IllegalArgumentException se email ou CPF já existirem
     */
    public Usuario salvar(Usuario usuario) {
        // Verifica se email já existe
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado: " + usuario.getEmail());
        }
        
        // Verifica se CPF já existe
        if (usuarioRepository.existsByCpf(usuario.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado: " + usuario.getCpf());
        }
        
        return usuarioRepository.save(usuario);
    }

    /**
     * Atualiza um usuário existente
     * @param usuario Usuário com os dados atualizados
     * @return Usuário atualizado
     * @throws IllegalArgumentException se usuário não existir
     */
    public Usuario atualizar(Usuario usuario) {
        // Verifica se o usuário existe
        if (!usuarioRepository.existsById(usuario.getIdUsuario())) {
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + usuario.getIdUsuario());
        }
        
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
