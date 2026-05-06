package com.acessolivre.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Lista todos os usuários
     * @return Lista de todos os usuários
     */
    public List<Usuario> listarTodos() {
        log.info("Listando todos os usuários");
        return usuarioRepository.findAllByAtivoTrue();
    }

    /**
     * Busca um usuário pelo ID
     * @param id ID do usuário
     * @return Optional contendo o usuário se encontrado
     */
    public Optional<Usuario> buscarPorId(Long id) {
        log.info("Buscando usuário por ID: {}", id);
        return usuarioRepository.findByIdUsuarioAndAtivoTrue(id);
    }

    /**
     * Salva um novo usuário
     * @param usuario Usuário a ser salvo
     * @return Usuário salvo
    * @throws IllegalArgumentException se email já existir
     */
    @Transactional
    public Usuario salvar(Usuario usuario) {
        log.info("Salvando novo usuário: {}", usuario.getEmail());
        
        // Verifica se email já existe
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            log.warn("Tentativa de cadastro com email já existente: {}", usuario.getEmail());
            throw new IllegalArgumentException("Email já cadastrado: " + usuario.getEmail());
        }
        
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        log.info("Usuário salvo com sucesso. ID: {}", usuarioSalvo.getIdUsuario());
        return usuarioSalvo;
    }

    /**
     * Atualiza um usuário existente
     * @param usuario Usuário com os dados atualizados
     * @return Usuário atualizado
     * @throws IllegalArgumentException se usuário não existir
     */
    @Transactional
    public Usuario atualizar(Usuario usuario) {
        log.info("Atualizando usuário ID: {}", usuario.getIdUsuario());
        
        // Verifica se o usuário existe
        if (usuarioRepository.findByIdUsuarioAndAtivoTrue(usuario.getIdUsuario()).isEmpty()) {
            log.warn("Tentativa de atualização de usuário inexistente. ID: {}", usuario.getIdUsuario());
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + usuario.getIdUsuario());
        }
        
        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        log.info("Usuário atualizado com sucesso. ID: {}", usuarioAtualizado.getIdUsuario());
        return usuarioAtualizado;
    }

    /**
     * Deleta um usuário pelo ID
     * @param id ID do usuário a ser deletado
     */
    @Transactional
    public void deletar(Long id) {
        log.info("Deletando usuário ID: {}", id);
        Usuario usuario = usuarioRepository.findByIdUsuarioAndAtivoTrue(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));
        usuario.setAtivo(false);
        usuario.setTokenAtual(null);
        usuarioRepository.save(usuario);
        log.info("Usuário deletado com sucesso. ID: {}", id);
    }

}
