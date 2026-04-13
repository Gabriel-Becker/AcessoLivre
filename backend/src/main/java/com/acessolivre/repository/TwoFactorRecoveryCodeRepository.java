package com.acessolivre.repository;

import com.acessolivre.model.TwoFactorRecoveryCode;
import com.acessolivre.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TwoFactorRecoveryCodeRepository extends JpaRepository<TwoFactorRecoveryCode, Long> {

    void deleteByUsuario(Usuario usuario);

    /**
     * Busca códigos de recuperação por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos de recuperação do usuário
     */
    List<TwoFactorRecoveryCode> findByUsuario_IdUsuario(Long idUsuario);

    /**
     * Busca códigos não utilizados por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos não utilizados do usuário
     */
    List<TwoFactorRecoveryCode> findByUsuario_IdUsuarioAndUtilizadoFalse(Long idUsuario);

    /**
     * Busca códigos válidos (não expirados e não utilizados) por usuário
     * @param idUsuario ID do usuário
     * @param now Data atual
     * @return Lista de códigos válidos do usuário
     */
    List<TwoFactorRecoveryCode> findByUsuario_IdUsuarioAndUtilizadoFalseAndDataExpiracaoAfter(Long idUsuario, LocalDateTime now);

    /**
     * Verifica se um código específico existe e está válido
     * @param codigo Código a ser verificado
     * @param now Data atual
     * @return true se o código existe e está válido, false caso contrário
     */
    boolean existsByCodigoAndUtilizadoFalseAndDataExpiracaoAfter(String codigo, LocalDateTime now);

    /**
     * Busca um código pelo código e usuário
     * @param codigo Código a ser buscado
     * @param idUsuario ID do usuário
     * @return Optional contendo o código se encontrado
     */
    Optional<TwoFactorRecoveryCode> findByCodigoAndUsuario_IdUsuario(String codigo, Long idUsuario);

    /**
     * Busca códigos expirados
     * @param now Data atual
     * @return Lista de códigos expirados
     */
    List<TwoFactorRecoveryCode> findByDataExpiracaoBefore(LocalDateTime now);
}
