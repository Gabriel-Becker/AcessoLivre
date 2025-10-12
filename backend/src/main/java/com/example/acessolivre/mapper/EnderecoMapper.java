package com.example.acessolivre.mapper;

import com.example.acessolivre.dto.request.EnderecoRequestDTO;
import com.example.acessolivre.dto.response.EnderecoResponseDTO;
import com.example.acessolivre.model.Endereco;
import com.example.acessolivre.model.Usuario;

public class EnderecoMapper {

    /**
     * Converte EnderecoRequestDTO para entidade Endereco
     * @param dto DTO de requisição
     * @return Entidade Endereco
     */
    public static Endereco toEntity(EnderecoRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        
        // Cria um objeto Usuario com apenas o ID para o relacionamento
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

    /**
     * Converte entidade Endereco para EnderecoResponseDTO
     * @param entity Entidade Endereco
     * @return DTO de resposta
     */
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
