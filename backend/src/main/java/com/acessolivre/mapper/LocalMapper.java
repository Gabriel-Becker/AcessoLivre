package com.acessolivre.mapper;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.dto.response.LocalResumoResponseDTO;
import com.acessolivre.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.acessolivre.enums.StatusLocal;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LocalMapper {

    private final CategoriaMapper categoriaMapper;
    private final TipoAcessibilidadeMapper tipoAcessibilidadeMapper;
    private final EnderecoMapper enderecoMapper;
    
    public Local toEntity(LocalRequestDTO dto, Usuario usuario, Categoria categoria, 
                         TipoAcessibilidade tipoAcessibilidade, Endereco endereco,
                         Local localPrincipal) {
        return Local.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .imagem(dto.getImagem())
                .categoria(categoria)
                .tipoAcessibilidade(tipoAcessibilidade)
                .usuario(usuario)
                .endereco(endereco)
                .localPrincipal(localPrincipal)
                .status(dto.getStatus() != null ? dto.getStatus() : StatusLocal.EM_ANALISE)
                .avaliacaoMedia(0.0)
                .build();
    }

    public LocalResponseDTO toResponse(Local entity) {
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
                .categoria(categoriaMapper.toResponse(entity.getCategoria()))
                .tipoAcessibilidade(tipoAcessibilidadeMapper.toResponse(entity.getTipoAcessibilidade()))
                .idUsuario(entity.getUsuario().getIdUsuario())
                .nomeUsuario(entity.getUsuario().getNome())
                .endereco(enderecoMapper.toResponse(entity.getEndereco()))
                .dataCriacao(entity.getDataCriacao())
                .dataAtualizacao(entity.getDataAtualizacao())
                .nivelHierarquia(entity.getNivelHierarquia())
                .isRaiz(entity.isRaiz())
                .isFolha(entity.isFolha());
        
        // Adicionar informações do local principal
        if (entity.getLocalPrincipal() != null) {
            builder.idLocalPrincipal(entity.getLocalPrincipal().getIdLocal());
            builder.nomeLocalPrincipal(entity.getLocalPrincipal().getNome());
        }
        
        // Adicionar lista de sub-locais (resumida)
        if (entity.getSubLocais() != null && !entity.getSubLocais().isEmpty()) {
            builder.subLocais(entity.getSubLocais().stream()
                    .map(this::toResumoResponse)
                    .collect(Collectors.toList()));
        } else {
            builder.subLocais(Collections.emptyList());
        }
        
        return builder.build();
    }
    
    public LocalResumoResponseDTO toResumoResponse(Local entity) {
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
    
    public List<LocalResponseDTO> toResponseList(List<Local> entities) {
        if (entities == null) {
            return Collections.emptyList();
        }
        return entities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public void updateEntity(Local entity, LocalRequestDTO dto, Usuario usuario, 
                           Categoria categoria, TipoAcessibilidade tipoAcessibilidade, 
                           Endereco endereco, Local localPrincipal) {
        entity.setNome(dto.getNome());
        entity.setDescricao(dto.getDescricao());
        entity.setImagem(dto.getImagem());
        entity.setCategoria(categoria);
        entity.setTipoAcessibilidade(tipoAcessibilidade);
        entity.setUsuario(usuario);
        entity.setEndereco(endereco);
        entity.setLocalPrincipal(localPrincipal);
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
    }
}