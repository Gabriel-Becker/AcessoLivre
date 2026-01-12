package com.acessolivre.service;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.model.*;
import com.acessolivre.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalService {

    private final LocalRepository localRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final TipoAcessibilidadeRepository tipoAcessibilidadeRepository;
    private final EnderecoRepository enderecoRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    @Transactional(readOnly = true)
    public Page<Local> listarTodos(Pageable pageable) {
        log.info("Listando locais com paginação: página={}, tamanho={}", pageable.getPageNumber(), pageable.getPageSize());
        return localRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Local> buscarPorId(Long id) {
        log.info("Buscando local por ID: {}", id);
        return localRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Local> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando locais por usuário ID: {}", idUsuario);
        return localRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @Transactional(readOnly = true)
    public List<Local> buscarPorCategoria(Long idCategoria) {
        log.info("Buscando locais por categoria ID: {}", idCategoria);
        return localRepository.findByCategoriaIdCategoria(idCategoria);
    }

    @Transactional(readOnly = true)
    public List<Local> buscarPorTipoAcessibilidade(Long idTipoAcessibilidade) {
        log.info("Buscando locais por tipo de acessibilidade ID: {}", idTipoAcessibilidade);
        return localRepository.findByTipoAcessibilidadeIdTipoAcessibilidade(idTipoAcessibilidade);
    }

    @Transactional
    public Local salvar(LocalRequestDTO dto) {
        log.info("Salvando novo local: nome={}", dto.getNome());

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

        TipoAcessibilidade tipoAcessibilidade = tipoAcessibilidadeRepository.findById(dto.getIdTipoAcessibilidade())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de acessibilidade não encontrado"));

        Endereco endereco = enderecoRepository.findById(dto.getIdEndereco())
                .orElseThrow(() -> new IllegalArgumentException("Endereço não encontrado"));

        Local local = com.acessolivre.mapper.LocalMapper.toEntity(dto, usuario, categoria, tipoAcessibilidade, endereco);
        Local salvo = localRepository.save(local);
        log.info("Local salvo: id={}", salvo.getIdLocal());
        return salvo;
    }

    @Transactional
    public Optional<Local> atualizar(Long id, LocalRequestDTO dto) {
        log.info("Atualizando local: id={}", id);

        return localRepository.findById(id).map(local -> {
            Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

            TipoAcessibilidade tipoAcessibilidade = tipoAcessibilidadeRepository.findById(dto.getIdTipoAcessibilidade())
                    .orElseThrow(() -> new IllegalArgumentException("Tipo de acessibilidade não encontrado"));

            Endereco endereco = enderecoRepository.findById(dto.getIdEndereco())
                    .orElseThrow(() -> new IllegalArgumentException("Endereço não encontrado"));

            com.acessolivre.mapper.LocalMapper.updateEntity(local, dto, usuario, categoria, tipoAcessibilidade, endereco);
            Local atualizado = localRepository.save(local);
            log.info("Local atualizado: id={}", atualizado.getIdLocal());
            return atualizado;
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando local: id={}", id);
        
        if (!localRepository.existsById(id)) {
            return false;
        }

        localRepository.deleteById(id);
        return true;
    }

    @Transactional
    public void recalcularMediaAvaliacoes(Long idLocal) {
        log.info("Recalculando média de avaliações para local ID: {}", idLocal);
        
        Local local = localRepository.findById(idLocal)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));

        Double media = avaliacaoRepository.calcularMediaPorLocal(idLocal);
        
        // Define média como 0.0 se não houver avaliações, caso contrário usa a média calculada
        local.setAvaliacaoMedia(media != null ? media : 0.0);
        
        localRepository.save(local);
        log.info("Média de avaliações atualizada para local ID {}: {}", idLocal, local.getAvaliacaoMedia());
    }
}