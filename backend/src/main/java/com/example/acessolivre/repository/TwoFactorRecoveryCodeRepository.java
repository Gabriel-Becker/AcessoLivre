package com.example.acessolivre.repository;

import com.example.acessolivre.model.TwoFactorRecoveryCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TwoFactorRecoveryCodeRepository extends JpaRepository<TwoFactorRecoveryCode, Long> {

    /**
     * Busca códigos de recuperação por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos de recuperação do usuário
     */
    List<TwoFactorRecoveryCode> findByUsuarioIdUsuario(Long idUsuario);

    /**
     * Busca códigos não utilizados por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos não utilizados do usuário
     */
    List<TwoFactorRecoveryCode> findByUsuarioIdUsuarioAndUsedFalse(Long idUsuario);

    /**
     * Busca códigos válidos (não expirados e não utilizados) por usuário
     * @param idUsuario ID do usuário
     * @param now Data atual
     * @return Lista de códigos válidos do usuário
     */
    List<TwoFactorRecoveryCode> findByUsuarioIdUsuarioAndUsedFalseAndExpiresAtAfter(Long idUsuario, LocalDateTime now);

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
    Optional<TwoFactorRecoveryCode> findByCodeAndUsuarioIdUsuario(String code, Long idUsuario);

    /**
     * Busca códigos expirados
     * @param now Data atual
     * @return Lista de códigos expirados
     */
    List<TwoFactorRecoveryCode> findByExpiresAtBefore(LocalDateTime now);
}
