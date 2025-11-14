package com.acessolivre.controller;

import com.acessolivre.dto.request.ImagemRequestDTO;
import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.mapper.ImagemMapper;
import com.acessolivre.model.Imagem;
import com.acessolivre.service.ImagemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller responsável pelos endpoints de Imagem
 */
@RestController
@RequestMapping("/api/imagens")
@RequiredArgsConstructor
@Slf4j
public class ImagemController {

    private final ImagemService imagemService;

    /**
     * Lista todas as imagens
     * @return ResponseEntity com lista de imagens
     */
    @GetMapping
    public ResponseEntity<List<ImagemResponseDTO>> listarTodos() {
        log.info("Endpoint GET /api/imagens - Listando todas as imagens");
        try {
            List<Imagem> imagens = imagemService.listarTodos();
            List<ImagemResponseDTO> responseDTOs = imagens.stream()
                    .map(ImagemMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar imagens", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca uma imagem pelo ID
     * @param id ID da imagem
     * @return ResponseEntity com imagem se encontrada ou 404 se não encontrada
     */
    @GetMapping("/{id}")
    public ResponseEntity<ImagemResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("Endpoint GET /api/imagens/{} - Buscando imagem por ID", id);
        try {
            Optional<Imagem> imagem = imagemService.buscarPorId(id);
            return imagem.map(i -> ResponseEntity.ok(ImagemMapper.toResponse(i)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Erro ao buscar imagem por ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca imagens por local
     * @param idLocal ID do local
     * @return ResponseEntity com lista de imagens do local
     */
    @GetMapping("/local/{idLocal}")
    public ResponseEntity<List<ImagemResponseDTO>> buscarPorLocal(@PathVariable Long idLocal) {
        log.info("Endpoint GET /api/imagens/local/{} - Buscando imagens por local", idLocal);
        try {
            List<Imagem> imagens = imagemService.buscarPorLocal(idLocal);
            List<ImagemResponseDTO> responseDTOs = imagens.stream()
                    .map(ImagemMapper::toResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao buscar imagens por local ID: {}", idLocal, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva uma nova imagem
     * @param requestDTO Dados da imagem a ser salva
     * @return ResponseEntity com imagem salva
     */
    @PostMapping
    public ResponseEntity<?> salvar(@Valid @RequestBody ImagemRequestDTO requestDTO) {
        log.info("Endpoint POST /api/imagens - Salvando nova imagem");
        try {
            Imagem imagem = imagemService.salvar(requestDTO);
            log.info("Imagem salva com sucesso. ID: {}", imagem.getIdImagem());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ImagemMapper.toResponse(imagem));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao salvar imagem: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao salvar imagem", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar imagem");
        }
    }

    /**
     * Atualiza uma imagem existente
     * @param id ID da imagem a ser atualizada
     * @param requestDTO Dados atualizados da imagem
     * @return ResponseEntity com imagem atualizada ou 404 se não encontrada
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @Valid @RequestBody ImagemRequestDTO requestDTO) {
        log.info("Endpoint PUT /api/imagens/{} - Atualizando imagem", id);
        try {
            Optional<Imagem> imagemAtualizada = imagemService.atualizar(id, requestDTO);
            
            if (imagemAtualizada.isPresent()) {
                log.info("Imagem atualizada com sucesso. ID: {}", id);
                return ResponseEntity.ok(ImagemMapper.toResponse(imagemAtualizada.get()));
            } else {
                log.warn("Imagem não encontrada para atualização. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação ao atualizar imagem: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao atualizar imagem ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao atualizar imagem");
        }
    }

    /**
     * Deleta uma imagem pelo ID
     * @param id ID da imagem a ser deletada
     * @return ResponseEntity com status 204 se deletada ou 404 se não encontrada
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("Endpoint DELETE /api/imagens/{} - Deletando imagem", id);
        try {
            boolean deletado = imagemService.deletar(id);
            
            if (deletado) {
                log.info("Imagem deletada com sucesso. ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("Imagem não encontrada para deletar. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao deletar imagem ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
