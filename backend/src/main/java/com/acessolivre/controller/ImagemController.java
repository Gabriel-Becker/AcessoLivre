package com.acessolivre.controller;

import com.acessolivre.dto.request.ImagemUploadDTO;
import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.mapper.ImagemMapper;
import com.acessolivre.model.Imagem;
import com.acessolivre.service.ImagemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/imagens")
@RequiredArgsConstructor
@Slf4j
public class ImagemController {

    private final ImagemService imagemService;
    private final ImagemMapper imagemMapper;

    @GetMapping
    public ResponseEntity<List<ImagemResponseDTO>> listarTodos() {
        log.info("GET /api/imagens - Listando todas as imagens");
        List<Imagem> imagens = imagemService.listarTodos();
        return ResponseEntity.ok(imagens.stream()
                .map(imagemMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImagemResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("GET /api/imagens/{}", id);
        return imagemService.buscarPorId(id)
                .map(imagemMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/local/{idLocal}")
    public ResponseEntity<List<ImagemResponseDTO>> buscarPorLocal(@PathVariable Long idLocal) {
        log.info("GET /api/imagens/local/{}", idLocal);
        List<Imagem> imagens = imagemService.buscarPorLocal(idLocal);
        return ResponseEntity.ok(imagens.stream()
                .map(imagemMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> salvar(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("idLocal") Long idLocal,
            @RequestParam(value = "ordem", defaultValue = "0") Integer ordem) {
        
        log.info("POST /api/imagens - Salvando imagem para local {}, ordem {}", idLocal, ordem);
        
        try {
            ImagemUploadDTO uploadDTO = ImagemUploadDTO.builder()
                    .arquivo(arquivo)
                    .idLocal(idLocal)
                    .ordem(ordem)
                    .build();
            
            Imagem imagem = imagemService.salvar(uploadDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(imagemMapper.toResponse(imagem));
                    
        } catch (IllegalArgumentException e) {
            log.warn("Erro de validação: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao salvar imagem", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro interno ao processar imagem"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("DELETE /api/imagens/{}", id);
        
        boolean deletado = imagemService.deletar(id);
        
        if (deletado) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}