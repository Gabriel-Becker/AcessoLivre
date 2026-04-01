package com.acessolivre.controller;

import com.acessolivre.dto.request.EnderecoRequestDTO;
import com.acessolivre.dto.response.EnderecoResponseDTO;
import com.acessolivre.mapper.EnderecoMapper;
import com.acessolivre.model.Endereco;
import com.acessolivre.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
@Slf4j
public class EnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    public ResponseEntity<Page<EnderecoResponseDTO>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(enderecoService.listarTodos(pageable).map(EnderecoMapper::toResponse));
    }

    @PostMapping
    public ResponseEntity<EnderecoResponseDTO> salvar(@Valid @RequestBody EnderecoRequestDTO requestDTO) {
        Endereco endereco = EnderecoMapper.toEntity(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(EnderecoMapper.toResponse(enderecoService.salvar(endereco)));
    }

   
}