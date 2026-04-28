package com.acessolivre.mapper;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.dto.response.LocalResumoResponseDTO;
import com.acessolivre.model.*;
import com.acessolivre.enums.StatusLocal;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

public class LocalMapper {

    private LocalMapper() {}

    public static Local toEntity(LocalRequestDTO dto, Usuario usuario, Endereco endereco) {
        Local local = Local.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .imagem(dto.getImagem())
                .categoria(dto.getCategoria())
                .usuario(usuario)
                .endereco(endereco)
                .status(dto.getStatus() != null ? dto.getStatus() : StatusLocal.EM_ANALISE)
                .avaliacaoMedia(0.0)
                .localPrincipal(null)
                .tiposAcessibilidade(new HashSet<>())
                .build();
        
        // Adicionar tipos de acessibilidade
        if (dto.getTiposAcessibilidade() != null && !dto.getTiposAcessibilidade().isEmpty()) {
            local.getTiposAcessibilidade().addAll(dto.getTiposAcessibilidade());
        }
        
        return local;
    }

    public static LocalResponseDTO toResponse(Local entity) {
        if (entity == null) {
            return null;
        }

        LocalResponseDTO.LocalResponseDTOBuilder builder = LocalResponseDTO.builder()
                .idLocal(entity.getIdLocal())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .imagem(entity.getImagem())
                .avaliacaoMedia(entity.getAvaliacaoMedia())
                .status(entity.getStatus())
                .categoria(entity.getCategoria())
                .tiposAcessibilidade(entity.getTiposAcessibilidade() != null ? 
                        new HashSet<>(entity.getTiposAcessibilidade()) : new HashSet<>())
                .idUsuario(entity.getUsuario().getIdUsuario())
                .nomeUsuario(entity.getUsuario().getNome())
                .endereco(EnderecoMapper.toResponse(entity.getEndereco()))
                .dataCriacao(entity.getDataCriacao())
                .dataAtualizacao(entity.getDataAtualizacao())
                .nivelHierarquia(entity.getNivelHierarquia())
                .isRaiz(entity.isRaiz())
                .isFolha(entity.isFolha());

        if (entity.getLocalPrincipal() != null) {
            builder.idLocalPrincipal(entity.getLocalPrincipal().getIdLocal());
            builder.nomeLocalPrincipal(entity.getLocalPrincipal().getNome());
        }

        if (entity.getSubLocais() != null && !entity.getSubLocais().isEmpty()) {
            builder.subLocais(entity.getSubLocais().stream()
                    .map(LocalMapper::toResumoResponse)
                    .collect(Collectors.toList()));
        } else {
            builder.subLocais(Collections.emptyList());
        }

        return builder.build();
    }

    public static LocalResumoResponseDTO toResumoResponse(Local entity) {
        if (entity == null) {
            return null;
        }
        return LocalResumoResponseDTO.builder()
                .idLocal(entity.getIdLocal())
                .nome(entity.getNome())
                .imagem(entity.getImagem())
                .avaliacaoMedia(entity.getAvaliacaoMedia())
                .status(entity.getStatus())
                .build();
    }

    public static List<LocalResponseDTO> toResponseList(List<Local> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
    }

    public static void updateEntity(Local entity, LocalRequestDTO dto, Usuario usuario, Endereco endereco) {
        entity.setNome(dto.getNome());
        entity.setDescricao(dto.getDescricao());
        entity.setImagem(dto.getImagem());
        entity.setCategoria(dto.getCategoria());
        entity.setUsuario(usuario);
        entity.setEndereco(endereco);
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        
        // Atualizar tipos de acessibilidade
        entity.getTiposAcessibilidade().clear();
        if (dto.getTiposAcessibilidade() != null && !dto.getTiposAcessibilidade().isEmpty()) {
            entity.getTiposAcessibilidade().addAll(dto.getTiposAcessibilidade());
        }
    }
}