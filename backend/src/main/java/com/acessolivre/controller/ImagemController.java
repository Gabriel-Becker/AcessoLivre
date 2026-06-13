package com.acessolivre.controller;

import com.acessolivre.dto.request.ImagemUploadDTO;
import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.mapper.ImagemMapper;
import com.acessolivre.model.Imagem;
import com.acessolivre.service.ImagemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        return ResponseEntity.ok(imagens.stream()
                .map(ImagemMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImagemResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("GET /api/imagens/{}", id);
        return imagemService.buscarPorId(id)
                .map(ImagemMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/local/{idLocal}")
    public ResponseEntity<List<ImagemResponseDTO>> buscarPorLocal(@PathVariable Long idLocal) {
        log.info("GET /api/imagens/local/{}", idLocal);
        List<Imagem> imagens = imagemService.buscarPorLocal(idLocal);
        return ResponseEntity.ok(imagens.stream()
                .map(ImagemMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> salvar(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("idLocal") Long idLocal,
            @RequestParam(value = "ordem", defaultValue = "0") Integer ordem) {
        
        log.info(" POST /api/imagens - Salvando imagem para local {}, ordem {}", idLocal, ordem);
        log.info("   Arquivo: nome={}, tamanho={}, tipo={}", 
            arquivo.getOriginalFilename(), arquivo.getSize(), arquivo.getContentType());
        
        try {
            ImagemUploadDTO uploadDTO = ImagemUploadDTO.builder()
                    .arquivo(arquivo)
                    .idLocal(idLocal)
                    .ordem(ordem)
                    .build();
            
            Imagem imagem = imagemService.salvar(uploadDTO);
            log.info(" Imagem salva com sucesso. ID: {}", imagem.getIdImagem());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ImagemMapper.toResponse(imagem));
                    
        } catch (IllegalArgumentException e) {
            log.warn(" Erro de validação: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(errorResponse);
        } catch (Exception e) {
            log.error(" Erro ao salvar imagem", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro interno ao processar imagem: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
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