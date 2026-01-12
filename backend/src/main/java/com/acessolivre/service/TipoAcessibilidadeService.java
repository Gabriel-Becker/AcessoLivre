package com.acessolivre.service;

import com.acessolivre.model.TipoAcessibilidade;
import com.acessolivre.repository.TipoAcessibilidadeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TipoAcessibilidadeService {

    private final TipoAcessibilidadeRepository tipoAcessibilidadeRepository;

    @Cacheable(value = "tiposAcessibilidade", key = "'all'")
    @Transactional(readOnly = true)
    public List<TipoAcessibilidade> listarTodos() {
        log.info("Listando todos os tipos de acessibilidade (sem cache)");
        return tipoAcessibilidadeRepository.findAll();
    }

    @Cacheable(value = "tiposAcessibilidade", key = "#id")
    @Transactional(readOnly = true)
    public Optional<TipoAcessibilidade> buscarPorId(Long id) {
        log.info("Buscando tipo de acessibilidade por ID: {} (sem cache)", id);
        return tipoAcessibilidadeRepository.findById(id);
    }

    @CacheEvict(value = "tiposAcessibilidade", allEntries = true)
    @Transactional
    public TipoAcessibilidade salvar(TipoAcessibilidade tipoAcessibilidade) {
        log.info("Salvando tipo de acessibilidade: nome={}", tipoAcessibilidade.getNome());
        TipoAcessibilidade salvo = tipoAcessibilidadeRepository.save(tipoAcessibilidade);
        log.info("Tipo de acessibilidade salvo: id={} - Cache invalidado", salvo.getIdTipoAcessibilidade());
        return salvo;
    }

    @CacheEvict(value = "tiposAcessibilidade", allEntries = true)
    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando tipo de acessibilidade: id={}", id);
        
        if (!tipoAcessibilidadeRepository.existsById(id)) {
            log.warn("Tipo de acessibilidade não encontrado para deletar: id={}", id);
            return false;
        }

        tipoAcessibilidadeRepository.deleteById(id);
        log.info("Tipo de acessibilidade deletado: id={} - Cache invalidado", id);
        return true;
    }
}