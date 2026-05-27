package com.acessolivre.controller;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.TipoAcessibilidade;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.mapper.LocalMapper;
import com.acessolivre.model.Local;
import com.acessolivre.service.LocalService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
@Slf4j
public class LocalController {

    private final LocalService localService;
    
    private static final Set<String> CAMPOS_ORDENACAO_PERMITIDOS = new HashSet<>(Arrays.asList(
        "nome", "idLocal", "dataCriacao", "dataAtualizacao", "avaliacaoMedia", "categoria", "status"
    ));
    
    private static final int TAMANHO_PADRAO_PAGINA = 20;
    private static final int TAMANHO_MAXIMO_PAGINA = 100;
    private static final String CAMPO_ORDENACAO_PADRAO = "dataCriacao";

    @GetMapping
    public ResponseEntity<Page<LocalResponseDTO>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "" + TAMANHO_PADRAO_PAGINA) int size,
            @RequestParam(defaultValue = CAMPO_ORDENACAO_PADRAO) String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        int pageSize = validatePageSize(size);
        String sortField = validateSortField(sort);
        Sort.Direction sortDirection = validateSortDirection(direction);
        
        log.info("GET /api/locais - Listando locais raiz com imagens");
        
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(sortDirection, sortField));
        Page<Local> locais = localService.listarLocaisRaizComImagens(pageable);
        Page<LocalResponseDTO> responseDTOs = locais.map(LocalMapper::toResponse);
        
        log.info("Total de locais encontrados: {}", responseDTOs.getTotalElements());
        return ResponseEntity.ok(responseDTOs);
    }
    
    @GetMapping("/todos")
    public ResponseEntity<Page<LocalResponseDTO>> listarTodosLocais(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "" + TAMANHO_PADRAO_PAGINA) int size,
            @RequestParam(defaultValue = CAMPO_ORDENACAO_PADRAO) String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        int pageSize = validatePageSize(size);
        String sortField = validateSortField(sort);
        Sort.Direction sortDirection = validateSortDirection(direction);
        
        log.info("GET /api/locais/todos - Listando todos os locais com imagens");
        
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(sortDirection, sortField));
        Page<Local> locais = localService.listarTodosComImagens(pageable);
        Page<LocalResponseDTO> responseDTOs = locais.map(LocalMapper::toResponse);
        
        return ResponseEntity.ok(responseDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocalResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("GET /api/locais/{} - Buscando local com imagens", id);
        
        return localService.buscarPorIdComImagens(id)
                .map(LocalMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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
            @RequestParam(defaultValue = "" + TAMANHO_PADRAO_PAGINA) int size) {
        
        int pageSize = validatePageSize(size);
        log.info("Buscando locais por tipo de acessibilidade com paginação: {}", tipo);
        
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Local> locais = localService.buscarPorTipoAcessibilidadePaginado(tipo, pageable);
        Page<LocalResponseDTO> dtos = locais.map(LocalMapper::toResponse);
        
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorUsuario(@PathVariable Long idUsuario) {
        log.info("GET /api/locais/usuario/{} - Buscando locais do usuário", idUsuario);

        Long authId = localService.obterIdUsuarioAutenticadoPublic();
        boolean isAdmin = localService.isUsuarioAdminAutenticadoPublic();

        if (authId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!isAdmin && !authId.equals(idUsuario)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Local> locais = localService.buscarPorUsuario(idUsuario);
        List<LocalResponseDTO> dtos = locais.stream()
                .filter(l -> l.getStatus() != StatusLocal.INATIVO)
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());

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
            @RequestParam(defaultValue = "" + TAMANHO_PADRAO_PAGINA) int size) {
        
        int pageSize = validatePageSize(size);
        log.info("Buscando locais por qualquer um dos tipos com paginação: {}", tipos);
        
        if (tipos == null || tipos.isEmpty()) {
            return ResponseEntity.ok(Page.empty());
        }
        
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Local> locais = localService.buscarPorQualquerTipoAcessibilidadePaginado(tipos, pageable);
        Page<LocalResponseDTO> dtos = locais.map(LocalMapper::toResponse);
        
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/tipo-acessibilidade/buscar-por-todos-tipos")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorTodosTiposAcessibilidade(
            @RequestBody Set<TipoAcessibilidade> tipos) {
        log.info("Buscando locais que possuem todos os tipos: {}", tipos);
        
        if (tipos == null || tipos.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
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
            @RequestParam(defaultValue = "" + TAMANHO_PADRAO_PAGINA) int size) {
        
        int pageSize = validatePageSize(size);
        log.info("Buscando locais que possuem todos os tipos com paginação: {}", tipos);
        
        if (tipos == null || tipos.isEmpty()) {
            return ResponseEntity.ok(Page.empty());
        }
        
        Pageable pageable = PageRequest.of(page, pageSize);
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
        
        if (tipos == null || tipos.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Local local = localService.atualizarTiposAcessibilidade(id, tipos);
        return ResponseEntity.ok(LocalMapper.toResponse(local));
    }

    @GetMapping("/{id}/sub-locais")
    public ResponseEntity<Page<LocalResponseDTO>> listarSubLocais(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "" + TAMANHO_PADRAO_PAGINA) int size) {
        
        int pageSize = validatePageSize(size);
        log.info("Buscando sub-locais do local ID: {}, página={}, tamanho={}", id, page, pageSize);
        
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Local> subLocais = localService.listarSubLocais(id, pageable);
        Page<LocalResponseDTO> dtos = subLocais.map(LocalMapper::toResponse);
        
        log.info("Encontrados {} sub-locais para o local ID: {}", dtos.getTotalElements(), id);
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LocalResponseDTO> salvar(@Valid @RequestBody LocalRequestDTO requestDTO) {
        log.info("POST /api/locais - Salvando local: {}", requestDTO.getNome());
        
        if (requestDTO.getTiposAcessibilidade() == null || requestDTO.getTiposAcessibilidade().isEmpty()) {
            log.error("Tentativa de salvar local sem tipos de acessibilidade");
            return ResponseEntity.badRequest().build();
        }
        
        Local local = localService.salvar(requestDTO);
        log.info("Local salvo com sucesso. ID: {}", local.getIdLocal());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(LocalMapper.toResponse(local));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LocalResponseDTO> atualizar(
            @PathVariable Long id, 
            @Valid @RequestBody LocalRequestDTO requestDTO) {
        
        log.info("PUT /api/locais/{} - Atualizando local", id);
        
        if (requestDTO.getTiposAcessibilidade() == null || requestDTO.getTiposAcessibilidade().isEmpty()) {
            log.error("Tentativa de atualizar local sem tipos de acessibilidade");
            return ResponseEntity.badRequest().build();
        }
        
        return localService.atualizar(id, requestDTO)
                .map(LocalMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("DELETE /api/locais/{} - Deletando local", id);
        localService.deletar(id);
        log.info("Local ID: {} deletado com sucesso", id);
        return ResponseEntity.noContent().build();
    }
    
    private int validatePageSize(int size) {
        if (size <= 0) {
            return TAMANHO_PADRAO_PAGINA;
        }
        return Math.min(size, TAMANHO_MAXIMO_PAGINA);
    }
    
    private String validateSortField(String sort) {
        if (sort == null || sort.trim().isEmpty()) {
            return CAMPO_ORDENACAO_PADRAO;
        }
        
        String campoLimpo = sort.trim().replaceAll("[^a-zA-Z]", "");
        
        if (CAMPOS_ORDENACAO_PERMITIDOS.contains(campoLimpo)) {
            return campoLimpo;
        }
        
        log.warn("Campo de ordenação não permitido: {}, usando padrão: {}", sort, CAMPO_ORDENACAO_PADRAO);
        return CAMPO_ORDENACAO_PADRAO;
    }
    
    private Sort.Direction validateSortDirection(String direction) {
        if (direction == null) {
            return Sort.Direction.DESC;
        }
        
        try {
            return Sort.Direction.fromString(direction.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Direção de ordenação inválida: {}, usando DESC", direction);
            return Sort.Direction.DESC;
        }
    }
}