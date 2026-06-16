package com.acessolivre.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Arrays;
import java.io.ByteArrayInputStream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.Role;
import com.acessolivre.enums.TipoAcessibilidade;
import com.acessolivre.model.Endereco;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.AvaliacaoRepository;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AdminServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioAutenticarRepository usuarioAutenticarRepository;

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private LocalRepository localRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    @Test
    void listarTodosUsuarios_DeveRetornarApenasAtivos() {
        when(usuarioRepository.findAllByAtivoTrue(PageRequest.of(0, 10)))
            .thenReturn(new PageImpl<>(List.of(criarUsuario(1L, true))));

        Page<Usuario> pagina = adminService.listarTodosUsuarios(PageRequest.of(0, 10));

        assertEquals(1, pagina.getTotalElements());
    }

    @Test
    void listarUsuariosPorStatus_DeveRetornarInativosQuandoFiltroForFalso() {
        when(usuarioRepository.findAllByAtivoFalse(PageRequest.of(0, 10)))
            .thenReturn(new PageImpl<>(List.of(criarUsuario(2L, false))));

        Page<Usuario> pagina = adminService.listarUsuariosPorStatus(PageRequest.of(0, 10), false);

        assertEquals(1, pagina.getTotalElements());
        assertFalse(Boolean.TRUE.equals(pagina.getContent().get(0).getAtivo()));
    }

    @Test
    void buscarUsuarioPorId_DeveDelegarRepositorio() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(criarUsuario(2L, true)));

        Optional<Usuario> usuario = adminService.buscarUsuarioPorId(2L);

        assertTrue(usuario.isPresent());
    }

    @Test
    void alterarRoleUsuario_DeveRetornarFalseQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(10L)).thenReturn(Optional.empty());

        boolean alterou = adminService.alterarRoleUsuario(10L, "admin");

        assertFalse(alterou);
    }

    @Test
    void alterarRoleUsuario_DeveNormalizarRoleESalvar() {
        Usuario usuario = criarUsuario(10L, true);
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(10L)).thenReturn(Optional.of(usuario));

        boolean alterou = adminService.alterarRoleUsuario(10L, "admin");

        assertTrue(alterou);
        assertEquals(Role.ROLE_ADMIN, usuario.getRole());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void deletarUsuario_DeveRetornarFalseQuandoNaoExiste() {
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(20L)).thenReturn(Optional.empty());

        boolean deletou = adminService.deletarUsuario(20L);

        assertFalse(deletou);
    }

    @Test
    void deletarUsuario_DeveRealizarExclusaoLogica() {
        Usuario usuario = criarUsuario(20L, true);
        usuario.setTokenAtual("token-antigo");
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(20L)).thenReturn(Optional.of(usuario));

        boolean deletou = adminService.deletarUsuario(20L);

        assertTrue(deletou);
        assertFalse(usuario.getAtivo());
        assertEquals(null, usuario.getTokenAtual());
    }

    @Test
    void reativarUsuario_DeveAtivarUsuarioInativo() {
        Usuario usuario = criarUsuario(21L, false);
        when(usuarioRepository.findByIdUsuarioAndAtivoFalse(21L)).thenReturn(Optional.of(usuario));

        boolean reativou = adminService.reativarUsuario(21L);

        assertTrue(reativou);
        assertTrue(Boolean.TRUE.equals(usuario.getAtivo()));
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void reativarUsuario_DeveRetornarFalseQuandoUsuarioInativoNaoExiste() {
        when(usuarioRepository.findByIdUsuarioAndAtivoFalse(21L)).thenReturn(Optional.empty());

        boolean reativou = adminService.reativarUsuario(21L);

        assertFalse(reativou);
    }

    @Test
    void alterarSenhaUsuario_DeveRetornarFalseQuandoUsuarioNaoExiste() {
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(30L)).thenReturn(Optional.empty());

        boolean alterou = adminService.alterarSenhaUsuario(30L, "Senha@123");

        assertFalse(alterou);
    }

    @Test
    void alterarSenhaUsuario_DeveRetornarFalseQuandoCredencialNaoExiste() {
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(30L)).thenReturn(Optional.of(criarUsuario(30L, true)));
        when(usuarioAutenticarRepository.findByUsuario_IdUsuario(30L)).thenReturn(Optional.empty());

        boolean alterou = adminService.alterarSenhaUsuario(30L, "Senha@123");

        assertFalse(alterou);
    }

    @Test
    void alterarSenhaUsuario_DeveAtualizarHashQuandoSucesso() {
        Usuario usuario = criarUsuario(30L, true);
        UsuarioAutenticar credencial = UsuarioAutenticar.builder().usuario(usuario).senhaHash("antiga").build();
        when(usuarioRepository.findByIdUsuarioAndAtivoTrue(30L)).thenReturn(Optional.of(usuario));
        when(usuarioAutenticarRepository.findByUsuario_IdUsuario(30L)).thenReturn(Optional.of(credencial));
        when(passwordEncoder.encode("Senha@123")).thenReturn("nova-hash");

        boolean alterou = adminService.alterarSenhaUsuario(30L, "Senha@123");

        assertTrue(alterou);
        assertEquals("nova-hash", credencial.getSenhaHash());
        verify(usuarioAutenticarRepository).save(credencial);
    }

    @Test
    void obterEstatisticasGerais_DeveConsolidarTotais() {
        when(usuarioRepository.countByAtivoTrue()).thenReturn(10L);
        when(localRepository.count()).thenReturn(50L);
        when(avaliacaoRepository.count()).thenReturn(80L);
        when(avaliacaoRepository.findByModerado(false)).thenReturn(List.of());

        Map<String, Object> stats = adminService.obterEstatisticasGerais();

        assertEquals(10L, stats.get("totalUsuarios"));
        assertEquals(50L, stats.get("totalLocais"));
        assertEquals(80L, stats.get("totalAvaliacoes"));
        assertEquals(0, stats.get("avaliacoesPendentes"));
    }

    @Test
    void obterEstatisticasPorEstado_DeveAgruparPorEstado() {
        when(localRepository.findAll()).thenReturn(List.of(
            criarLocal(1L, "SC", Categoria.PUBLICO, Set.of(TipoAcessibilidade.RAMPA)),
            criarLocal(2L, "SC", Categoria.SAUDE, Set.of(TipoAcessibilidade.ELEVADOR)),
            criarLocal(3L, "PR", Categoria.PUBLICO, Set.of(TipoAcessibilidade.RAMPA))));

        Map<String, Long> stats = adminService.obterEstatisticasPorEstado();

        assertEquals(1L, stats.get("PR"));
    }

    @Test
    void obterEstatisticasPorCategoria_DeveAgruparPorCategoria() {
        when(localRepository.findAll()).thenReturn(List.of(
            criarLocal(1L, "SC", Categoria.PUBLICO, Set.of(TipoAcessibilidade.RAMPA)),
            criarLocal(2L, "SC", Categoria.SAUDE, Set.of(TipoAcessibilidade.ELEVADOR)),
            criarLocal(3L, "SC", Categoria.PUBLICO, Set.of(TipoAcessibilidade.RAMPA))));

        Map<String, Long> stats = adminService.obterEstatisticasPorCategoria();

        assertEquals(2L, stats.get("PUBLICO"));
        assertEquals(1L, stats.get("SAUDE"));
    }

    @Test
    void obterEstatisticasPorTipoAcessibilidade_DeveAgruparRecursos() {
        when(localRepository.findAll()).thenReturn(List.of(
            criarLocal(1L, "SC", Categoria.PUBLICO, Set.of(TipoAcessibilidade.RAMPA, TipoAcessibilidade.ELEVADOR)),
            criarLocal(2L, "SC", Categoria.SAUDE, Set.of(TipoAcessibilidade.RAMPA))));

        Map<String, Long> stats = adminService.obterEstatisticasPorTipoAcessibilidade();

        assertEquals(2L, stats.get("RAMPA"));
        assertEquals(1L, stats.get("ELEVADOR"));
    }

    @Test
    void exportarRelatorioUsuariosCsv_DeveIncluirUtf8BomEAcentos() {
        when(usuarioRepository.findAll()).thenReturn(List.of(criarUsuario(1L, true)));

        byte[] arquivo = adminService.exportarRelatorioUsuariosCsv(null, null);

        assertArrayEquals(new byte[] {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF}, Arrays.copyOfRange(arquivo, 0, 3));
        String conteudo = new String(arquivo, StandardCharsets.UTF_8);
        assertTrue(conteudo.contains("Usuário"));
    }

    @Test
    void exportarRelatorioLocaisCsv_DeveIncluirUtf8BomEAcentos() {
        when(localRepository.findAll()).thenReturn(List.of(
            criarLocal(1L, "SC", Categoria.PUBLICO, Set.of(TipoAcessibilidade.RAMPA))));
        when(avaliacaoRepository.findAll()).thenReturn(List.of());

        byte[] arquivo = adminService.exportarRelatorioLocaisCsv(null, null);

        assertArrayEquals(new byte[] {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF}, Arrays.copyOfRange(arquivo, 0, 3));
        String conteudo = new String(arquivo, StandardCharsets.UTF_8);
        assertTrue(conteudo.contains("Florianópolis"));
    }

    @Test
    void exportarRelatorioUsuariosPdf_DeveConterListaDetalhada() throws Exception {
        when(usuarioRepository.findAll()).thenReturn(List.of(
            criarUsuario(1L, true),
            criarUsuario(2L, false)));

        byte[] arquivo = adminService.exportarRelatorioUsuariosPdf(null, null);
        String texto = extrairTextoPdf(arquivo);
        String textoNormalizado = normalizarTextoPdf(texto);

        assertTrue(textoNormalizado.contains("Listadeusuarios"), textoNormalizado);
        assertTrue(textoNormalizado.contains("usuario1@teste.com"), textoNormalizado);
        assertTrue(textoNormalizado.contains("Usuário"), textoNormalizado);
    }

    @Test
    void exportarRelatorioLocaisPdf_DeveConterListaDetalhada() throws Exception {
        when(localRepository.findAll()).thenReturn(List.of(
            criarLocal(1L, "SC", Categoria.PUBLICO, Set.of(TipoAcessibilidade.RAMPA)),
            criarLocal(2L, "PR", Categoria.SAUDE, Set.of(TipoAcessibilidade.ELEVADOR))));
        when(avaliacaoRepository.findAll()).thenReturn(List.of());

        byte[] arquivo = adminService.exportarRelatorioLocaisPdf(null, null);
        String texto = extrairTextoPdf(arquivo);
        String textoNormalizado = normalizarTextoPdf(texto);

        assertTrue(textoNormalizado.contains("Listadelocais"), textoNormalizado);
        assertTrue(textoNormalizado.contains("LocalHistórico1"), textoNormalizado);
        assertTrue(textoNormalizado.contains("Florianópolis"), textoNormalizado);
    }

    private Usuario criarUsuario(Long id, boolean ativo) {
        return Usuario.builder()
            .idUsuario(id)
            .nome("Usuário")
            .email("usuario" + id + "@teste.com")
            .role(Role.ROLE_USER)
            .ativo(ativo)
            .dataCadastro(LocalDateTime.now().minusDays(1))
            .build();
    }

    private Local criarLocal(Long id, String estado, Categoria categoria, Set<TipoAcessibilidade> tipos) {
        Endereco endereco = Endereco.builder()
            .estado(estado)
            .cidade("Florianópolis")
            .bairro("Bairro")
            .logradouro("Rua")
            .numero("10")
            .cep("88040150")
            .build();

        return Local.builder()
            .idLocal(id)
            .nome("Local Histórico " + id)
            .categoria(categoria)
            .endereco(endereco)
            .tiposAcessibilidade(tipos)
            .avaliacaoMedia(4.5)
            .dataCriacao(LocalDateTime.now().minusDays(1))
            .build();
    }

    private String extrairTextoPdf(byte[] arquivoPdf) throws Exception {
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(arquivoPdf))) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        }
    }

    private String normalizarTextoPdf(String texto) {
        return texto.replaceAll("\\s+", "");
    }

}
