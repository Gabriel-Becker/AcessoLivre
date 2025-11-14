package com.acessolivre.controller;

import com.acessolivre.dto.response.CategoriaResponseDTO;
import com.acessolivre.mapper.CategoriaMapper;
import com.acessolivre.model.Categoria;
import com.acessolivre.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller responsável pelos endpoints de Categoria
 */
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@Slf4j
public class CategoriaController {

    private final CategoriaService categoriaService;

    /**
     * Lista todas as categorias
     * @return ResponseEntity com lista de categorias
     */
    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodos() {
        log.info("Endpoint GET /api/categorias - Listando todas as categorias");
        try {
            List<Categoria> categorias = categoriaService.listarTodos();
            List<CategoriaResponseDTO> responseDTOs = categorias.stream()
                    .map(CategoriaMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar categorias", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca uma categoria pelo ID
     * @param id ID da categoria
     * @return ResponseEntity com categoria se encontrada ou 404 se não encontrada
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("Endpoint GET /api/categorias/{} - Buscando categoria por ID", id);
        try {
            Optional<Categoria> categoria = categoriaService.buscarPorId(id);
            return categoria.map(c -> ResponseEntity.ok(CategoriaMapper.toResponse(c)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar categoria por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva uma nova categoria
     * @param categoria Categoria a ser salva
     * @return ResponseEntity com categoria salva
     */
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Categoria categoria) {
        log.info("Endpoint POST /api/categorias - Salvando nova categoria");
        try {
            Categoria categoriaSalva = categoriaService.salvar(categoria);
            log.info("Categoria salva com sucesso. ID: {}", categoriaSalva.getIdCategoria());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CategoriaMapper.toResponse(categoriaSalva));
        } catch (Exception e) {
            log.error("Erro ao salvar categoria", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar categoria");
        }
    }

    /**
     * Deleta uma categoria pelo ID
     * @param id ID da categoria a ser deletada
     * @return ResponseEntity com status 204 se deletada ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("Endpoint DELETE /api/categorias/{} - Deletando categoria", id);
        try {
            boolean deletado = categoriaService.deletar(id);
            
            if (deletado) {
                log.info("Categoria deletada com sucesso. ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("Categoria não encontrada para deletar. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao deletar categoria ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
