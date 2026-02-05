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
                Page<LocalResponseDTO> responseDTOs = locais.map(LocalMapper::toResponse);
                return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar locais", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Retorna estatísticas gerais do sistema (requer autenticação)
     * @return ResponseEntity com totais de usuários, locais e avaliações
     */
    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Long>> obterEstatisticasGerais() {
        log.info("Endpoint GET /api/locais/estatisticas - Obtendo estatísticas gerais");
        try {
            return ResponseEntity.ok(localService.obterEstatisticasGerais());
        } catch (Exception e) {
            log.error("Erro ao obter estatísticas gerais", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um local pelo ID
     * @param id ID do local
     * @return ResponseEntity com local se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<LocalResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("Endpoint GET /api/locais/{} - Buscando local por ID", id);
        try {
            Optional<Local> local = localService.buscarPorId(id);
            return local.map(l -> ResponseEntity.ok(LocalMapper.toResponse(l)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar local por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca locais por usuário
     * @param idUsuario ID do usuário
     * @return ResponseEntity com lista de locais do usuário
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorUsuario(@PathVariable Long idUsuario) {
        log.info("Endpoint GET /api/locais/usuario/{} - Buscando locais por usuário", idUsuario);
        try {
            List<Local> locais = localService.buscarPorUsuario(idUsuario);
            List<LocalResponseDTO> responseDTOs = locais.stream()
                    .map(LocalMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar locais por usuário ID: {}", idUsuario, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca locais por categoria
     * @param idCategoria ID da categoria
     * @return ResponseEntity com lista de locais da categoria
     */
    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorCategoria(@PathVariable Long idCategoria) {
        log.info("Endpoint GET /api/locais/categoria/{} - Buscando locais por categoria", idCategoria);
        try {
            List<Local> locais = localService.buscarPorCategoria(idCategoria);
            List<LocalResponseDTO> responseDTOs = locais.stream()
                    .map(LocalMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar locais por categoria ID: {}", idCategoria, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca locais por tipo de acessibilidade
     * @param idTipoAcessibilidade ID do tipo de acessibilidade
     * @return ResponseEntity com lista de locais do tipo de acessibilidade
     */
    @GetMapping("/tipo-acessibilidade/{idTipoAcessibilidade}")
    public ResponseEntity<List<LocalResponseDTO>> buscarPorTipoAcessibilidade(@PathVariable Long idTipoAcessibilidade) {
        log.info("Endpoint GET /api/locais/tipo-acessibilidade/{} - Buscando locais por tipo de acessibilidade", idTipoAcessibilidade);
        try {
            List<Local> locais = localService.buscarPorTipoAcessibilidade(idTipoAcessibilidade);
            List<LocalResponseDTO> responseDTOs = locais.stream()
                    .map(LocalMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar locais por tipo de acessibilidade ID: {}", idTipoAcessibilidade, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo local
     * @param requestDTO Dados do local a ser salvo
     * @return ResponseEntity com local salvo
     */
    @PostMapping
    public ResponseEntity<?> salvar(@Valid @RequestBody LocalRequestDTO requestDTO) {
        log.info("Endpoint POST /api/locais - Salvando novo local");
        try {
            Local local = localService.salvar(requestDTO);
            log.info("Local salvo com sucesso. ID: {}", local.getIdLocal());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(LocalMapper.toResponse(local));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao salvar local: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao salvar local", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar local");
        }
    }

    /**
     * Atualiza um local existente
     * @param id ID do local a ser atualizado
     * @param requestDTO Dados atualizados do local
     * @return ResponseEntity com local atualizado ou 404 se não encontrado
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @Valid @RequestBody LocalRequestDTO requestDTO) {
        log.info("Endpoint PUT /api/locais/{} - Atualizando local", id);
        try {
            Optional<Local> localAtualizado = localService.atualizar(id, requestDTO);
            
            if (localAtualizado.isPresent()) {
                log.info("Local atualizado com sucesso. ID: {}", id);
                return ResponseEntity.ok(LocalMapper.toResponse(localAtualizado.get()));
            } else {
                log.warn("Local não encontrado para atualização. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao atualizar local: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao atualizar local ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao atualizar local");
        }
    }

    /**
     * Deleta um local pelo ID
     * @param id ID do local a ser deletado
     * @return ResponseEntity com status 204 se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("Endpoint DELETE /api/locais/{} - Deletando local", id);
        try {
            boolean deletado = localService.deletar(id);
            
            if (deletado) {
                log.info("Local deletado com sucesso. ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("Local não encontrado para deletar. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao deletar local ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
