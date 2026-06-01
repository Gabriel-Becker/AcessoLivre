package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class UsuarioAutenticarServiceTest {

    @Mock
    private UsuarioAutenticarRepository usuarioAutenticarRepository;

    @InjectMocks
    private UsuarioAutenticarService usuarioAutenticarService;

    @Test
    void listarTodos_DeveRetornarRegistros() {
        when(usuarioAutenticarRepository.findAll()).thenReturn(List.of(criarRegistro(1L, 1L)));

        List<UsuarioAutenticar> resultado = usuarioAutenticarService.listarTodos();

        assertEquals(1, resultado.size());
    }

    @Test
    void buscarPorId_DeveRetornarOptionalComRegistro() {
        when(usuarioAutenticarRepository.findById(10L)).thenReturn(Optional.of(criarRegistro(10L, 5L)));

        Optional<UsuarioAutenticar> resultado = usuarioAutenticarService.buscarPorId(10L);

        assertTrue(resultado.isPresent());
        assertEquals(10L, resultado.get().getIdUsuarioAutenticar());
    }

    @Test
    void salvar_DevePersistirRegistro() {
        UsuarioAutenticar registro = criarRegistro(null, 3L);
        UsuarioAutenticar salvo = criarRegistro(30L, 3L);

        when(usuarioAutenticarRepository.save(registro)).thenReturn(salvo);

        UsuarioAutenticar resultado = usuarioAutenticarService.salvar(registro);

        assertEquals(30L, resultado.getIdUsuarioAutenticar());
    }

    @Test
    void deletar_DeveRetornarFalseQuandoNaoEncontrado() {
        when(usuarioAutenticarRepository.existsById(99L)).thenReturn(false);

        boolean resultado = usuarioAutenticarService.deletar(99L);

        assertFalse(resultado);
        verify(usuarioAutenticarRepository, never()).deleteById(99L);
    }

    @Test
    void deletar_DeveRetornarTrueQuandoDeletado() {
        when(usuarioAutenticarRepository.existsById(9L)).thenReturn(true);

        boolean resultado = usuarioAutenticarService.deletar(9L);

        assertTrue(resultado);
        verify(usuarioAutenticarRepository).deleteById(9L);
    }

    private UsuarioAutenticar criarRegistro(Long idRegistro, Long idUsuario) {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(idUsuario);

        UsuarioAutenticar registro = new UsuarioAutenticar();
        registro.setIdUsuarioAutenticar(idRegistro);
        registro.setUsuario(usuario);
        registro.setSenhaHash("Senha@123");
        registro.setDataExpiracao(LocalDateTime.now().plusMonths(3));
        return registro;
    }
}
