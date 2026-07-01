package com.acessolivre.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.acessolivre.dto.request.EsqueciSenhaRequestDTO;
import com.acessolivre.dto.request.RedefinirSenhaRequestDTO;
import com.acessolivre.service.RecuperacaoSenhaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class RecuperacaoSenhaController {

    private final RecuperacaoSenhaService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody @Valid EsqueciSenhaRequestDTO dto) {
        String message = passwordResetService.gerarCodigoRecuperacaoComValidacao(dto.getEmail());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody @Valid RedefinirSenhaRequestDTO dto) {
        String message = passwordResetService.redefinirSenhaComValidacao(dto.getEmail(), dto.getCode(), dto.getNovaSenha());
        return ResponseEntity.ok(message);
    }
}