package com.example.acessolivre.repository;

import com.example.acessolivre.model.UsuarioAutenticar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioAutenticarRepository extends JpaRepository<UsuarioAutenticar, Long> {

    /**
     * Busca dados de autenticação pelo ID do usuário
     * @param idUsuario ID do usuário
     * @return Optional contendo os dados de autenticação se encontrados
     */
    Optional<UsuarioAutenticar> findByUsuario_IdUsuario(Long idUsuario);
}
