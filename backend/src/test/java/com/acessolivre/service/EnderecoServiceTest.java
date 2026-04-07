package com.acessolivre.service;

import com.acessolivre.model.Endereco;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnderecoServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private EnderecoService enderecoService;

    private Endereco enderecoValido;

    @BeforeEach
    void setUp() {
        enderecoValido = new Endereco();
        enderecoValido.setCep("88040150");
        enderecoValido.setEstado("SC");
        enderecoValido.setCidade("Florianópolis");
        enderecoValido.setBairro("Pantanal");
        enderecoValido.setLogradouro("Rua Deputado Antônio Edu Vieira");
        enderecoValido.setNumero("119");
        enderecoValido.setComplemento("Apto 101");
    }

    // ========== TESTES DE CEP ==========
    
    @Test
    void validarEndereco_ComEnderecoNulo_DeveLancarExcecao() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(null));
        assertEquals("Endereco nao pode ser nulo", exception.getMessage());
    }

    @Test
    void validarEndereco_ComCepNulo_DeveLancarExcecao() {
        enderecoValido.setCep(null);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(enderecoValido));
        assertEquals("CEP e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComCepVazio_DeveLancarExcecao() {
        enderecoValido.setCep("");
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(enderecoValido));
        assertEquals("CEP e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComCepComMascara_DeveLimparEValidar() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040-150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        assertDoesNotThrow(() -> enderecoService.validarEndereco(endereco));
        assertEquals("88040150", endereco.getCep());
    }

    @Test
    void validarEndereco_ComCepInvalidoTamanho_DeveLancarExcecao() {
        enderecoValido.setCep("123");
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(enderecoValido));
        assertEquals("CEP deve conter exatamente 8 digitos", exception.getMessage());
    }

   
}