package com.acessolivre.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginAttemptServiceTest {

    @InjectMocks
    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Forçar a inicialização do cache
        loginAttemptService.loginFailed("test");
        loginAttemptService.loginSucceeded("test");
        ReflectionTestUtils.setField(loginAttemptService, "maxAttempts", 3);
    }

    @Test
    void loginFailed_deveIncrementarTentativas() {
        String key = "user1";
        loginAttemptService.loginFailed(key);
        loginAttemptService.loginFailed(key);
        assertFalse(loginAttemptService.isBlocked(key));
        loginAttemptService.loginFailed(key);
        assertTrue(loginAttemptService.isBlocked(key));
    }

    @Test
    void loginSucceeded_deveLimparTentativas() {
        String key = "user2";
        loginAttemptService.loginFailed(key);
        loginAttemptService.loginFailed(key);
        loginAttemptService.loginSucceeded(key);
        assertFalse(loginAttemptService.isBlocked(key));
    }

    @Test
    void isBlocked_deveRetornarFalseParaUsuarioNaoBloqueado() {
        String key = "user3";
        assertFalse(loginAttemptService.isBlocked(key));
    }

    @Test
    void isBlocked_deveRetornarTrueParaUsuarioBloqueado() {
        String key = "user4";
        loginAttemptService.loginFailed(key);
        loginAttemptCanceled(key);
        loginAttemptService.loginFailed(key);
        assertTrue(loginAttemptService.isBlocked(key));
    }

    private void loginAttemptCanceled(String key) {
    }
}
