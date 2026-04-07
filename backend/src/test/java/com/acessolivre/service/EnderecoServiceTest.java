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

    // TESTES DE CEP 
    
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

     // TESTES DE ESTADO 
    
    @Test
    void validarEndereco_ComEstadoNulo_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado(null);
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Estado e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComEstadoVazio_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Estado e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComEstadoFormatoInvalido_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SAO PAULO");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Estado deve ter exatamente 2 letras maiusculas", exception.getMessage());
    }

    @Test
    void validarEndereco_ComEstadoDiferenteDoViaCep_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("RJ");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertTrue(exception.getMessage().contains("Estado 'RJ' nao corresponde ao CEP informado"));
    }

    // TESTES DE CIDADE 
    
    @Test
    void validarEndereco_ComCidadeNula_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade(null);
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Cidade e obrigatoria", exception.getMessage());
    }

    @Test
    void validarEndereco_ComCidadeMuitoCurta_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("A");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Cidade deve ter entre 2 e 100 caracteres", exception.getMessage());
    }

    @Test
    void validarEndereco_ComCidadeDiferenteDoViaCep_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("São Paulo");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertTrue(exception.getMessage().contains("Cidade 'São Paulo' nao corresponde ao CEP informado"));
    }

     // TESTES DE NÚMERO 
    
    @Test
    void validarEndereco_ComNumeroNulo_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero(null);
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Numero e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComNumeroVazio_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Numero e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComNumeroMuitoLongo_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("12345678901");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Numero deve ter entre 1 e 10 caracteres", exception.getMessage());
    }

     // TESTES DE COMPLEMENTO 
    
    @Test
    void validarEndereco_ComComplementoMuitoLongo_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        endereco.setComplemento("a".repeat(101));
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Complemento deve ter no maximo 100 caracteres", exception.getMessage());
    }

     //  TESTES DE BAIRRO 
    
    @Test
    void validarEndereco_ComBairroNulo_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro(null);
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Bairro e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComBairroVazio_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Bairro e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComBairroMuitoCurto_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("AB");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Bairro deve ter entre 3 e 100 caracteres", exception.getMessage());
    }

    @Test
    void validarEndereco_ComBairroDiferenteDoViaCep_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Centro");
        endereco.setLogradouro("Rua Deputado Antônio Edu Vieira");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertTrue(exception.getMessage().contains("Bairro 'Centro' nao corresponde ao CEP informado"));
    }

    //  TESTES DE LOGRADOURO 
    
    @Test
    void validarEndereco_ComLogradouroNulo_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro(null);
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Logradouro e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComLogradouroVazio_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Logradouro e obrigatorio", exception.getMessage());
    }

    @Test
    void validarEndereco_ComLogradouroMuitoCurto_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("AB");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertEquals("Logradouro deve ter entre 3 e 200 caracteres", exception.getMessage());
    }

    @Test
    void validarEndereco_ComLogradouroDiferenteDoViaCep_DeveLancarExcecao() throws Exception {
        Endereco endereco = new Endereco();
        endereco.setCep("88040150");
        endereco.setEstado("SC");
        endereco.setCidade("Florianópolis");
        endereco.setBairro("Pantanal");
        endereco.setLogradouro("Rua Qualquer");
        endereco.setNumero("119");
        
        String mockResponse = "{\"logradouro\":\"Rua Deputado Antônio Edu Vieira\",\"bairro\":\"Pantanal\",\"localidade\":\"Florianópolis\",\"uf\":\"SC\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(mockResponse);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> enderecoService.validarEndereco(endereco));
        assertTrue(exception.getMessage().contains("Logradouro 'Rua Qualquer' nao corresponde ao CEP informado"));
    }



   
}