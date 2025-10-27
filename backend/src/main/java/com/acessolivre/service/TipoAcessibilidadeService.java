package com.acessolivre.service;

import com.acessolivre.model.TipoAcessibilidade;
import com.acessolivre.repository.TipoAcessibilidadeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipoAcessibilidadeService {

    private final TipoAcessibilidadeRepository tipoAcessibilidadeRepository;

    public List<TipoAcessibilidade> listarTodos() {
        log.info("Listando todos os tipos de acessibilidade");
        return tipoAcessibilidadeRepository.findAll();
    }

    public Optional<TipoAcessibilidade> buscarPorId(Long id) {
        log.info("Buscando tipo de acessibilidade por ID: {}", id);
        return tipoAcessibilidadeRepository.findById(id);
    }

    @Transactional
    public TipoAcessibilidade salvar(TipoAcessibilidade tipoAcessibilidade) {
        log.info("Salvando novo tipo de acessibilidade: {}", tipoAcessibilidade.getNome());
        return tipoAcessibilidadeRepository.save(tipoAcessibilidade);
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando tipo de acessibilidade ID: {}", id);
        
        if (!tipoAcessibilidadeRepository.existsById(id)) {
            return false;
        }

        tipoAcessibilidadeRepository.deleteById(id);
        return true;
    }
}