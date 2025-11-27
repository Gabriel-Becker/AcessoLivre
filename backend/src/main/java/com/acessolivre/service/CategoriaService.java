package com.acessolivre.service;

import com.acessolivre.model.Categoria;
import com.acessolivre.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<Categoria> listarTodos() {
        log.info("Listando todas as categorias");
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> buscarPorId(Long id) {
        log.info("Buscando categoria por ID: {}", id);
        return categoriaRepository.findById(id);
    }

    @Transactional
    public Categoria salvar(Categoria categoria) {
        log.info("Salvando categoria: nome={}", categoria.getNome());
        Categoria salva = categoriaRepository.save(categoria);
        log.info("Categoria salva: id={}", salva.getIdCategoria());
        return salva;
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando categoria: id={}", id);
        
        if (!categoriaRepository.existsById(id)) {
            log.warn("Categoria não encontrada para deletar: id={}", id);
            return false;
        }

        categoriaRepository.deleteById(id);
        log.info("Categoria deletada: id={}", id);
        return true;
    }
}