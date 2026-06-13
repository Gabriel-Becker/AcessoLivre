package com.acessolivre.mapper;

import org.springframework.stereotype.Component;

import com.acessolivre.dto.request.EnderecoRequestDTO;
import com.acessolivre.dto.response.EnderecoResponseDTO;
import com.acessolivre.model.Endereco;
import com.acessolivre.model.Usuario;

@Component
public class EnderecoMapper {

    public static Endereco toEntity(EnderecoRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
      
        Usuario usuario = Usuario.builder()
                .idUsuario(dto.getIdUsuario())
                .build();
        
        return Endereco.builder()
                .cep(dto.getCep())
                .logradouro(dto.getLogradouro())
                .numero(dto.getNumero())
                .complemento(dto.getComplemento())
                .bairro(dto.getBairro())
                .cidade(dto.getCidade())
                .estado(dto.getEstado())
                .usuario(usuario)
                .build();
    }

    public static EnderecoResponseDTO toResponse(Endereco entity) {
        if (entity == null) {
            return null;
        }
        
        return EnderecoResponseDTO.builder()
                .idEndereco(entity.getIdEndereco())
                .idUsuario(entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null)
                .cep(entity.getCep())
                .logradouro(entity.getLogradouro())
                .numero(entity.getNumero())
                .complemento(entity.getComplemento())
                .bairro(entity.getBairro())
                .cidade(entity.getCidade())
                .estado(entity.getEstado())
                .build();
    }
}
