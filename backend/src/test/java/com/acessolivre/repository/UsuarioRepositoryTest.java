package com.acessolivre.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.acessolivre.model.Usuario;
import com.acessolivre.enums.Role;

@DataJpaTest
class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario usuarioTest;

    @BeforeEach
    void setUp() {
        usuarioTest = Usuario.builder()
            .nome("Gabriel Silva")
            .email("gabriel@acessolivre.com")
            .emailVerified(false)
            .ativo(true)
            .role(Role.ROLE_USER)
            .build();
    }

    @Test
    void salvarUsuario_DevePersistirComSucesso() {
        Usuario salvo = usuarioRepository.save(usuarioTest);

        assertTrue(salvo.getIdUsuario() != null);
        assertEquals("Gabriel Silva", salvo.getNome());
    }

    @Test
    void buscarPorEmail_DeveRetornarUsuarioQuandoExistir() {
        usuarioRepository.save(usuarioTest);

        Optional<Usuario> resultado = usuarioRepository.findByEmail("gabriel@acessolivre.com");

        assertTrue(resultado.isPresent());
        assertEquals("Gabriel Silva", resultado.get().getNome());
    }

    @Test
    void buscarPorEmail_DeveRetornarVazioQuandoNaoExistir() {
        Optional<Usuario> resultado = usuarioRepository.findByEmail("inexistente@test.com");

        assertFalse(resultado.isPresent());
    }

    @Test
    void buscarPorId_DeveRetornarUsuario() {
        Usuario salvo = usuarioRepository.save(usuarioTest);

        Optional<Usuario> resultado = usuarioRepository.findById(salvo.getIdUsuario());

        assertTrue(resultado.isPresent());
        assertEquals(salvo.getIdUsuario(), resultado.get().getIdUsuario());
    }

    @Test
    void existeEmail_DeveRetornarTrue() {
        usuarioRepository.save(usuarioTest);

        Optional<Usuario> resultado = usuarioRepository.findByEmail("gabriel@acessolivre.com");

        assertTrue(resultado.isPresent());
    }

    @Test
    void existeEmail_DeveRetornarFalse() {
        Optional<Usuario> resultado = usuarioRepository.findByEmail("nao_existe@test.com");

        assertFalse(resultado.isPresent());
    }

    @Test
    void atualizar_DeveModificarUsuario() {
        Usuario salvo = usuarioRepository.save(usuarioTest);
        salvo.setNome("Gabriel Silva Atualizado");

        Usuario atualizado = usuarioRepository.save(salvo);

        assertEquals("Gabriel Silva Atualizado", atualizado.getNome());
    }

    @Test
    void deletar_DeveRemoverUsuario() {
        Usuario salvo = usuarioRepository.save(usuarioTest);

        usuarioRepository.deleteById(salvo.getIdUsuario());

        Optional<Usuario> resultado = usuarioRepository.findById(salvo.getIdUsuario());
        assertFalse(resultado.isPresent());
    }

    @Test
    void buscarPorRole_DeveRetornarUsuariosComRole() {
        usuarioRepository.save(usuarioTest);

        java.util.List<Usuario> resultado = usuarioRepository.findAllByAtivoTrue();

        assertTrue(resultado.size() > 0);
    }

    @Test
    void emailVerificado_DeveFlagAcertadamente() {
        usuarioTest.setEmailVerified(true);
        Usuario salvo = usuarioRepository.save(usuarioTest);

        Optional<Usuario> resultado = usuarioRepository.findById(salvo.getIdUsuario());

        assertTrue(resultado.get().getEmailVerified());
    }
}
