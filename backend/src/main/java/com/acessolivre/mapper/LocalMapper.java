package com.acessolivre.mapper;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.dto.response.LocalResponseDTO;
import com.acessolivre.model.Categoria;
import com.acessolivre.model.Endereco;
import com.acessolivre.model.Local;
import com.acessolivre.model.TipoAcessibilidade;
import com.acessolivre.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LocalMapper {

    public static Local toEntity(LocalRequestDTO dto, Usuario usuario, Categoria categoria, 
                               TipoAcessibilidade tipoAcessibilidade, Endereco endereco) {
        return Local.builder()
                .nome(dto.getNome())
                .descricao(dto.getDescricao())
                .categoria(categoria)
                .tipoAcessibilidade(tipoAcessibilidade)
                .usuario(usuario)
                .endereco(endereco)
                .avaliacaoMedia(0.0) // Valor inicial
                .build();
    }

    public static LocalResponseDTO toResponse(Local entity) {
        if (entity == null) {
            return null;
        }

        return LocalResponseDTO.builder()
                .idLocal(entity.getIdLocal())
                .nome(entity.getNome())
                .descricao(entity.getDescricao())
                .avaliacaoMedia(entity.getAvaliacaoMedia())
                .categoria(CategoriaMapper.toResponse(entity.getCategoria()))
                .tipoAcessibilidade(TipoAcessibilidadeMapper.toResponse(entity.getTipoAcessibilidade()))
                .idUsuario(entity.getUsuario().getIdUsuario())
                .endereco(EnderecoMapper.toResponse(entity.getEndereco()))
                .build();
    }

    public static void updateEntity(Local entity, LocalRequestDTO dto, Usuario usuario, Categoria categoria,
                                  TipoAcessibilidade tipoAcessibilidade, Endereco endereco) {
        entity.setNome(dto.getNome());
        entity.setDescricao(dto.getDescricao());
        entity.setCategoria(categoria);
        entity.setTipoAcessibilidade(tipoAcessibilidade);
        entity.setUsuario(usuario);
        entity.setEndereco(endereco);
    }
}