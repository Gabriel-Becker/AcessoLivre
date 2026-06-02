package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockMultipartFile;

import com.acessolivre.config.StorageProperties;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@SuppressWarnings("null")
class StorageServiceTest {

    @Mock
    private StorageProperties storageProperties;

    @Mock
    private ImageOptimizerService imageOptimizerService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private LocalRepository localRepository;

    @InjectMocks
    private StorageService storageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setup() {
        when(storageProperties.getUploadDir()).thenReturn(tempDir.toString());
        when(storageProperties.getStaticPrefix()).thenReturn("/uploads");
        when(storageProperties.getMaxFileSize()).thenReturn(5 * 1024 * 1024L);
        when(storageProperties.getBaseUrl()).thenReturn("http://localhost:8080");
    }

    @Test
    void salvarImagem_DeveSalvarArquivoEOtimizar() throws IOException {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("João da Silva").build();
        Local local = Local.builder().idLocal(2L).nome("Praça São José").usuario(usuario).build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(localRepository.findById(2L)).thenReturn(Optional.of(local));

        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "foto.png", "image/png", "conteudo".getBytes());
        when(imageOptimizerService.otimizarImagem(any())).thenReturn("otimizado".getBytes());

        String caminho = storageService.salvarImagem(arquivo, 2L, 1L);

        assertNotNull(caminho);
        assertTrue(caminho.startsWith("/uploads/usuarios/1_joao_da_silva/locais/2_praca_sao_jose/"));
    }

    @Test
    void salvarImagem_DeveUsarOriginalQuandoOtimizacaoFalha() throws IOException {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("Maria").build();
        Local local = Local.builder().idLocal(2L).nome("Museu").usuario(usuario).build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(localRepository.findById(2L)).thenReturn(Optional.of(local));

        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "foto.jpg", "image/jpeg", "original".getBytes());
        when(imageOptimizerService.otimizarImagem(any())).thenThrow(new RuntimeException("erro"));

        String caminho = storageService.salvarImagem(arquivo, 2L, 1L);

        assertTrue(caminho.contains("/uploads/usuarios/1_maria/locais/2_museu/"));
    }

    @Test
    void salvarImagem_DeveLancarQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "foto.jpg", "image/jpeg", "abc".getBytes());

        assertThrows(IllegalArgumentException.class, () -> storageService.salvarImagem(arquivo, 2L, 1L));
    }

    @Test
    void salvarImagem_DeveLancarQuandoArquivoVazio() {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("Maria").build();
        Local local = Local.builder().idLocal(2L).nome("Museu").usuario(usuario).build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(localRepository.findById(2L)).thenReturn(Optional.of(local));

        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "foto.jpg", "image/jpeg", new byte[0]);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> storageService.salvarImagem(arquivo, 2L, 1L));
        assertTrue(ex.getMessage().contains("Arquivo vazio"));
    }

    @Test
    void salvarImagem_DeveLancarQuandoTipoNaoForImagem() {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("Maria").build();
        Local local = Local.builder().idLocal(2L).nome("Museu").usuario(usuario).build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(localRepository.findById(2L)).thenReturn(Optional.of(local));

        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "doc.txt", "text/plain", "abc".getBytes());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> storageService.salvarImagem(arquivo, 2L, 1L));
        assertTrue(ex.getMessage().contains("Formato não suportado"));
    }

    @Test
    void deletarImagem_DeveRetornarTrueQuandoArquivoExiste() throws IOException {
        Path pasta = tempDir.resolve("usuarios");
        Files.createDirectories(pasta);
        Path arquivo = pasta.resolve("x.jpg");
        Files.write(arquivo, "a".getBytes());

        boolean removido = storageService.deletarImagem("/uploads/usuarios/x.jpg");

        assertTrue(removido);
    }

    @Test
    void deletarImagem_DeveRetornarFalseQuandoArquivoNaoExiste() {
        boolean removido = storageService.deletarImagem("/uploads/nao-existe.jpg");

        assertFalse(removido);
    }

    @Test
    void deletarImagensDoLocal_DeveDeletarDiretorioRecursivamente() throws IOException {
        Usuario usuario = Usuario.builder().idUsuario(1L).nome("João").build();
        Local local = Local.builder().idLocal(2L).nome("Praça").build();

        Path diretorio = tempDir.resolve("usuarios/1_joao/locais/2_praca");
        Files.createDirectories(diretorio);
        Files.write(diretorio.resolve("a.jpg"), "conteudo".getBytes());

        boolean deletado = storageService.deletarImagensDoLocal(local, usuario);

        assertTrue(deletado);
        assertFalse(Files.exists(diretorio));
    }

    @Test
    void construirUrlCompleta_DeveMontarUrlCorretamente() {
        assertEquals("http://localhost:8080/uploads/a.jpg", storageService.construirUrlCompleta("/uploads/a.jpg"));
        assertEquals("http://externo/img.jpg", storageService.construirUrlCompleta("http://externo/img.jpg"));
        assertEquals(null, storageService.construirUrlCompleta(null));
    }
}
