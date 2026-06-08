package com.acessolivre.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.acessolivre.dto.request.ForgotPasswordRequestDTO;
import com.acessolivre.dto.request.ResetPasswordRequestDTO;
import com.acessolivre.service.PasswordResetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequestDTO dto) {
        String message = passwordResetService.gerarCodigoRecuperacaoComValidacao(dto.getEmail());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody @Valid ResetPasswordRequestDTO dto) {
        String message = passwordResetService.redefinirSenhaComValidacao(dto.getEmail(), dto.getCode(), dto.getNovaSenha());
        return ResponseEntity.ok(message);
    }
}