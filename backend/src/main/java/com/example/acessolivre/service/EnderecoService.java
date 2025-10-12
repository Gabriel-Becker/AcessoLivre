package com.example.acessolivre.service;

import com.example.acessolivre.model.Endereco;
import com.example.acessolivre.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;

    /**
     * Lista todos os endereços
     * @return Lista de todos os endereços
     */
    public List<Endereco> listarTodos() {
        log.info("Listando todos os endereços");
        List<Endereco> enderecos = enderecoRepository.findAll();
        log.info("Encontrados {} endereços", enderecos.size());
        return enderecos;
    }

    /**
     * Busca um endereço pelo ID
     * @param id ID do endereço
     * @return Optional contendo o endereço se encontrado
     */
    public Optional<Endereco> buscarPorId(Long id) {
        log.info("Buscando endereço por ID: {}", id);
        Optional<Endereco> endereco = enderecoRepository.findById(id);
        
        if (endereco.isPresent()) {
            log.info("Endereço encontrado com ID: {}", id);
        } else {
            log.warn("Endereço não encontrado com ID: {}", id);
        }
        
        return endereco;
    }

    /**
     * Salva um novo endereço
     * @param endereco Endereço a ser salvo
     * @return Endereço salvo
     */
    @Transactional
    public Endereco salvar(Endereco endereco) {
        log.info("Salvando novo endereço para usuário ID: {}", 
                endereco.getUsuario() != null ? endereco.getUsuario().getIdUsuario() : "null");
        
        try {
            Endereco enderecoSalvo = enderecoRepository.save(endereco);
            log.info("Endereço salvo com sucesso. ID: {}", enderecoSalvo.getIdEndereco());
            return enderecoSalvo;
        } catch (Exception e) {
            log.error("Erro ao salvar endereço: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao salvar endereço", e);
        }
    }

    /**
     * Deleta um endereço pelo ID
     * @param id ID do endereço a ser deletado
     * @return true se deletado com sucesso, false se não encontrado
     */
    @Transactional
    public boolean deletar(Long id) {
        log.info("Tentando deletar endereço com ID: {}", id);
        
        if (!enderecoRepository.existsById(id)) {
            log.warn("Endereço não encontrado para deletar. ID: {}", id);
            return false;
        }
        
        try {
            enderecoRepository.deleteById(id);
            log.info("Endereço deletado com sucesso. ID: {}", id);
            return true;
        } catch (Exception e) {
            log.error("Erro ao deletar endereço com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao deletar endereço", e);
        }
    }
}
