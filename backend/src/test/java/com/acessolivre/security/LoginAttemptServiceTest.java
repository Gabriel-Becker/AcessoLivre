package com.acessolivre.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginAttemptServiceTest {

    @InjectMocks
    private ServicoTentativasLogin loginAttemptService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void loginFalhou_deveBloquearAposMaximoTentativas() {
        String key = "user1";
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        assertFalse(loginAttemptService.estaBloqueado(key));
        loginAttemptService.loginFalhou(key);
        assertTrue(loginAttemptService.estaBloqueado(key));
    }

    @Test
    void loginSucesso_deveLimparTentativas() {
        String key = "user2";
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginSucesso(key);
        assertFalse(loginAttemptService.estaBloqueado(key));
    }

    @Test
    void estaBloqueado_deveRetornarFalseParaUsuarioNaoBloqueado() {
        String key = "user3";
        assertFalse(loginAttemptService.estaBloqueado(key));
    }

    @Test
    void estaBloqueado_deveRetornarTrueParaUsuarioBloqueado() {
        String key = "user4";
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        loginAttemptService.loginFalhou(key);
        assertTrue(loginAttemptService.estaBloqueado(key));
    }

    private void loginAttemptCanceled(String key) {
    }
}
