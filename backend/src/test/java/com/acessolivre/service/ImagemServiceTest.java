package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.acessolivre.dto.request.ImagemUploadDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import com.acessolivre.repository.ImagemRepository;
import com.acessolivre.repository.LocalRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ImagemServiceTest {

    @Mock
    private ImagemRepository imagemRepository;

    @Mock
    private ArmazenamentoService storageService;

    @Mock
    private LocalRepository localRepository;

    @InjectMocks
    private ImagemService imagemService;

    @Test
    void listarTodos_DeveRetornarLista() {
        when(imagemRepository.findAll()).thenReturn(List.of(Imagem.builder().idImagem(1L).build()));

        List<Imagem> imagens = imagemService.listarTodos();

        assertEquals(1, imagens.size());
    }

    @Test
    void buscarPorId_DeveDelegarRepositorio() {
        when(imagemRepository.findById(1L)).thenReturn(Optional.of(Imagem.builder().idImagem(1L).build()));

        Optional<Imagem> imagem = imagemService.buscarPorId(1L);

        assertTrue(imagem.isPresent());
    }

    @Test
    void salvar_DeveLancarQuandoLocalNaoExiste() {
        ImagemUploadDTO dto = criarUploadDTO(10L);
        when(localRepository.findById(10L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> imagemService.salvar(dto));

        assertTrue(ex.getMessage().contains("Local não encontrado"));
    }

    @Test
    void salvar_DeveSalvarImagemQuandoSucesso() throws Exception {
        ImagemUploadDTO dto = criarUploadDTO(10L);
        Local local = Local.builder().idLocal(10L).build();

        when(localRepository.findById(10L)).thenReturn(Optional.of(local));
        when(storageService.salvarImagem(any(), any(), any(String.class))).thenReturn("/uploads/locais/img.jpg");
        when(imagemRepository.save(any(Imagem.class))).thenAnswer(inv -> {
            Imagem imagem = inv.getArgument(0);
            imagem.setIdImagem(99L);
            return imagem;
        });

        Imagem salva = imagemService.salvar(dto);

        assertNotNull(salva);
        assertEquals(99L, salva.getIdImagem());
        assertEquals("/uploads/locais/img.jpg", salva.getCaminhoRelativo());
    }

    @Test
    void salvar_DeveLancarRuntimeQuandoStorageFalhar() throws Exception {
        ImagemUploadDTO dto = criarUploadDTO(10L);
        Local local = Local.builder().idLocal(10L).build();

        when(localRepository.findById(10L)).thenReturn(Optional.of(local));
        when(storageService.salvarImagem(any(), any(), any(String.class))).thenThrow(new RuntimeException("falha disco"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> imagemService.salvar(dto));

        assertTrue(ex.getMessage().contains("Erro ao processar imagem"));
    }

    @Test
    void deletar_DeveRetornarFalseQuandoImagemNaoExiste() {
        when(imagemRepository.findById(7L)).thenReturn(Optional.empty());

        boolean deletou = imagemService.deletar(7L);

        assertFalse(deletou);
    }

    @Test
    void deletar_DeveRemoverDoBancoMesmoQuandoArquivoNaoExiste() {
        Imagem imagem = Imagem.builder().idImagem(8L).caminhoRelativo("/uploads/x.jpg").build();
        when(imagemRepository.findById(8L)).thenReturn(Optional.of(imagem));
        when(storageService.deletarImagem("/uploads/x.jpg")).thenReturn(false);

        boolean deletou = imagemService.deletar(8L);

        assertTrue(deletou);
        verify(imagemRepository).deleteById(8L);
    }

    @Test
    void deletarImagensPorLocal_DeveDeletarArquivosERegistros() {
        List<Imagem> imagens = List.of(
            Imagem.builder().idImagem(1L).idLocal(10L).caminhoRelativo("/uploads/a.jpg").build(),
            Imagem.builder().idImagem(2L).idLocal(10L).caminhoRelativo("/uploads/b.jpg").build());

        when(imagemRepository.findByIdLocalOrderByIdImagemDesc(10L)).thenReturn(imagens);

        imagemService.deletarImagensPorLocal(10L);

        verify(storageService).deletarImagem("/uploads/a.jpg");
        verify(storageService).deletarImagem("/uploads/b.jpg");
        verify(imagemRepository).deleteAll(imagens);
    }

    private ImagemUploadDTO criarUploadDTO(Long idLocal) {
        MockMultipartFile arquivo = new MockMultipartFile(
            "arquivo",
            "foto.jpg",
            "image/jpeg",
            "conteudo".getBytes());

        return ImagemUploadDTO.builder()
            .idLocal(idLocal)
            .arquivo(arquivo)
            .ordem(1)
            .build();
    }
}
