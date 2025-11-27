package com.acessolivre.service;

import com.acessolivre.model.Endereco;
import com.acessolivre.repository.EnderecoRepository;
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

    public List<Endereco> listarTodos() {
        log.info("Listando todos os endereços");
        return enderecoRepository.findAll();
    }

    public Optional<Endereco> buscarPorId(Long id) {
        log.info("Buscando endereço: id={}", id);
        return enderecoRepository.findById(id);
    }

    @Transactional
    public Endereco salvar(Endereco endereco) {
        log.info("Salvando endereço: usuarioId={}", 
                endereco.getUsuario() != null ? endereco.getUsuario().getIdUsuario() : "null");
        
        Endereco salvo = enderecoRepository.save(endereco);
        log.info("Endereço salvo: id={}", salvo.getIdEndereco());
        return salvo;
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando endereço: id={}", id);
        
        if (!enderecoRepository.existsById(id)) {
            log.warn("Endereço não encontrado para deletar: id={}", id);
            return false;
        }
        
        enderecoRepository.deleteById(id);
        log.info("Endereço deletado: id={}", id);
        return true;
    }
}
