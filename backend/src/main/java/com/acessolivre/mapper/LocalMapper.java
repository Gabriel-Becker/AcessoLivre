package com.acessolivre.mapper;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.dto.response.LocalResumoResponseDTO;
import com.acessolivre.model.*;
import com.acessolivre.enums.StatusLocal;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para a entidade Local.
 * Agora trabalha com os enums Categoria e TipoAcessibilidade diretamente,
 * sem depender de repositórios ou mapeadores externos.
 */
public class LocalMapper {

    // Construtor privado para classe utilitária
    private LocalMapper() {}

    /**
     * Converte um DTO de requisição em uma entidade Local.
     * @param dto DTO com os dados do local
     * @param usuario Usuario proprietário do local
     * @param endereco Endereço associado (já salvo ou a ser salvo)
     * @return Entidade Local pronta para persistência
     */
    public static Local toEntity(LocalRequestDTO dto, Usuario usuario, Endereco endereco) {
        return Local.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .imagem(dto.getImagem())
                .categoria(dto.getCategoria())               
                .tipoAcessibilidade(dto.getTipoAcessibilidade()) 
                .usuario(usuario)
                .endereco(endereco)
                .status(dto.getStatus() != null ? dto.getStatus() : StatusLocal.EM_ANALISE)
                .avaliacaoMedia(0.0)
                .localPrincipal(null)   
                .build();
    }

    /**
     * Converte uma entidade Local em um DTO de resposta completo.
     * @param entity Entidade Local
     * @return DTO de resposta
     */
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
                .tipoAcessibilidade(entity.getTipoAcessibilidade())   
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

        // Sublocais (apenas resumo)
        if (entity.getSubLocais() != null && !entity.getSubLocais().isEmpty()) {
            builder.subLocais(entity.getSubLocais().stream()
                    .map(LocalMapper::toResumoResponse)
                    .collect(Collectors.toList()));
        } else {
            builder.subLocais(Collections.emptyList());
        }

        return builder.build();
    }

    /**
     * Converte uma entidade Local em um DTO resumido (sem hierarquia completa).
     * @param entity Entidade Local
     * @return DTO resumido
     */
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

    /**
     * Converte uma lista de entidades em uma lista de DTOs de resposta.
     * @param entities Lista de entidades
     * @return Lista de DTOs
     */
    public static List<LocalResponseDTO> toResponseList(List<Local> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(LocalMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * @param entity Entidade a ser atualizada
     * @param dto DTO com os novos dados
     * @param usuario Novo usuário proprietário (se houver alteração)
     * @param endereco Novo endereço (se houver alteração)
     */
    public static void updateEntity(Local entity, LocalRequestDTO dto, Usuario usuario, Endereco endereco) {
        entity.setNome(dto.getNome());
        entity.setDescricao(dto.getDescricao());
        entity.setImagem(dto.getImagem());
        entity.setCategoria(dto.getCategoria());             
        entity.setTipoAcessibilidade(dto.getTipoAcessibilidade()); 
        entity.setUsuario(usuario);
        entity.setEndereco(endereco);
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
       
    }
}