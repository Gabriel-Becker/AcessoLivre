package com.acessolivre.controller;

import com.acessolivre.dto.response.TipoAcessibilidadeResponseDTO;
import com.acessolivre.mapper.TipoAcessibilidadeMapper;
import com.acessolivre.model.TipoAcessibilidade;
import com.acessolivre.service.TipoAcessibilidadeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller responsável pelos endpoints de Tipo de Acessibilidade
 */
@RestController
@RequestMapping("/api/tipos-acessibilidade")
@RequiredArgsConstructor
@Slf4j
public class TipoAcessibilidadeController {

    private final TipoAcessibilidadeService tipoAcessibilidadeService;

    /**
     * Lista todos os tipos de acessibilidade
     * @return ResponseEntity com lista de tipos de acessibilidade
     */
    @GetMapping
    public ResponseEntity<List<TipoAcessibilidadeResponseDTO>> listarTodos() {
        log.info("Endpoint GET /api/tipos-acessibilidade - Listando todos os tipos de acessibilidade");
        try {
            List<TipoAcessibilidade> tipos = tipoAcessibilidadeService.listarTodos();
            List<TipoAcessibilidadeResponseDTO> responseDTOs = tipos.stream()
                    .map(TipoAcessibilidadeMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar tipos de acessibilidade", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um tipo de acessibilidade pelo ID
     * @param id ID do tipo de acessibilidade
     * @return ResponseEntity com tipo de acessibilidade se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<TipoAcessibilidadeResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("Endpoint GET /api/tipos-acessibilidade/{} - Buscando tipo de acessibilidade por ID", id);
        try {
            Optional<TipoAcessibilidade> tipo = tipoAcessibilidadeService.buscarPorId(id);
            return tipo.map(t -> ResponseEntity.ok(TipoAcessibilidadeMapper.toResponse(t)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar tipo de acessibilidade por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo tipo de acessibilidade
     * @param tipoAcessibilidade Tipo de acessibilidade a ser salvo
     * @return ResponseEntity com tipo de acessibilidade salvo
     */
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody TipoAcessibilidade tipoAcessibilidade) {
        log.info("Endpoint POST /api/tipos-acessibilidade - Salvando novo tipo de acessibilidade");
        try {
            TipoAcessibilidade tipoSalvo = tipoAcessibilidadeService.salvar(tipoAcessibilidade);
            log.info("Tipo de acessibilidade salvo com sucesso. ID: {}", tipoSalvo.getIdTipoAcessibilidade());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(TipoAcessibilidadeMapper.toResponse(tipoSalvo));
        } catch (Exception e) {
            log.error("Erro ao salvar tipo de acessibilidade", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar tipo de acessibilidade");
        }
    }

    /**
     * Deleta um tipo de acessibilidade pelo ID
     * @param id ID do tipo de acessibilidade a ser deletado
     * @return ResponseEntity com status 204 se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("Endpoint DELETE /api/tipos-acessibilidade/{} - Deletando tipo de acessibilidade", id);
        try {
            boolean deletado = tipoAcessibilidadeService.deletar(id);
            
            if (deletado) {
                log.info("Tipo de acessibilidade deletado com sucesso. ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("Tipo de acessibilidade não encontrado para deletar. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao deletar tipo de acessibilidade ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
