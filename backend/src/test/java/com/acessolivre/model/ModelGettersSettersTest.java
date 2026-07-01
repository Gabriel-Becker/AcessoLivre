package com.acessolivre.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ModelGettersSettersTest {

    @Test
    void testUsuario() {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(1L);
        usuario.setNome("Teste");
        assertEquals(1L, usuario.getIdUsuario());
        assertEquals("Teste", usuario.getNome());
    }

    @Test
    void testLocal() {
        Local local = new Local();
        local.setIdLocal(1L);
        local.setNome("Local Teste");
        assertEquals(1L, local.getIdLocal());
        assertEquals("Local Teste", local.getNome());
    }

    @Test
    void testAvaliacao() {
        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setIdAvaliacao(1L);
        avaliacao.setNotaAcessibilidadeVisual(5);
        assertEquals(1L, avaliacao.getIdAvaliacao());
        assertEquals(5, avaliacao.getNotaAcessibilidadeVisual());
    }

    @Test
    void testEndereco() {
        Endereco endereco = new Endereco();
        endereco.setIdEndereco(1L);
        endereco.setCep("12345678");
        assertEquals(1L, endereco.getIdEndereco());
        assertEquals("12345678", endereco.getCep());
    }

    @Test
    void testImagem() {
        Imagem imagem = new Imagem();
        imagem.setIdImagem(1L);
        imagem.setCaminhoRelativo("caminho/imagem.jpg");
        assertEquals(1L, imagem.getIdImagem());
        assertEquals("caminho/imagem.jpg", imagem.getCaminhoRelativo());
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
        CodigoRecuperacaoSenha code = new CodigoRecuperacaoSenha();
        code.setId(1L);
        code.setCode("123456");
        assertEquals(1L, code.getId());
        assertEquals("123456", code.getCode());
    }

    @Test
    void testTwoFactorRecoveryCode() {
        CodigoRecuperacaoDoisFatores code = new CodigoRecuperacaoDoisFatores();
        code.setId(1L);
        code.setCodigo("abcdef");
        assertEquals(1L, code.getId());
        assertEquals("abcdef", code.getCodigo());
    }
    
    @Test
    void testUsuarioAutenticar() {
        UsuarioAutenticar autenticar = new UsuarioAutenticar();
        autenticar.setIdUsuarioAutenticar(1L);
        autenticar.setSenhaHash("hash");
        assertEquals(1L, autenticar.getIdUsuarioAutenticar());
        assertEquals("hash", autenticar.getSenhaHash());
    }
}
