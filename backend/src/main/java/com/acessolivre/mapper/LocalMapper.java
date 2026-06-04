package com.acessolivre.mapper;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.dto.response.LocalResumoResponseDTO;
import com.acessolivre.model.*;
import com.acessolivre.enums.StatusLocal;

import java.util.*;
import java.util.stream.Collectors;

public class LocalMapper {

    private LocalMapper() {}

    public static Local toEntity(LocalRequestDTO dto, Usuario usuario, Endereco endereco) {
        Local local = Local.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .categoria(dto.getCategoria())
                .usuario(usuario)
                .endereco(endereco)
                .status(dto.getStatus() != null ? dto.getStatus() : StatusLocal.EM_ANALISE)
                .avaliacaoMedia(0.0)
                .localPrincipal(null)
                .tiposAcessibilidade(new HashSet<>())
                .nomeLocalPrincipal(dto.getNomeLocalPrincipal())
                .build();
        
        if (dto.getTiposAcessibilidade() != null && !dto.getTiposAcessibilidade().isEmpty()) {
            local.getTiposAcessibilidade().addAll(dto.getTiposAcessibilidade());
        }
        
        return local;
    }

    public static LocalResponseDTO toResponse(Local entity) {
        if (entity == null) {
            return null;
        }

        // ===== PROCESSAR IMAGENS =====
        List<ImagemResponseDTO> imagensDTO = new ArrayList<>();
        String imagemUrl = null;
        
        if (entity.getImagens() != null && !entity.getImagens().isEmpty()) {
            // Ordena as imagens por ordem
            List<Imagem> imagensOrdenadas = entity.getImagens().stream()
                    .sorted(Comparator.comparing(Imagem::getOrdem, Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());
            
            // Converte todas as imagens para DTO
            imagensDTO = imagensOrdenadas.stream()
                    .map(ImagemMapper::toResponse)
                    .collect(Collectors.toList());
            
            Imagem primeiraImagem = imagensOrdenadas.get(0);
            ImagemResponseDTO primeiraImagemDTO = ImagemMapper.toResponse(primeiraImagem);
            if (primeiraImagemDTO != null) {
                imagemUrl = primeiraImagemDTO.getUrlCompleta();
            }
        }

        LocalResponseDTO.LocalResponseDTOBuilder builder = LocalResponseDTO.builder()
                .idLocal(entity.getIdLocal())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .imagemUrl(imagemUrl)
                .avaliacaoMedia(entity.getAvaliacaoMedia())
                .status(entity.getStatus())
                .categoria(entity.getCategoria())
                .tiposAcessibilidade(entity.getTiposAcessibilidade() != null ? 
                        new HashSet<>(entity.getTiposAcessibilidade()) : new HashSet<>())
                .idUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null)
                .nomeUsuario(entity.getUsuario() != null ? entity.getUsuario().getNome() : null)
                .endereco(EnderecoMapper.toResponse(entity.getEndereco()))
                .dataCriacao(entity.getDataCriacao())
                .dataAtualizacao(entity.getDataAtualizacao())
                .nivelHierarquia(entity.getNivelHierarquia())
                .isRaiz(entity.isRaiz())
                .isFolha(entity.isFolha())
                .imagens(imagensDTO)
                .totalImagens(imagensDTO.size())
                .nomeLocalPrincipal(entity.getNomeLocalPrincipal());

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
        
        String imagemUrl = null;
        if (entity.getImagens() != null && !entity.getImagens().isEmpty()) {
            Imagem primeiraImagem = entity.getImagens().stream()
                    .sorted(Comparator.comparing(Imagem::getOrdem, Comparator.nullsLast(Comparator.naturalOrder())))
                    .findFirst()
                    .orElse(null);
            if (primeiraImagem != null) {
                ImagemResponseDTO primeiraImagemDTO = ImagemMapper.toResponse(primeiraImagem);
                if (primeiraImagemDTO != null) {
                    imagemUrl = primeiraImagemDTO.getUrlCompleta();
                }
            }
        }
        
        return LocalResumoResponseDTO.builder()
                .idLocal(entity.getIdLocal())
                .nome(entity.getNome())
                .imagem(imagemUrl)
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
        entity.setCategoria(dto.getCategoria());
        entity.setUsuario(usuario);
        entity.setEndereco(endereco);
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        
        entity.getTiposAcessibilidade().clear();
        if (dto.getTiposAcessibilidade() != null && !dto.getTiposAcessibilidade().isEmpty()) {
            entity.getTiposAcessibilidade().addAll(dto.getTiposAcessibilidade());
        }
        
        // Atualiza o nome do local principal
        entity.setNomeLocalPrincipal(dto.getNomeLocalPrincipal());
    }
}