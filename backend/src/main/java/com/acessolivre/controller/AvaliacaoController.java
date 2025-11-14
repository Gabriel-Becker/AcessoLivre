package com.acessolivre.controller;

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.dto.response.AvaliacaoResponseDTO;
import com.acessolivre.mapper.AvaliacaoMapper;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/avaliacoes")
@RequiredArgsConstructor
@Slf4j
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    // Listagem pública: somente moderadas (ou sem comentário)
    @GetMapping
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarPublicas() {
        List<AvaliacaoResponseDTO> dtos = avaliacaoService.listarPublicas()
                .stream()
                .map(AvaliacaoMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return avaliacaoService.buscarPorId(id)
                .map(AvaliacaoMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Listagem pública por local: somente moderadas
    @GetMapping("/local/{idLocal}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarPorLocal(@PathVariable Long idLocal) {
        List<AvaliacaoResponseDTO> dtos = avaliacaoService.buscarPublicasPorLocal(idLocal)
                .stream()
                .map(AvaliacaoMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Listagem por usuário (sem filtro de moderação)
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<AvaliacaoResponseDTO>> listarPorUsuario(@PathVariable Long idUsuario) {
        List<AvaliacaoResponseDTO> dtos = avaliacaoService.buscarPorUsuario(idUsuario)
                .stream()
                .map(AvaliacaoMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO> criar(@Valid @RequestBody AvaliacaoRequestDTO dto) {
        Avaliacao criada = avaliacaoService.salvar(dto);
        AvaliacaoResponseDTO resposta = AvaliacaoMapper.toResponse(criada);
        return ResponseEntity.created(URI.create("/api/avaliacoes/" + resposta.getIdAvaliacao()))
                .body(resposta);
    }

    // OBS: Regra de ownership/Admin será adicionada no Bloco 4 (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        boolean deletada = avaliacaoService.deletar(id);
        return deletada ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
