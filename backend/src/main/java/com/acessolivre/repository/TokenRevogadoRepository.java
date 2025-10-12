package com.acessolivre.repository;

import com.acessolivre.model.TokenRevogado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRevogadoRepository extends JpaRepository<TokenRevogado, Long> {

    /**
     * Busca tokens revogados por usuário
     * @param idUsuario ID do usuário
     * @return Lista de tokens revogados do usuário
     */
    List<TokenRevogado> findByUsuario_IdUsuario(Long idUsuario);

    /**
     * Verifica se um token específico foi revogado
     * @param token Token a ser verificado
     * @return true se o token foi revogado, false caso contrário
     */
    boolean existsByToken(String token);

    /**
     * Busca um token revogado pelo token
     * @param token Token a ser buscado
     * @return Optional contendo o token revogado se encontrado
     */
    Optional<TokenRevogado> findByToken(String token);
}
