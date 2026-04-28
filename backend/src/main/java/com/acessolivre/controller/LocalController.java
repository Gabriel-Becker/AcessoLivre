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
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
@Slf4j
public class LocalController {

    private final LocalService localService;

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

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorCategoria(@PathVariable Categoria categoria) {
        log.info("Buscando locais por categoria: {}", categoria);
        List<Local> locais = localService.buscarPorCategoria(categoria);
        List<LocalResponseDTO> dtos = locais.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/tipo-acessibilidade/{tipo}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorTipoAcessibilidade(@PathVariable TipoAcessibilidade tipo) {
        log.info("Buscando locais por tipo de acessibilidade: {}", tipo);
        List<Local> locais = localService.buscarPorTipoAcessibilidade(tipo);
        List<LocalResponseDTO> dtos = locais.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/tipo-acessibilidade/{tipo}/paginado")
    public ResponseEntity<Page<LocalResponseDTO>> buscarPorTipoAcessibilidadePaginado(
            @PathVariable TipoAcessibilidade tipo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Buscando locais por tipo de acessibilidade com paginação: {}", tipo);
        Pageable pageable = PageRequest.of(page, size);
        Page<Local> locais = localService.buscarPorTipoAcessibilidadePaginado(tipo, pageable);
        Page<LocalResponseDTO> dtos = locais.map(LocalMapper::toResponse);
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/tipo-acessibilidade/buscar-por-qualquer-tipo")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorQualquerTipoAcessibilidade(
            @RequestBody Set<TipoAcessibilidade> tipos) {
        log.info("Buscando locais por qualquer um dos tipos: {}", tipos);
        List<Local> locais = localService.buscarPorQualquerTipoAcessibilidade(tipos);
        List<LocalResponseDTO> dtos = locais.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/tipo-acessibilidade/buscar-por-qualquer-tipo/paginado")
    public ResponseEntity<Page<LocalResponseDTO>> buscarPorQualquerTipoAcessibilidadePaginado(
            @RequestBody Set<TipoAcessibilidade> tipos,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Buscando locais por qualquer um dos tipos com paginação: {}", tipos);
        Pageable pageable = PageRequest.of(page, size);
        Page<Local> locais = localService.buscarPorQualquerTipoAcessibilidadePaginado(tipos, pageable);
        Page<LocalResponseDTO> dtos = locais.map(LocalMapper::toResponse);
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/tipo-acessibilidade/buscar-por-todos-tipos")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorTodosTiposAcessibilidade(
            @RequestBody Set<TipoAcessibilidade> tipos) {
        log.info("Buscando locais que possuem todos os tipos: {}", tipos);
        List<Local> locais = localService.buscarPorTodosTiposAcessibilidade(tipos);
        List<LocalResponseDTO> dtos = locais.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/tipo-acessibilidade/buscar-por-todos-tipos/paginado")
    public ResponseEntity<Page<LocalResponseDTO>> buscarPorTodosTiposAcessibilidadePaginado(
            @RequestBody Set<TipoAcessibilidade> tipos,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Buscando locais que possuem todos os tipos com paginação: {}", tipos);
        Pageable pageable = PageRequest.of(page, size);
        Page<Local> locais = localService.buscarPorTodosTiposAcessibilidadePaginado(tipos, pageable);
        Page<LocalResponseDTO> dtos = locais.map(LocalMapper::toResponse);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/categoria/{categoria}/tipo-acessibilidade/{tipo}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorCategoriaETipoAcessibilidade(
            @PathVariable Categoria categoria,
            @PathVariable TipoAcessibilidade tipo) {
        
        log.info("Buscando locais por categoria {} e tipo de acessibilidade {}", categoria, tipo);
        List<Local> locais = localService.buscarPorCategoriaETipoAcessibilidade(categoria, tipo);
        List<LocalResponseDTO> dtos = locais.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}/tipos-acessibilidade/count")
    public ResponseEntity<Integer> contarTiposAcessibilidade(@PathVariable Long id) {
        log.info("Contando tipos de acessibilidade do local ID: {}", id);
        Integer count = localService.contarTiposAcessibilidadePorLocal(id);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/tipos-acessibilidade")
    public ResponseEntity<LocalResponseDTO> atualizarTiposAcessibilidade(
            @PathVariable Long id,
            @RequestBody Set<TipoAcessibilidade> tipos) {
        
        log.info("Atualizando tipos de acessibilidade do local ID: {} para {}", id, tipos);
        Local local = localService.atualizarTiposAcessibilidade(id, tipos);
        return ResponseEntity.ok(LocalMapper.toResponse(local));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalResponseDTO> buscarPorId(@PathVariable Long id) {
        return localService.buscarPorId(id)
                .map(LocalMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

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

    @GetMapping("/{id}/hierarquia")
    public ResponseEntity<List<LocalResponseDTO>> buscarHierarquia(@PathVariable Long id) {
        log.info("Buscando hierarquia completa do local ID: {}", id);
        List<Local> hierarquia = localService.buscarHierarquiaCompleta(id);
        List<LocalResponseDTO> dtos = hierarquia.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<LocalResponseDTO> salvar(@Valid @RequestBody LocalRequestDTO requestDTO) {
        log.info("Salvando local: {}", requestDTO.getNome());
        Local local = localService.salvar(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(LocalMapper.toResponse(local));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody LocalRequestDTO requestDTO) {
        return localService.atualizar(id, requestDTO)
                .map(LocalMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        localService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}