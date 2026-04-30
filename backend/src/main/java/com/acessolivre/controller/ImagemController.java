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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/imagens")
@RequiredArgsConstructor
@Slf4j
public class ImagemController {

    private final ImagemService imagemService;

    @GetMapping
    public ResponseEntity<List<ImagemResponseDTO>> listarTodos() {
        log.info("GET /api/imagens - Listando todas as imagens");
        List<Imagem> imagens = imagemService.listarTodos();
        List<ImagemResponseDTO> response = imagens.stream()
                .map(ImagemMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImagemResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("GET /api/imagens/{} - Buscando imagem", id);
        return imagemService.buscarPorId(id)
                .map(ImagemMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Endpoint para buscar imagem COMPLETA (sem truncamento)
    @GetMapping("/{id}/completa")
    public ResponseEntity<String> buscarImagemCompleta(@PathVariable Long id) {
        log.info("GET /api/imagens/{}/completa - Buscando imagem completa", id);
        return imagemService.buscarPorId(id)
                .map(Imagem::getImagemBase64)  // ✅ Pega diretamente do objeto
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/local/{idLocal}")
    public ResponseEntity<List<ImagemResponseDTO>> buscarPorLocal(@PathVariable Long idLocal) {
        log.info("GET /api/imagens/local/{} - Buscando imagens por local", idLocal);
        List<Imagem> imagens = imagemService.buscarPorLocal(idLocal);
        List<ImagemResponseDTO> response = imagens.stream()
                .map(ImagemMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> salvar(@Valid @RequestBody ImagemRequestDTO requestDTO) {
        log.info("POST /api/imagens - Salvando imagem para local: {}", requestDTO.getIdLocal());
        try {
            Imagem imagem = imagemService.salvar(requestDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ImagemMapper.toResponse(imagem));
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao salvar imagem", e);
            return ResponseEntity.internalServerError().body("Erro ao salvar imagem");
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<?> salvarBatch(
            @RequestParam Long idLocal,
            @Valid @RequestBody List<ImagemRequestDTO> requestDTOs) {
        
        log.info("POST /api/imagens/batch - Salvando {} imagens para local: {}", requestDTOs.size(), idLocal);
        
        if (requestDTOs == null || requestDTOs.isEmpty()) {
            return ResponseEntity.badRequest().body("Lista de imagens não pode ser vazia");
        }
        
        if (requestDTOs.size() > 10) {
            return ResponseEntity.badRequest().body("Máximo de 10 imagens por requisição");
        }
        
        try {
            for (ImagemRequestDTO dto : requestDTOs) {
                dto.setIdLocal(idLocal);
            }
            
            List<Imagem> imagens = imagemService.salvarBatch(idLocal, requestDTOs);
            List<ImagemResponseDTO> response = imagens.stream()
                    .map(ImagemMapper::toResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao salvar imagens em batch", e);
            return ResponseEntity.internalServerError().body("Erro ao salvar imagens");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @Valid @RequestBody ImagemRequestDTO requestDTO) {
        log.info("PUT /api/imagens/{} - Atualizando imagem", id);
        try {
            return imagemService.atualizar(id, requestDTO)
                    .map(ImagemMapper::toResponse)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro ao atualizar imagem", e);
            return ResponseEntity.internalServerError().body("Erro ao atualizar imagem");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("DELETE /api/imagens/{} - Deletando imagem", id);
        boolean deletado = imagemService.deletar(id);
        return deletado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/local/{idLocal}")
    public ResponseEntity<Void> deletarImagensDoLocal(@PathVariable Long idLocal) {
        log.info("DELETE /api/imagens/local/{} - Deletando todas as imagens do local", idLocal);
        imagemService.deletarImagensDoLocal(idLocal);
        return ResponseEntity.noContent().build();
    }
}