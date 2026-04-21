package com.acessolivre.service;

import java.security.SecureRandom;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final SecureRandom RANDOM = new SecureRandom();

    public String gerarCodigoVerificacao() {
        int codigo = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(codigo);
    }

    public void enviarCodigoVerificacao(String email, String codigo) {
        // TODO: Implementar envio real de email
        log.info("==============================================");
        log.info("CÓDIGO DE VERIFICAÇÃO DE EMAIL");
        log.info("Email: {}", email);
        log.info("Código: {}", codigo);
        log.info("==============================================");
        
        // Simula envio bem-sucedido
        // Em produção, aqui seria a integração com AWS SES, SendGrid, etc.
    }

    public void sendPasswordResetCode(String email, String nome, String code) {
        log.info("==============================================");
        log.info("CÓDIGO DE RECUPERAÇÃO DE SENHA");
        log.info("Nome: {}", nome);
        log.info("Email: {}", email);
        log.info("Código: {}", code);
        log.info("==============================================");
    }

    public void sendPasswordResetConfirmation(String email, String nome) {
        log.info("==============================================");
        log.info("CONFIRMAÇÃO DE REDEFINIÇÃO DE SENHA");
        log.info("Nome: {}", nome);
        log.info("Email: {}", email);
        log.info("==============================================");
    }

    public void enviarBoasVindas(String email, String nome) {
        log.info("Email de boas-vindas enviado para {} ({})", nome, email);
    }
}
