package com.acessolivre.controller;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.TipoAcessibilidade;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
@Slf4j
public class LocalController {

    private final LocalService localService;

    /**
     * Lista todos os locais raiz (sem pai) com paginação.
     * @param page Número da página (padrão: 0)
     * @param size Tamanho da página (padrão: 20)
     * @param sort Campo para ordenação (padrão: nome)
     */
    @GetMapping
    public ResponseEntity<Page<LocalResponseDTO>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nome") String sort) {
        
        log.info("Listando locais RAIZ (paginado): página={}, tamanho={}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        Page<Local> locais = localService.listarLocaisRaiz(pageable);
        Page<LocalResponseDTO> responseDTOs = locais.map(LocalMapper::toResponse);
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * Busca locais por categoria (enum).
     * @param categoria valor do enum (ex: RESTAURANTE, PARQUE, etc.)
     */
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorCategoria(@PathVariable Categoria categoria) {
        log.info("Buscando locais por categoria: {}", categoria);
        List<Local> locais = localService.buscarPorCategoria(categoria);
        List<LocalResponseDTO> dtos = locais.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Busca locais por tipo de acessibilidade (enum).
     * @param tipo valor do enum (ex: RAMPA, ELEVADOR, etc.)
     */
    @GetMapping("/tipo-acessibilidade/{tipo}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorTipoAcessibilidade(@PathVariable TipoAcessibilidade tipo) {
        log.info("Buscando locais por tipo de acessibilidade: {}", tipo);
        List<Local> locais = localService.buscarPorTipoAcessibilidade(tipo);
        List<LocalResponseDTO> dtos = locais.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Busca um local pelo ID.
     * @param id ID do local
     */
    @GetMapping("/{id}")
    public ResponseEntity<LocalResponseDTO> buscarPorId(@PathVariable Long id) {
        return localService.buscarPorId(id)
                .map(LocalMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Busca sub-locais (filhos diretos) de um local.
     * @param id ID do local pai
     */
    @GetMapping("/{id}/sub-locais")
    public ResponseEntity<Page<LocalResponseDTO>> listarSubLocais(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Buscando sub-locais do local ID: {}", id);
        Pageable pageable = PageRequest.of(page, size);
        Page<Local> subLocais = localService.listarSubLocais(id, pageable);
        Page<LocalResponseDTO> dtos = subLocais.map(LocalMapper::toResponse);
        return ResponseEntity.ok(dtos);
    }

    /**
     * Busca a hierarquia completa (ancestrais) de um local.
     * @param id ID do local
     */
    @GetMapping("/{id}/hierarquia")
    public ResponseEntity<List<LocalResponseDTO>> buscarHierarquia(@PathVariable Long id) {
        log.info("Buscando hierarquia completa do local ID: {}", id);
        List<Local> hierarquia = localService.buscarHierarquiaCompleta(id);
        List<LocalResponseDTO> dtos = hierarquia.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Salva um novo local.
     * @param requestDTO Dados do local
     */
    @PostMapping
    public ResponseEntity<LocalResponseDTO> salvar(@Valid @RequestBody LocalRequestDTO requestDTO) {
        log.info("Salvando local: {}", requestDTO.getNome());
        Local local = localService.salvar(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(LocalMapper.toResponse(local));
    }

    /**
     * Atualiza um local existente.
     * @param id ID do local
     * @param requestDTO Dados atualizados
     */
    @PutMapping("/{id}")
    public ResponseEntity<LocalResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody LocalRequestDTO requestDTO) {
        return localService.atualizar(id, requestDTO)
                .map(LocalMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deleta um local (somente se não tiver sub-locais).
     * @param id ID do local
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        localService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}