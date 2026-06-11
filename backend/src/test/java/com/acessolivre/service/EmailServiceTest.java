package com.acessolivre.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Properties;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "emailFrom", "noreply@acessolivre.com.br");
    }

    @Test
    void sendPasswordResetCode_DeveProcessarTemplateEEnviarEmail() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(templateEngine.process(eq("email/codigo-reset-senha"), any(Context.class))).thenReturn("<html>codigo</html>");
        when(mailSender.createMimeMessage()).thenReturn(message);

        emailService.sendPasswordResetCode("usuario@email.com", "Gabriel", "123456");

        verify(mailSender).send(message);
    }

    @Test
    void sendPasswordResetConfirmation_DeveProcessarTemplateEEnviarEmail() {
        MimeMessage message = new MimeMessage(Session.getInstance(new Properties()));
        when(templateEngine.process(eq("email/confirmacao-reset-senha"), any(Context.class))).thenReturn("<html>confirmacao</html>");
        when(mailSender.createMimeMessage()).thenReturn(message);

        emailService.sendPasswordResetConfirmation("usuario@email.com", "Gabriel");

        verify(mailSender).send(message);
    }
}
