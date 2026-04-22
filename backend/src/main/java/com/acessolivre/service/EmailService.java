package com.acessolivre.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.properties.mail.from:noreply@acessolivre.com.br}")
    private String emailFrom;

    public void sendPasswordResetCode(String email, String nome, String code) {
        try {
            Context context = new Context();
            context.setVariable("nome", nome);
            context.setVariable("codigo", code);
            
            String htmlContent = templateEngine.process("email/codigo-reset-senha", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(emailFrom);
            helper.setTo(email);
            helper.setSubject("Código de Recuperação de Senha - AcessoLivre");
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email de recuperação de senha enviado para: {}", email);
        } catch (MessagingException e) {
            log.error("Erro ao enviar email de recuperação para {}: {}", email, e.getMessage());
            throw new RuntimeException("Erro ao enviar email de recuperação", e);
        }
    }

    public void sendPasswordResetConfirmation(String email, String nome) {
        try {
            Context context = new Context();
            context.setVariable("nome", nome);
            
            String htmlContent = templateEngine.process("email/confirmacao-reset-senha", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(emailFrom);
            helper.setTo(email);
            helper.setSubject("Senha Redefinida com Sucesso - AcessoLivre");
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email de confirmação de reset enviado para: {}", email);
        } catch (MessagingException e) {
            log.error("Erro ao enviar confirmação de reset para {}: {}", email, e.getMessage());
            throw new RuntimeException("Erro ao enviar confirmação de reset", e);
        }
    }
}
