package com.acessolivre.service;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.model.*;
import com.acessolivre.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public List<Local> listarTodos() {
        log.info("Listando todos os locais");
        return localRepository.findAll();
    }

    public Optional<Local> buscarPorId(Long id) {
        log.info("Buscando local por ID: {}", id);
        return localRepository.findById(id);
    }

    public List<Local> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando locais por usuário ID: {}", idUsuario);
        return localRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public List<Local> buscarPorCategoria(Long idCategoria) {
        log.info("Buscando locais por categoria ID: {}", idCategoria);
        return localRepository.findByCategoriaIdCategoria(idCategoria);
    }

    public List<Local> buscarPorTipoAcessibilidade(Long idTipoAcessibilidade) {
        log.info("Buscando locais por tipo de acessibilidade ID: {}", idTipoAcessibilidade);
        return localRepository.findByTipoAcessibilidadeIdTipoAcessibilidade(idTipoAcessibilidade);
    }

    @Transactional
    public Local salvar(LocalRequestDTO dto) {
        log.info("Salvando novo local com nome: {}", dto.getNome());

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Categoria categoria = categoriaRepository.findById(dto.getIdCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

        TipoAcessibilidade tipoAcessibilidade = tipoAcessibilidadeRepository.findById(dto.getIdTipoAcessibilidade())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de acessibilidade não encontrado"));

        Endereco endereco = enderecoRepository.findById(dto.getIdEndereco())
                .orElseThrow(() -> new IllegalArgumentException("Endereço não encontrado"));

        Local local = com.acessolivre.mapper.LocalMapper.toEntity(dto, usuario, categoria, tipoAcessibilidade, endereco);
        return localRepository.save(local);
    }

    @Transactional
    public Optional<Local> atualizar(Long id, LocalRequestDTO dto) {
        log.info("Atualizando local ID: {}", id);

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
            return localRepository.save(local);
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando local ID: {}", id);
        
        if (!localRepository.existsById(id)) {
            return false;
        }

        localRepository.deleteById(id);
        return true;
    }
}