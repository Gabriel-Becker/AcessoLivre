package com.example.acessolivre.controller;

import com.example.acessolivre.dto.request.EnderecoRequestDTO;
import com.example.acessolivre.dto.response.EnderecoResponseDTO;
import com.example.acessolivre.mapper.EnderecoMapper;
import com.example.acessolivre.model.Endereco;
import com.example.acessolivre.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enderecos")
@RequiredArgsConstructor
@Slf4j
public class EnderecoController {

    private final EnderecoService enderecoService;

    /**
     * Lista todos os endereços
     * @return ResponseEntity com lista de endereços
     */
    @GetMapping
    public ResponseEntity<List<EnderecoResponseDTO>> listarTodos() {
        log.info("Endpoint GET /api/enderecos - Listando todos os endereços");
        try {
            List<Endereco> enderecos = enderecoService.listarTodos();
            List<EnderecoResponseDTO> responseDTOs = enderecos.stream()
                    .map(EnderecoMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} endereços", responseDTOs.size());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar endereços: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um endereço pelo ID
     * @param id ID do endereço
     * @return ResponseEntity com endereço se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<EnderecoResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("Endpoint GET /api/enderecos/{} - Buscando endereço por ID", id);
        try {
            Optional<Endereco> endereco = enderecoService.buscarPorId(id);
            
            if (endereco.isPresent()) {
                log.info("Endereço encontrado com ID: {}", id);
                EnderecoResponseDTO responseDTO = EnderecoMapper.toResponse(endereco.get());
                return ResponseEntity.ok(responseDTO);
            } else {
                log.warn("Endereço não encontrado com ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar endereço com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo endereço
     * @param requestDTO Dados do endereço a ser salvo
     * @return ResponseEntity com endereço salvo
     */
    @PostMapping
    public ResponseEntity<EnderecoResponseDTO> salvar(@Valid @RequestBody EnderecoRequestDTO requestDTO) {
        log.info("Endpoint POST /api/enderecos - Salvando novo endereço");
        try {
            Endereco endereco = EnderecoMapper.toEntity(requestDTO);
            Endereco enderecoSalvo = enderecoService.salvar(endereco);
            EnderecoResponseDTO responseDTO = EnderecoMapper.toResponse(enderecoSalvo);
            log.info("Endereço salvo com sucesso. ID: {}", enderecoSalvo.getIdEndereco());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            log.error("Erro ao salvar endereço: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Atualiza um endereço existente
     * @param id ID do endereço a ser atualizado
     * @param requestDTO Dados atualizados
     * @return ResponseEntity com endereço atualizado ou 404 se não encontrado
     */
    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponseDTO> atualizar(@PathVariable Long id, 
                                                         @Valid @RequestBody EnderecoRequestDTO requestDTO) {
        log.info("Endpoint PUT /api/enderecos/{} - Atualizando endereço", id);
        try {
            // Verifica se o endereço existe
            Optional<Endereco> enderecoExistente = enderecoService.buscarPorId(id);
            
            if (enderecoExistente.isEmpty()) {
                log.warn("Endereço não encontrado para atualização. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // Converte DTO para entidade
            Endereco endereco = EnderecoMapper.toEntity(requestDTO);
            endereco.setIdEndereco(id);
            
            // Salva as alterações
            Endereco enderecoAtualizado = enderecoService.salvar(endereco);
            EnderecoResponseDTO responseDTO = EnderecoMapper.toResponse(enderecoAtualizado);
            log.info("Endereço atualizado com sucesso. ID: {}", id);
            
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Erro ao atualizar endereço com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deleta um endereço pelo ID
     * @param id ID do endereço a ser deletado
     * @return ResponseEntity com status 204 se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("Endpoint DELETE /api/enderecos/{} - Deletando endereço", id);
        try {
            boolean deletado = enderecoService.deletar(id);
            
            if (deletado) {
                log.info("Endereço deletado com sucesso. ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("Endereço não encontrado para deletar. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao deletar endereço com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
