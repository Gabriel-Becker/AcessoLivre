package com.acessolivre.service;

import com.acessolivre.model.Categoria;
import com.acessolivre.repository.CategoriaRepository;
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
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Cacheable(value = "categorias", key = "'all'")
    @Transactional(readOnly = true)
    public List<Categoria> listarTodos() {
        log.info("Listando todas as categorias (sem cache)");
        return categoriaRepository.findAll();
    }

    @Cacheable(value = "categorias", key = "#id")
    @Transactional(readOnly = true)
    public Optional<Categoria> buscarPorId(Long id) {
        log.info("Buscando categoria por ID: {} (sem cache)", id);
        return categoriaRepository.findById(id);
    }

    @CacheEvict(value = "categorias", allEntries = true)
    @Transactional
    public Categoria salvar(Categoria categoria) {
        log.info("Salvando categoria: nome={}", categoria.getNome());
        Categoria salva = categoriaRepository.save(categoria);
        log.info("Categoria salva: id={} - Cache invalidado", salva.getIdCategoria());
        return salva;
    }

    @CacheEvict(value = "categorias", allEntries = true)
    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando categoria: id={}", id);
        
        if (!categoriaRepository.existsById(id)) {
            log.warn("Categoria não encontrada para deletar: id={}", id);
            return false;
        }

        categoriaRepository.deleteById(id);
        log.info("Categoria deletada: id={} - Cache invalidado", id);
        return true;
    }
}