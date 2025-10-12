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

    /**
     * Lista todos os registros de autenticação
     * @return Lista de todos os registros de autenticação
     */
    public List<UsuarioAutenticar> listarTodos() {
        log.info("Listando todos os registros de autenticação");
        List<UsuarioAutenticar> registros = usuarioAutenticarRepository.findAll();
        log.info("Encontrados {} registros de autenticação", registros.size());
        return registros;
    }

    /**
     * Busca um registro de autenticação pelo ID
     * @param id ID do registro de autenticação
     * @return Optional contendo o registro se encontrado
     */
    public Optional<UsuarioAutenticar> buscarPorId(Long id) {
        log.info("Buscando registro de autenticação por ID: {}", id);
        Optional<UsuarioAutenticar> registro = usuarioAutenticarRepository.findById(id);
        
        if (registro.isPresent()) {
            log.info("Registro de autenticação encontrado com ID: {}", id);
        } else {
            log.warn("Registro de autenticação não encontrado com ID: {}", id);
        }
        
        return registro;
    }

    /**
     * Salva um novo registro de autenticação
     * @param usuarioAutenticar Registro a ser salvo
     * @return Registro salvo
     */
    public UsuarioAutenticar salvar(UsuarioAutenticar usuarioAutenticar) {
        log.info("Salvando novo registro de autenticação para usuário ID: {}", 
                usuarioAutenticar.getUsuario() != null ? usuarioAutenticar.getUsuario().getIdUsuario() : "null");
        
        try {
            UsuarioAutenticar registroSalvo = usuarioAutenticarRepository.save(usuarioAutenticar);
            log.info("Registro de autenticação salvo com sucesso. ID: {}", registroSalvo.getIdUsuarioAutenticar());
            return registroSalvo;
        } catch (Exception e) {
            log.error("Erro ao salvar registro de autenticação: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao salvar registro de autenticação", e);
        }
    }

    /**
     * Deleta um registro de autenticação pelo ID
     * @param id ID do registro a ser deletado
     * @return true se deletado com sucesso, false se não encontrado
     */
    public boolean deletar(Long id) {
        log.info("Tentando deletar registro de autenticação com ID: {}", id);
        
        if (!usuarioAutenticarRepository.existsById(id)) {
            log.warn("Registro de autenticação não encontrado para deletar. ID: {}", id);
            return false;
        }
        
        try {
            usuarioAutenticarRepository.deleteById(id);
            log.info("Registro de autenticação deletado com sucesso. ID: {}", id);
            return true;
        } catch (Exception e) {
            log.error("Erro ao deletar registro de autenticação com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao deletar registro de autenticação", e);
        }
    }
}
