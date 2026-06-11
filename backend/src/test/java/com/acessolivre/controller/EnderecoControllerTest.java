package com.acessolivre.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.acessolivre.dto.request.EnderecoRequestDTO;
import com.acessolivre.dto.response.EnderecoResponseDTO;
import com.acessolivre.model.Endereco;
import com.acessolivre.service.EnderecoService;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class EnderecoControllerTest {

    @Mock
    private EnderecoService enderecoService;

    @InjectMocks
    private EnderecoController enderecoController;

    @Test
    void listarTodos_DeveRetornarPaginaComStatus200() {
        Endereco endereco = Endereco.builder().idEndereco(1L).cidade("São Paulo").build();
        Pageable pageable = PageRequest.of(0, 20);
        Page<Endereco> page = new PageImpl<>(List.of(endereco));
        when(enderecoService.listarTodos(any(Pageable.class))).thenReturn(page);

        ResponseEntity<Page<EnderecoResponseDTO>> resultado = enderecoController.listarTodos(0, 20);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().getTotalElements());
    }

    @Test
    void salvar_DeveRetornarDTOComStatus201() {
        EnderecoRequestDTO request = EnderecoRequestDTO.builder()
            .cep("01310100")
            .logradouro("Avenida Paulista")
            .numero("1000")
            .cidade("São Paulo")
            .estado("SP")
            .build();

        Endereco endereco = Endereco.builder()
            .idEndereco(1L)
            .cep("01310100")
            .cidade("São Paulo")
            .build();

        when(enderecoService.salvar(any(Endereco.class))).thenReturn(endereco);

        ResponseEntity<EnderecoResponseDTO> resultado = enderecoController.salvar(request);

        assertEquals(HttpStatus.CREATED, resultado.getStatusCode());
        assertEquals(1L, resultado.getBody().getIdEndereco());
    }

    @Test
    void buscarPorId_DeveRetornarDTOComStatus200QuandoExistir() {
        Endereco endereco = Endereco.builder().idEndereco(1L).cidade("São Paulo").build();
        when(enderecoService.buscarPorId(1L)).thenReturn(Optional.of(endereco));

        ResponseEntity<EnderecoResponseDTO> resultado = enderecoController.buscarPorId(1L);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1L, resultado.getBody().getIdEndereco());
    }

    @Test
    void buscarPorId_DeveRetornar404QuandoNaoExistir() {
        when(enderecoService.buscarPorId(999L)).thenReturn(Optional.empty());

        ResponseEntity<EnderecoResponseDTO> resultado = enderecoController.buscarPorId(999L);

        assertEquals(HttpStatus.NOT_FOUND, resultado.getStatusCode());
    }

    @Test
    void buscarPorCidade_DeveRetornarListaDTOsComStatus200() {
        Endereco endereco = Endereco.builder().idEndereco(1L).cidade("São Paulo").build();
        when(enderecoService.buscarPorCidade("São Paulo")).thenReturn(List.of(endereco));

        ResponseEntity<List<EnderecoResponseDTO>> resultado = enderecoController.buscarPorCidade("São Paulo");

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().size());
    }

    @Test
    void buscarPorCep_DeveRetornarListaDTOsComStatus200() {
        Endereco endereco = Endereco.builder().idEndereco(1L).cep("01310100").build();
        when(enderecoService.buscarPorCep("01310100")).thenReturn(List.of(endereco));

        ResponseEntity<List<EnderecoResponseDTO>> resultado = enderecoController.buscarPorCep("01310100");

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
        assertEquals(1, resultado.getBody().size());
    }

    @Test
    void atualizar_DeveRetornarDTOComStatus200() {
        EnderecoRequestDTO request = EnderecoRequestDTO.builder().cidade("Rio de Janeiro").build();
        Endereco endereco = Endereco.builder().idEndereco(1L).cidade("Rio de Janeiro").build();
        when(enderecoService.atualizar(org.mockito.ArgumentMatchers.eq(1L), any(Endereco.class))).thenReturn(endereco);

        ResponseEntity<EnderecoResponseDTO> resultado = enderecoController.atualizar(1L, request);

        assertEquals(HttpStatus.OK, resultado.getStatusCode());
    }

    @Test
    void deletar_DeveRetornarStatus204() {
        ResponseEntity<Void> resultado = enderecoController.deletar(1L);

        assertEquals(HttpStatus.NO_CONTENT, resultado.getStatusCode());
    }
}
