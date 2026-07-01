package com.acessolivre.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.model.CodigoRecuperacaoSenha;

@Repository
public interface CodigoRecuperacaoSenhaRepository extends JpaRepository<CodigoRecuperacaoSenha, Long> {

    /**
     * Busca códigos de reset por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos de reset do usuário
     */
    List<CodigoRecuperacaoSenha> findByUsuario_IdUsuario(Long idUsuario);

    /**
     * Busca códigos não utilizados por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos não utilizados do usuário
     */
    List<CodigoRecuperacaoSenha> findByUsuario_IdUsuarioAndUsedFalse(Long idUsuario);

    /**
     * Busca códigos válidos (não expirados e não utilizados) por usuário
     * @param idUsuario ID do usuário
     * @param now Data atual
     * @return Lista de códigos válidos do usuário
     */
    List<CodigoRecuperacaoSenha> findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(Long idUsuario, LocalDateTime now);

    Optional<CodigoRecuperacaoSenha> findByCodeAndUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(
        String code,
        Long idUsuario,
        LocalDateTime now
    );

    long countByUsuario_IdUsuarioAndCreatedAtAfter(Long idUsuario, LocalDateTime createdAt);

    @Modifying
    @Transactional
    @Query("UPDATE CodigoRecuperacaoSenha p SET p.used = true WHERE p.usuario.idUsuario = :idUsuario AND p.used = false")
    int markAllAsUsedByUsuarioId(@Param("idUsuario") Long idUsuario);

    /**
     * Verifica se um código específico existe e está válido
     * @param code Código a ser verificado
     * @param now Data atual
     * @return true se o código existe e está válido, false caso contrário
     */
    boolean existsByCodeAndUsedFalseAndExpiresAtAfter(String code, LocalDateTime now);

    /**
     * Busca um código pelo código e usuário
     * @param code Código a ser buscado
     * @param idUsuario ID do usuário
     * @return Optional contendo o código se encontrado
     */
    Optional<CodigoRecuperacaoSenha> findByCodeAndUsuario_IdUsuario(String code, Long idUsuario);

    /**
     * Busca códigos expirados
     * @param now Data atual
     * @return Lista de códigos expirados
     */
    List<CodigoRecuperacaoSenha> findByExpiresAtBefore(LocalDateTime now);

    @Modifying
    @Transactional
    int deleteByExpiresAtBefore(LocalDateTime dataExpiracao);
}
