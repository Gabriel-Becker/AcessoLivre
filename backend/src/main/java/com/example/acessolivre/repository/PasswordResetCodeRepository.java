package com.example.acessolivre.repository;

import com.example.acessolivre.model.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {

    /**
     * Busca códigos de reset por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos de reset do usuário
     */
    List<PasswordResetCode> findByUsuario_IdUsuario(Long idUsuario);

    /**
     * Busca códigos não utilizados por usuário
     * @param idUsuario ID do usuário
     * @return Lista de códigos não utilizados do usuário
     */
    List<PasswordResetCode> findByUsuario_IdUsuarioAndUsedFalse(Long idUsuario);

    /**
     * Busca códigos válidos (não expirados e não utilizados) por usuário
     * @param idUsuario ID do usuário
     * @param now Data atual
     * @return Lista de códigos válidos do usuário
     */
    List<PasswordResetCode> findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(Long idUsuario, LocalDateTime now);

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
    Optional<PasswordResetCode> findByCodeAndUsuario_IdUsuario(String code, Long idUsuario);

    /**
     * Busca um código pelo CPF e código
     * @param cpf CPF do usuário
     * @param code Código a ser buscado
     * @return Optional contendo o código se encontrado
     */
    Optional<PasswordResetCode> findByCpfAndCode(String cpf, String code);

    /**
     * Busca códigos válidos por CPF
     * @param cpf CPF do usuário
     * @param now Data atual
     * @return Lista de códigos válidos para o CPF
     */
    List<PasswordResetCode> findByCpfAndUsedFalseAndExpiresAtAfter(String cpf, LocalDateTime now);

    /**
     * Busca códigos expirados
     * @param now Data atual
     * @return Lista de códigos expirados
     */
    List<PasswordResetCode> findByExpiresAtBefore(LocalDateTime now);

    /**
     * Verifica se existe código válido para o CPF
     * @param cpf CPF do usuário
     * @param now Data atual
     * @return true se existe código válido, false caso contrário
     */
    boolean existsByCpfAndUsedFalseAndExpiresAtAfter(String cpf, LocalDateTime now);
}
