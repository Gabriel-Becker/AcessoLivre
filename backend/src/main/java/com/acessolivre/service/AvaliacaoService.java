package com.acessolivre.service;

import com.acessolivre.dto.request.AvaliacaoRequestDTO;
import com.acessolivre.mapper.AvaliacaoMapper;
import com.acessolivre.model.Avaliacao;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.AvaliacaoRepository;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LocalRepository localRepository;

    public List<Avaliacao> listarTodos() {
        log.info("Listando todas as avaliações");
        return avaliacaoRepository.findAll();
    }

    public Optional<Avaliacao> buscarPorId(Long id) {
        log.info("Buscando avaliação por ID: {}", id);
        return avaliacaoRepository.findById(id);
    }

    public List<Avaliacao> buscarPorLocal(Long idLocal) {
        log.info("Buscando avaliações por local ID: {}", idLocal);
        return avaliacaoRepository.findByLocalIdLocal(idLocal);
    }

    public List<Avaliacao> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando avaliações por usuário ID: {}", idUsuario);
        return avaliacaoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public List<Avaliacao> listarPublicas() {
        log.info("Listando avaliações públicas (moderadas)");
        return avaliacaoRepository.findByModerado(true);
    }

    public List<Avaliacao> buscarPublicasPorLocal(Long idLocal) {
        log.info("Buscando avaliações públicas por local ID: {}", idLocal);
        return avaliacaoRepository.findByLocalIdLocalAndModerado(idLocal, true);
    }

    @Transactional
    public Avaliacao salvar(AvaliacaoRequestDTO dto) {
        log.info("Salvando nova avaliação para local ID: {} por usuário ID: {}", dto.getIdLocal(), dto.getIdUsuario());

        if (avaliacaoRepository.existsByUsuarioIdUsuarioAndLocalIdLocal(dto.getIdUsuario(), dto.getIdLocal())) {
            throw new IllegalArgumentException("Usuário já avaliou este local");
        }

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Local local = localRepository.findById(dto.getIdLocal())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));

        double media = ((double) dto.getNotaAcessibilidadeVisual()
                + dto.getNotaAcessibilidadeMotora()
                + dto.getNotaAcessibilidadeAuditiva()) / 3.0;

        boolean moderado = (dto.getComentario() == null || dto.getComentario().isBlank());

        Avaliacao avaliacao = AvaliacaoMapper.toEntity(dto, usuario, local, media, moderado);

        return avaliacaoRepository.save(avaliacao);
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando avaliação ID: {}", id);
        if (!avaliacaoRepository.existsById(id)) {
            return false;
        }
        avaliacaoRepository.deleteById(id);
        return true;
    }
}
