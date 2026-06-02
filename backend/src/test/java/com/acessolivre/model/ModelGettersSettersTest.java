package com.acessolivre.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ModelGettersSettersTest {

    @Test
    void testUsuario() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNome("Teste");
        assertEquals(1L, usuario.getId());
        assertEquals("Teste", usuario.getNome());
    }

    @Test
    void testLocal() {
        Local local = new Local();
        local.setId(1L);
        local.setNome("Local Teste");
        assertEquals(1L, local.getId());
        assertEquals("Local Teste", local.getNome());
    }

    @Test
    void testAvaliacao() {
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setId(1L);
        avaliacao.setNota(5);
        assertEquals(1L, avaliacao.getId());
        assertEquals(5, avaliacao.getNota());
    }

    @Test
    void testEndereco() {
        Endereco endereco = new Endereco();
        endereco.setId(1L);
        endereco.setCep("12345-678");
        assertEquals(1L, endereco.getId());
        assertEquals("12345-678", endereco.getCep());
    }

    @Test
    void testImagem() {
        Imagem imagem = new Imagem();
        imagem.setId(1L);
        imagem.setCaminho("caminho/imagem.jpg");
        assertEquals(1L, imagem.getId());
        assertEquals("caminho/imagem.jpg", imagem.getCaminho());
    }

    @Test
    void testTokenRevogado() {
        TokenRevogado token = new TokenRevogado();
        token.setId(1L);
        token.setToken("token-revogado");
        assertEquals(1L, token.getId());
        assertEquals("token-revogado", token.getToken());
    }

    @Test
    void testPasswordResetCode() {
        PasswordResetCode code = new PasswordResetCode();
        code.setId(1L);
        code.setCode("123456");
        assertEquals(1L, code.getId());
        assertEquals("123456", code.getCode());
    }

    @Test
    void testTwoFactorRecoveryCode() {
        TwoFactorRecoveryCode code = new TwoFactorRecoveryCode();
        code.setId(1L);
        code.setCode("abcdef");
        assertEquals(1L, code.getId());
        assertEquals("abcdef", code.getCode());
    }
    
    @Test
    void testUsuarioAutenticar() {
        UsuarioAutenticar autenticar = new UsuarioAutenticar();
        autenticar.setId(1L);
        autenticar.setIp("127.0.0.1");
        assertEquals(1L, autenticar.getId());
        assertEquals("127.0.0.1", autenticar.getIp());
    }
}
