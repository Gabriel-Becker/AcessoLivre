package com.acessolivre.controller;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.mapper.LocalMapper;
import com.acessolivre.model.Local;
import com.acessolivre.service.LocalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller responsável pelos endpoints de Local
 */
@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
@Slf4j
public class LocalController {

    private final LocalService localService;
    private final LocalMapper localMapper; 

    /**
     * Lista todos os locais
     * @param page Número da página (padrão: 0)
     * @param size Tamanho da página (padrão: 20)
     * @param sort Campo para ordenação (padrão: nome)
     * @return ResponseEntity com lista de locais
     */
    @GetMapping
    public ResponseEntity<Page<LocalResponseDTO>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome") String sort) {
        log.info("Endpoint GET /api/locais - Listando locais paginados: página={}, tamanho={}", page, size);
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
            Page<Local> locais = localService.listarTodos(pageable);
            Page<LocalResponseDTO> responseDTOs = locais.map(localMapper::toResponse); // ← USAR INSTÂNCIA
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar locais", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

   
}