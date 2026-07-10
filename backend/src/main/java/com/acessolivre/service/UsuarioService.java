package com.acessolivre.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.model.Usuario;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.util.ValidadorNome;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    private String normalizarEmail(String email) {
        if (email == null) {
            throw new IllegalArgumentException("Email é obrigatório");
        }
        return email.trim().toLowerCase();
    }

    public List<Usuario> listarTodos() {
        log.info("Listando todos os usuários");
        return usuarioRepository.findAllByAtivoTrue();
    }

 
    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findByIdUsuarioAndAtivoTrue(id);
    }


    @Transactional
    public Usuario salvar(Usuario usuario) {
        usuario.setNome(ValidadorNome.normalizar(usuario.getNome()));
        usuario.setEmail(normalizarEmail(usuario.getEmail()));
        log.info("Salvando novo usuário: {}", usuario.getEmail());
        
        // Verifica se email já existe
        if (usuarioRepository.existsByEmailIgnoreCase(usuario.getEmail())) {
            log.warn("Tentativa de cadastro com email já existente: {}", usuario.getEmail());
            throw new IllegalArgumentException("Email já cadastrado: " + usuario.getEmail());
        }
        
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        log.info("Usuário salvo com sucesso. ID: {}", usuarioSalvo.getIdUsuario());
        return usuarioSalvo;
    }


    @Transactional
    public Usuario atualizar(Usuario usuario) {
        usuario.setNome(ValidadorNome.normalizar(usuario.getNome()));
        usuario.setEmail(normalizarEmail(usuario.getEmail()));
        log.info("Atualizando usuário ID: {}", usuario.getIdUsuario());
        
        // Verifica se o usuário existe
        if (usuarioRepository.findByIdUsuarioAndAtivoTrue(usuario.getIdUsuario()).isEmpty()) {
            log.warn("Tentativa de atualização de usuário inexistente. ID: {}", usuario.getIdUsuario());
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + usuario.getIdUsuario());
        }

        Optional<Usuario> usuarioComMesmoEmail = usuarioRepository.findByEmailIgnoreCase(usuario.getEmail());
        if (usuarioComMesmoEmail.isPresent() && !usuarioComMesmoEmail.get().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new IllegalArgumentException("Email já cadastrado: " + usuario.getEmail());
        }
        
        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        log.info("Usuário atualizado com sucesso. ID: {}", usuarioAtualizado.getIdUsuario());
        return usuarioAtualizado;
    }

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
