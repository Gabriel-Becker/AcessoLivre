package com.example.acessolivre.service;

import com.example.acessolivre.dto.request.TokenRevogadoRequestDTO;
import com.example.acessolivre.mapper.TokenRevogadoMapper;
import com.example.acessolivre.model.TokenRevogado;
import com.example.acessolivre.model.Usuario;
import com.example.acessolivre.repository.TokenRevogadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRevogadoService {

    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final UsuarioService usuarioService;

    /**
     * Lista todos os tokens revogados
     * @return Lista de todos os tokens revogados
     */
    public List<TokenRevogado> listarTodos() {
        log.info("Listando todos os tokens revogados");
        List<TokenRevogado> tokensRevogados = tokenRevogadoRepository.findAll();
        log.info("Encontrados {} tokens revogados", tokensRevogados.size());
        return tokensRevogados;
    }

    /**
     * Busca um token revogado pelo ID
     * @param id ID do token revogado
     * @return Optional contendo o token revogado se encontrado
     */
    public Optional<TokenRevogado> buscarPorId(Long id) {
        log.info("Buscando token revogado por ID: {}", id);
        Optional<TokenRevogado> tokenRevogado = tokenRevogadoRepository.findById(id);
        
        if (tokenRevogado.isPresent()) {
            log.info("Token revogado encontrado com ID: {}", id);
        } else {
            log.warn("Token revogado não encontrado com ID: {}", id);
        }
        
        return tokenRevogado;
    }

    /**
     * Salva um novo token revogado
     * @param dto DTO com dados do token revogado
     * @return Token revogado salvo
     */
    public TokenRevogado salvar(TokenRevogadoRequestDTO dto) {
        log.info("Salvando novo token revogado para usuário ID: {}", dto.getUsuarioId());
        
        // Busca o usuário
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(dto.getUsuarioId());
        if (usuarioOpt.isEmpty()) {
            log.error("Usuário não encontrado com ID: {}", dto.getUsuarioId());
            throw new IllegalArgumentException("Usuário não encontrado com ID: " + dto.getUsuarioId());
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verifica se o token já foi revogado
        if (tokenRevogadoRepository.existsByToken(dto.getToken().trim())) {
            log.warn("Token já foi revogado: {}", dto.getToken());
            throw new IllegalArgumentException("Token já foi revogado");
        }
        
        try {
            TokenRevogado tokenRevogado = TokenRevogadoMapper.toEntity(dto, usuario);
            TokenRevogado tokenRevogadoSalvo = tokenRevogadoRepository.save(tokenRevogado);
            log.info("Token revogado salvo com sucesso. ID: {}", tokenRevogadoSalvo.getId());
            return tokenRevogadoSalvo;
        } catch (Exception e) {
            log.error("Erro ao salvar token revogado: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao salvar token revogado", e);
        }
    }

    /**
     * Deleta um token revogado pelo ID
     * @param id ID do token revogado a ser deletado
     * @throws IllegalArgumentException se o token não for encontrado
     */
    public void deletar(Long id) {
        log.info("Tentando deletar token revogado com ID: {}", id);
        
        if (!tokenRevogadoRepository.existsById(id)) {
            log.warn("Token revogado não encontrado para deletar. ID: {}", id);
            throw new IllegalArgumentException("Token revogado não encontrado com ID: " + id);
        }
        
        try {
            tokenRevogadoRepository.deleteById(id);
            log.info("Token revogado deletado com sucesso. ID: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar token revogado com ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Erro ao deletar token revogado", e);
        }
    }

    /**
     * Verifica se um token foi revogado
     * @param token Token a ser verificado
     * @return true se o token foi revogado, false caso contrário
     */
    public boolean isTokenRevogado(String token) {
        log.debug("Verificando se token foi revogado: {}", token);
        return tokenRevogadoRepository.existsByToken(token.trim());
    }

    /**
     * Lista tokens revogados por usuário
     * @param idUsuario ID do usuário
     * @return Lista de tokens revogados do usuário
     */
    public List<TokenRevogado> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando tokens revogados para usuário ID: {}", idUsuario);
        List<TokenRevogado> tokensRevogados = tokenRevogadoRepository.findByUsuario_IdUsuario(idUsuario);
        log.info("Encontrados {} tokens revogados para usuário ID: {}", tokensRevogados.size(), idUsuario);
        return tokensRevogados;
    }
}
