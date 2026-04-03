package com.acessolivre.service;

import com.acessolivre.model.Endereco;
import com.acessolivre.repository.EnderecoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final EnderecoRepository enderecoRepository;

   
    @Transactional(readOnly = true)
    public Page<Endereco> listarTodos(Pageable pageable) {
        return enderecoRepository.findAll(pageable);
    }

    @Transactional
    public Endereco salvar(Endereco endereco) {
        validarEndereco(endereco);
        
        Optional<Endereco> existente = enderecoRepository
                .findByCepAndLogradouroAndNumero(
                    endereco.getCep(),
                    endereco.getLogradouro(),
                    endereco.getNumero()
                );
        
        return existente.orElseGet(() -> enderecoRepository.save(endereco));
    }

    @Transactional(readOnly = true)
    public Optional<Endereco> buscarPorId(Long id) {
        return enderecoRepository.findById(id);
    }

     @Transactional(readOnly = true)
    public List<Endereco> buscarPorCidade(String cidade) {
        return enderecoRepository.findByCidade(cidade);
    }

    @Transactional(readOnly = true)
    public List<Endereco> buscarPorCep(String cep) {
        String cepLimpo = cep.replaceAll("[^0-9]", "");
        return enderecoRepository.findByCep(cepLimpo);
    }

    @Transactional
    public Endereco atualizar(Long id, Endereco enderecoAtualizado) {
        return enderecoRepository.findById(id).map(endereco -> {
            endereco.setCep(enderecoAtualizado.getCep());
            endereco.setLogradouro(enderecoAtualizado.getLogradouro());
            endereco.setNumero(enderecoAtualizado.getNumero());
            endereco.setComplemento(enderecoAtualizado.getComplemento());
            endereco.setBairro(enderecoAtualizado.getBairro());
            endereco.setCidade(enderecoAtualizado.getCidade());
            endereco.setEstado(enderecoAtualizado.getEstado());
            validarEndereco(endereco);
            return enderecoRepository.save(endereco);
        }).orElseThrow(() -> new IllegalArgumentException("Endereço não encontrado"));
    }

    @Transactional
    public void deletar(Long id) {
        if (!enderecoRepository.existsById(id)) {
            throw new IllegalArgumentException("Endereço não encontrado");
        }
        enderecoRepository.deleteById(id);
    }


    public void validarEndereco(Endereco endereco) {
        if (endereco == null) {
            throw new IllegalArgumentException("Endereco nao pode ser nulo");
        }

        if (endereco.getCep() == null || endereco.getCep().trim().isEmpty()) {
            throw new IllegalArgumentException("CEP e obrigatorio");
        }

        String cepLimpo = endereco.getCep().replaceAll("[^0-9]", "");
        if (cepLimpo.length() != 8) {
            throw new IllegalArgumentException("CEP deve conter exatamente 8 digitos");
        }
        endereco.setCep(cepLimpo);

        DadosViaCep dados = buscarDadosCep(cepLimpo);

        if (endereco.getEstado() == null || endereco.getEstado().trim().isEmpty()) {
            throw new IllegalArgumentException("Estado e obrigatorio");
        }

        String estado = endereco.getEstado().trim().toUpperCase();
        if (!estado.matches("^[A-Z]{2}$")) {
            throw new IllegalArgumentException("Estado deve ter exatamente 2 letras maiusculas");
        }
        endereco.setEstado(estado);
        if (!dados.getUf().equalsIgnoreCase(estado)) {
            throw new IllegalArgumentException(
                String.format("Estado '%s' nao corresponde ao CEP informado. Estado esperado: %s", estado, dados.getUf())
            );
        }

        if (endereco.getCidade() == null || endereco.getCidade().trim().isEmpty()) {
            throw new IllegalArgumentException("Cidade e obrigatoria");
        }
        if (endereco.getCidade().trim().length() < 2 || endereco.getCidade().trim().length() > 100) {
            throw new IllegalArgumentException("Cidade deve ter entre 2 e 100 caracteres");
        }

        if (endereco.getNumero() == null || endereco.getNumero().trim().isEmpty()) {
            throw new IllegalArgumentException("Numero e obrigatorio");
        }
        if (endereco.getNumero().trim().length() < 1 || endereco.getNumero().trim().length() > 10) {
            throw new IllegalArgumentException("Numero deve ter entre 1 e 10 caracteres");
        }

        if (endereco.getComplemento() != null && endereco.getComplemento().trim().length() > 100) {
            throw new IllegalArgumentException("Complemento deve ter no maximo 100 caracteres");
        }

        if (!dados.getLocalidade().equalsIgnoreCase(endereco.getCidade().trim())) {
            throw new IllegalArgumentException(
                String.format("Cidade '%s' nao corresponde ao CEP informado. Cidade esperada: %s", endereco.getCidade(), dados.getLocalidade())
            );
        }

        if (endereco.getBairro() == null || endereco.getBairro().trim().isEmpty()) {
            throw new IllegalArgumentException("Bairro e obrigatorio");
        }
        if (endereco.getBairro().trim().length() < 3 || endereco.getBairro().trim().length() > 100) {
            throw new IllegalArgumentException("Bairro deve ter entre 3 e 100 caracteres");
        }
        if (dados.getBairro() != null && !dados.getBairro().trim().isEmpty()) {
            if (!dados.getBairro().equalsIgnoreCase(endereco.getBairro().trim())) {
                throw new IllegalArgumentException(
                    String.format("Bairro '%s' nao corresponde ao CEP informado. Bairro esperado: %s", endereco.getBairro(), dados.getBairro())
                );
            }
        }

        if (endereco.getLogradouro() == null || endereco.getLogradouro().trim().isEmpty()) {
            throw new IllegalArgumentException("Logradouro e obrigatorio");
        }
        if (endereco.getLogradouro().trim().length() < 3 || endereco.getLogradouro().trim().length() > 200) {
            throw new IllegalArgumentException("Logradouro deve ter entre 3 e 200 caracteres");
        }
        if (dados.getLogradouro() != null && !dados.getLogradouro().trim().isEmpty()) {
            if (!dados.getLogradouro().equalsIgnoreCase(endereco.getLogradouro().trim())) {
                throw new IllegalArgumentException(
                    String.format("Logradouro '%s' nao corresponde ao CEP informado. Logradouro esperado: %s", endereco.getLogradouro(), dados.getLogradouro())
                );
            }
        }
    }

    private DadosViaCep buscarDadosCep(String cep) {
        try {
            String url = "https://viacep.com.br/ws/" + cep + "/json/";
            String response = restTemplate.getForObject(url, String.class);

            if (response == null) {
                throw new IllegalArgumentException("Erro ao consultar CEP no ViaCEP");
            }

            JsonNode jsonNode = objectMapper.readTree(response);
            if (jsonNode.has("erro") && jsonNode.get("erro").asBoolean()) {
                throw new IllegalArgumentException("CEP nao encontrado");
            }

            DadosViaCep dados = new DadosViaCep();
            dados.setLogradouro(jsonNode.path("logradouro").asText(""));
            dados.setBairro(jsonNode.path("bairro").asText(""));
            dados.setLocalidade(jsonNode.path("localidade").asText(""));
            dados.setUf(jsonNode.path("uf").asText(""));
            return dados;
        } catch (RestClientException e) {
            throw new IllegalArgumentException("Erro ao consultar CEP no ViaCEP");
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao processar resposta do ViaCEP");
        }
    }

    private static class DadosViaCep {
        private String logradouro;
        private String bairro;
        private String localidade;
        private String uf;

        public String getLogradouro() {
            return logradouro;
        }

        public void setLogradouro(String logradouro) {
            this.logradouro = logradouro;
        }

        public String getBairro() {
            return bairro;
        }

        public void setBairro(String bairro) {
            this.bairro = bairro;
        }

        public String getLocalidade() {
            return localidade;
        }

        public void setLocalidade(String localidade) {
            this.localidade = localidade;
        }

        public String getUf() {
            return uf;
        }

        public void setUf(String uf) {
            this.uf = uf;
        }
    }
}
