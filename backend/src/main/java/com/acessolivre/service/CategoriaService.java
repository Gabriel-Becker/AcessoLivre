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
        log.info("Salvando nova categoria: {}", categoria.getNome());
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando categoria ID: {}", id);
        
        if (!categoriaRepository.existsById(id)) {
            return false;
        }

        categoriaRepository.deleteById(id);
        return true;
    }
}