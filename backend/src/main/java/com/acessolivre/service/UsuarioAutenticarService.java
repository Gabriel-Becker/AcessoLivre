package com.acessolivre.service;

import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioAutenticarService {

    private final UsuarioAutenticarRepository usuarioAutenticarRepository;

    public List<UsuarioAutenticar> listarTodos() {
        log.info("Listando todos os registros de autenticação");
        return usuarioAutenticarRepository.findAll();
    }

    public Optional<UsuarioAutenticar> buscarPorId(Long id) {
        log.info("Buscando registro de autenticação: id={}", id);
        return usuarioAutenticarRepository.findById(id);
    }

    public UsuarioAutenticar salvar(UsuarioAutenticar usuarioAutenticar) {
        log.info("Salvando registro de autenticação: usuarioId={}", 
                usuarioAutenticar.getUsuario() != null ? usuarioAutenticar.getUsuario().getIdUsuario() : "null");
        
        UsuarioAutenticar salvo = usuarioAutenticarRepository.save(usuarioAutenticar);
        log.info("Registro de autenticação salvo: id={}", salvo.getIdUsuarioAutenticar());
        return salvo;
    }

    public boolean deletar(Long id) {
        log.info("Deletando registro de autenticação: id={}", id);
        
        if (!usuarioAutenticarRepository.existsById(id)) {
            log.warn("Registro de autenticação não encontrado: id={}", id);
            return false;
        }
        
        usuarioAutenticarRepository.deleteById(id);
        log.info("Registro de autenticação deletado: id={}", id);
        return true;
    }
}
