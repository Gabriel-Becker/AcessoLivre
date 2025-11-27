package com.acessolivre.service;

import com.acessolivre.dto.request.TokenRevogadoRequestDTO;
import com.acessolivre.mapper.TokenRevogadoMapper;
import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TokenRevogadoRepository;
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

    public List<TokenRevogado> listarTodos() {
        log.info("Listando todos os tokens revogados");
        return tokenRevogadoRepository.findAll();
    }

    public Optional<TokenRevogado> buscarPorId(Long id) {
        log.info("Buscando token revogado: id={}", id);
        return tokenRevogadoRepository.findById(id);
    }

    public TokenRevogado salvar(TokenRevogadoRequestDTO dto) {
        log.info("Salvando token revogado: usuarioId={}", dto.getUsuarioId());
        
        Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(dto.getUsuarioId());
        if (usuarioOpt.isEmpty()) {
            log.warn("Usuário não encontrado: id={}", dto.getUsuarioId());
            throw new IllegalArgumentException("Usuário não encontrado");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        if (tokenRevogadoRepository.existsByToken(dto.getToken().trim())) {
            log.warn("Token já revogado");
            throw new IllegalArgumentException("Token já foi revogado");
        }
        
        TokenRevogado tokenRevogado = TokenRevogadoMapper.toEntity(dto, usuario);
        TokenRevogado salvo = tokenRevogadoRepository.save(tokenRevogado);
        log.info("Token revogado salvo: id={}", salvo.getId());
        return salvo;
    }

    public void deletar(Long id) {
        log.info("Deletando token revogado: id={}", id);
        
        if (!tokenRevogadoRepository.existsById(id)) {
            log.warn("Token revogado não encontrado: id={}", id);
            throw new IllegalArgumentException("Token revogado não encontrado");
        }
        
        tokenRevogadoRepository.deleteById(id);
        log.info("Token revogado deletado: id={}", id);
    }

    public boolean isTokenRevogado(String token) {
        return tokenRevogadoRepository.existsByToken(token.trim());
    }

    public List<TokenRevogado> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando tokens revogados: usuarioId={}", idUsuario);
        return tokenRevogadoRepository.findByUsuario_IdUsuario(idUsuario);
    }
}
