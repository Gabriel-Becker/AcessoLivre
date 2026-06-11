package com.acessolivre.service.imp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.acessolivre.dto.request.DenunciaRequestDTO;
import com.acessolivre.dto.response.DenunciaResponseDTO;
import com.acessolivre.dto.response.ResolucaoDenunciaResponseDTO;
import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.exception.DenunciaException;
import com.acessolivre.mapper.DenunciaMapper;
import com.acessolivre.model.Denuncia;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.DenunciaRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.service.ConteudoModeracaoService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class DenunciaServiceImplTest {

    @Mock
    private DenunciaRepository denunciaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private DenunciaMapper denunciaMapper;

    @Mock
    private ConteudoModeracaoService conteudoModeracaoService;

    @InjectMocks
    private DenunciaServiceImpl denunciaService;

    @Test
    void criarDenuncia_DeveLancarQuandoUsuarioJaDenunciou() {
        DenunciaRequestDTO request = criarRequest(TipoDenuncia.LOCAL, 10L);
        when(denunciaRepository.existsByTipoAndTargetIdAndUsuario(TipoDenuncia.LOCAL, 10L, 2L)).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> denunciaService.criarDenuncia(request, 2L));

        assertEquals("Você já denunciou este item", ex.getMessage());
        verify(denunciaRepository, never()).save(any());
    }

    @Test
    void criarDenuncia_DeveLancarQuandoUsuarioNaoExistir() {
        DenunciaRequestDTO request = criarRequest(TipoDenuncia.LOCAL, 10L);
        when(denunciaRepository.existsByTipoAndTargetIdAndUsuario(TipoDenuncia.LOCAL, 10L, 2L)).thenReturn(false);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> denunciaService.criarDenuncia(request, 2L));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void criarDenuncia_DevePersistirQuandoDadosForemValidos() {
        DenunciaRequestDTO request = criarRequest(TipoDenuncia.AVALIACAO, 88L);
        Usuario usuario = Usuario.builder().idUsuario(3L).nome("Usuário").email("u@email.com").build();
        Denuncia entidade = criarDenuncia(1L, TipoDenuncia.AVALIACAO, 88L, StatusDenuncia.PENDING);
        DenunciaResponseDTO dto = DenunciaResponseDTO.builder().id(1L).status(StatusDenuncia.PENDING).build();

        when(denunciaRepository.existsByTipoAndTargetIdAndUsuario(TipoDenuncia.AVALIACAO, 88L, 3L)).thenReturn(false);
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(usuario));
        when(denunciaMapper.toEntity(request, usuario)).thenReturn(entidade);
        when(denunciaRepository.save(entidade)).thenReturn(entidade);
        when(denunciaMapper.toResponseDTO(entidade)).thenReturn(dto);

        DenunciaResponseDTO resultado = denunciaService.criarDenuncia(request, 3L);

        assertSame(dto, resultado);
    }

    @Test
    void buscarPorId_DeveLancarQuandoNaoEncontrar() {
        when(denunciaRepository.findById(55L)).thenReturn(Optional.empty());

        DenunciaException ex = assertThrows(DenunciaException.class,
            () -> denunciaService.buscarPorId(55L));

        assertEquals("Denúncia não encontrada com ID: 55", ex.getMessage());
    }

    @Test
    void listarDenuncias_DeveMapearPaginacao() {
        Pageable pageable = PageRequest.of(0, 10);
        Denuncia denuncia = criarDenuncia(9L, TipoDenuncia.LOCAL, 20L, StatusDenuncia.PENDING);
        DenunciaResponseDTO dto = DenunciaResponseDTO.builder().id(9L).build();
        Page<Denuncia> page = new PageImpl<>(List.of(denuncia), pageable, 1);

        when(denunciaRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
        when(denunciaMapper.toResponseDTO(denuncia)).thenReturn(dto);

        Page<DenunciaResponseDTO> resultado = denunciaService.listarDenuncias(
            TipoDenuncia.LOCAL,
            StatusDenuncia.PENDING,
            "busca",
            LocalDateTime.now().minusDays(7),
            LocalDateTime.now(),
            1L,
            pageable
        );

        assertEquals(1, resultado.getTotalElements());
        assertSame(dto, resultado.getContent().get(0));
    }

    @Test
    void atualizarStatus_DeveAtualizarCamposDeResolucaoQuandoStatusFinal() {
        Denuncia denuncia = criarDenuncia(12L, TipoDenuncia.LOCAL, 30L, StatusDenuncia.PENDING);
        DenunciaResponseDTO dto = DenunciaResponseDTO.builder().id(12L).status(StatusDenuncia.RESOLVED).build();

        when(denunciaRepository.findById(12L)).thenReturn(Optional.of(denuncia));
        when(denunciaRepository.save(denuncia)).thenReturn(denuncia);
        when(denunciaMapper.toResponseDTO(denuncia)).thenReturn(dto);

        DenunciaResponseDTO resultado = denunciaService.atualizarStatus(12L, StatusDenuncia.RESOLVED, "admin@email.com", "ok");

        assertSame(dto, resultado);
        assertEquals(StatusDenuncia.RESOLVED, denuncia.getStatus());
        assertEquals("admin@email.com", denuncia.getResolvidoPor());
        assertEquals("ok", denuncia.getObservacoes());
        assertNotNull(denuncia.getDataResolucao());
    }

    @Test
    void resolverDenuncia_DeveLancarQuandoJaResolvida() {
        Denuncia denuncia = criarDenuncia(20L, TipoDenuncia.LOCAL, 40L, StatusDenuncia.RESOLVED);
        when(denunciaRepository.findById(20L)).thenReturn(Optional.of(denuncia));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> denunciaService.resolverDenuncia(20L, "admin@email.com"));

        assertEquals("Denúncia já foi resolvida anteriormente", ex.getMessage());
    }

    @Test
    void resolverDenuncia_DeveResolverEChamarModeracaoQuandoSuportado() {
        Denuncia denuncia = criarDenuncia(25L, TipoDenuncia.LOCAL, 99L, StatusDenuncia.PENDING);
        when(denunciaRepository.findById(25L)).thenReturn(Optional.of(denuncia));
        when(conteudoModeracaoService.removerConteudoDenunciado(TipoDenuncia.LOCAL, 99L))
            .thenReturn(" Local ID 99 foi desativado (exclusão lógica)");
        when(denunciaRepository.save(denuncia)).thenReturn(denuncia);

        ResolucaoDenunciaResponseDTO resposta = denunciaService.resolverDenuncia(25L, "moderador@email.com");

        assertEquals(StatusDenuncia.RESOLVED, resposta.getStatus());
        assertEquals(25L, resposta.getDenunciaId());
        assertEquals("moderador@email.com", resposta.getResolvidoPor());
        assertNotNull(resposta.getDataResolucao());
        verify(conteudoModeracaoService).removerConteudoDenunciado(TipoDenuncia.LOCAL, 99L);
    }

    @Test
    void resolverDenuncia_DeveLancarDenunciaExceptionQuandoModeracaoFalhar() {
        Denuncia denuncia = criarDenuncia(26L, TipoDenuncia.AVALIACAO, 100L, StatusDenuncia.PENDING);
        when(denunciaRepository.findById(26L)).thenReturn(Optional.of(denuncia));
        when(conteudoModeracaoService.removerConteudoDenunciado(TipoDenuncia.AVALIACAO, 100L))
            .thenThrow(new RuntimeException("erro na moderação"));

        DenunciaException ex = assertThrows(DenunciaException.class,
            () -> denunciaService.resolverDenuncia(26L, "moderador@email.com"));

        assertEquals("Falha ao resolver denúncia: erro na moderação", ex.getMessage());
    }

    @Test
    void rejeitarDenuncia_DeveMarcarComoRejeitadaComObservacaoPadraoQuandoNula() {
        Denuncia denuncia = criarDenuncia(33L, TipoDenuncia.USUARIO, 50L, StatusDenuncia.PENDING);
        when(denunciaRepository.findById(33L)).thenReturn(Optional.of(denuncia));
        when(denunciaRepository.save(denuncia)).thenReturn(denuncia);

        ResolucaoDenunciaResponseDTO resposta = denunciaService.rejeitarDenuncia(33L, "admin@email.com", null);

        assertEquals(StatusDenuncia.REJECTED, resposta.getStatus());
        assertEquals("admin@email.com", resposta.getResolvidoPor());
        assertEquals("Denúncia rejeitada pelo moderador.", denuncia.getObservacoes());
    }

    @Test
    void excluirDenuncia_DeveLancarQuandoNaoExistir() {
        when(denunciaRepository.existsById(77L)).thenReturn(false);

        DenunciaException ex = assertThrows(DenunciaException.class,
            () -> denunciaService.excluirDenuncia(77L));

        assertEquals("Denúncia não encontrada com ID: 77", ex.getMessage());
    }

    @Test
    void buscarPorTarget_DeveMapearListaDeResposta() {
        Denuncia d1 = criarDenuncia(80L, TipoDenuncia.LOCAL, 900L, StatusDenuncia.PENDING);
        Denuncia d2 = criarDenuncia(81L, TipoDenuncia.LOCAL, 900L, StatusDenuncia.REVIEWED);
        DenunciaResponseDTO r1 = DenunciaResponseDTO.builder().id(80L).build();
        DenunciaResponseDTO r2 = DenunciaResponseDTO.builder().id(81L).build();

        when(denunciaRepository.findByTipoAndTargetId(TipoDenuncia.LOCAL, 900L)).thenReturn(List.of(d1, d2));
        when(denunciaMapper.toResponseDTO(d1)).thenReturn(r1);
        when(denunciaMapper.toResponseDTO(d2)).thenReturn(r2);

        List<DenunciaResponseDTO> resultado = denunciaService.buscarPorTarget(TipoDenuncia.LOCAL, 900L);

        assertEquals(2, resultado.size());
        assertSame(r1, resultado.get(0));
        assertSame(r2, resultado.get(1));
    }

    @Test
    void contarPorStatus_DeveDelegarParaRepositorio() {
        when(denunciaRepository.countByStatus(StatusDenuncia.PENDING)).thenReturn(12L);

        long total = denunciaService.contarPorStatus(StatusDenuncia.PENDING);

        assertEquals(12L, total);
    }

    private DenunciaRequestDTO criarRequest(TipoDenuncia tipo, Long targetId) {
        return DenunciaRequestDTO.builder()
            .tipo(tipo)
            .targetId(targetId)
            .targetName("Alvo Teste")
            .motivo("SPAM")
            .motivoLabel("Spam")
            .descricao("Descrição do motivo")
            .build();
    }

    private Denuncia criarDenuncia(Long id, TipoDenuncia tipo, Long targetId, StatusDenuncia status) {
        return Denuncia.builder()
            .id(id)
            .tipo(tipo)
            .targetId(targetId)
            .targetName("Item alvo")
            .motivo("SPAM")
            .motivoLabel("Spam")
            .descricao("Desc")
            .status(status)
            .usuario(Usuario.builder().idUsuario(1L).nome("Usuário").email("usuario@email.com").build())
            .usuarioNome("Usuário")
            .dataCriacao(LocalDateTime.now().minusDays(1))
            .build();
    }
}
