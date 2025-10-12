package com.example.acessolivre.controller;

import com.example.acessolivre.dto.request.UsuarioAutenticarRequestDTO;
import com.example.acessolivre.dto.response.UsuarioAutenticarResponseDTO;
import com.example.acessolivre.mapper.UsuarioAutenticarMapper;
import com.example.acessolivre.model.UsuarioAutenticar;
import com.example.acessolivre.service.UsuarioAutenticarService;
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
@RequestMapping("/api/usuario-autenticar")
@RequiredArgsConstructor
@Slf4j
public class UsuarioAutenticarController {

    private final UsuarioAutenticarService usuarioAutenticarService;

    /**
     * Lista todos os registros de autenticação
     * @return ResponseEntity com lista de registros
     */
    @GetMapping
    public ResponseEntity<List<UsuarioAutenticarResponseDTO>> listarTodos() {
        log.info("Endpoint GET /usuarioautenticar - Listando todos os registros");
        try {
            List<UsuarioAutenticar> registros = usuarioAutenticarService.listarTodos();
            List<UsuarioAutenticarResponseDTO> responseDTOs = registros.stream()
                    .map(UsuarioAutenticarMapper::toResponse)
                    .collect(Collectors.toList());
            log.info("Retornando {} registros de autenticação", responseDTOs.size());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            log.error("Erro ao listar registros de autenticação: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Busca um registro de autenticação pelo ID
     * @param id ID do registro
     * @return ResponseEntity com registro se encontrado ou 404 se não encontrado
     */
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioAutenticarResponseDTO> buscarPorId(@PathVariable Long id) {
        log.info("Endpoint GET /usuarioautenticar/{} - Buscando registro por ID", id);
        try {
            Optional<UsuarioAutenticar> registro = usuarioAutenticarService.buscarPorId(id);
            
            if (registro.isPresent()) {
                log.info("Registro encontrado com ID: {}", id);
                UsuarioAutenticarResponseDTO responseDTO = UsuarioAutenticarMapper.toResponse(registro.get());
                return ResponseEntity.ok(responseDTO);
            } else {
                log.warn("Registro não encontrado com ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao buscar registro com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Salva um novo registro de autenticação
     * @param requestDTO Dados do registro a ser salvo
     * @return ResponseEntity com registro salvo
     */
    @PostMapping
    public ResponseEntity<UsuarioAutenticarResponseDTO> salvar(@Valid @RequestBody UsuarioAutenticarRequestDTO requestDTO) {
        log.info("Endpoint POST /usuarioautenticar - Salvando novo registro");
        try {
            UsuarioAutenticar usuarioAutenticar = UsuarioAutenticarMapper.toEntity(requestDTO);
            UsuarioAutenticar registroSalvo = usuarioAutenticarService.salvar(usuarioAutenticar);
            UsuarioAutenticarResponseDTO responseDTO = UsuarioAutenticarMapper.toResponse(registroSalvo);
            log.info("Registro salvo com sucesso. ID: {}", registroSalvo.getIdUsuarioAutenticar());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            log.error("Erro ao salvar registro: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Atualiza um registro de autenticação existente
     * @param id ID do registro a ser atualizado
     * @param requestDTO Dados atualizados
     * @return ResponseEntity com registro atualizado ou 404 se não encontrado
     */
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioAutenticarResponseDTO> atualizar(@PathVariable Long id, 
                                                                 @Valid @RequestBody UsuarioAutenticarRequestDTO requestDTO) {
        log.info("Endpoint PUT /usuarioautenticar/{} - Atualizando registro", id);
        try {
            // Verifica se o registro existe
            Optional<UsuarioAutenticar> registroExistente = usuarioAutenticarService.buscarPorId(id);
            
            if (registroExistente.isEmpty()) {
                log.warn("Registro não encontrado para atualização. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            // Converte DTO para entidade
            UsuarioAutenticar usuarioAutenticar = UsuarioAutenticarMapper.toEntity(requestDTO);
            usuarioAutenticar.setIdUsuarioAutenticar(id);
            
            // Salva as alterações
            UsuarioAutenticar registroAtualizado = usuarioAutenticarService.salvar(usuarioAutenticar);
            UsuarioAutenticarResponseDTO responseDTO = UsuarioAutenticarMapper.toResponse(registroAtualizado);
            log.info("Registro atualizado com sucesso. ID: {}", id);
            
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Erro ao atualizar registro com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deleta um registro de autenticação pelo ID
     * @param id ID do registro a ser deletado
     * @return ResponseEntity com status 204 se deletado ou 404 se não encontrado
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        log.info("Endpoint DELETE /usuarioautenticar/{} - Deletando registro", id);
        try {
            boolean deletado = usuarioAutenticarService.deletar(id);
            
            if (deletado) {
                log.info("Registro deletado com sucesso. ID: {}", id);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("Registro não encontrado para deletar. ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Erro ao deletar registro com ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
