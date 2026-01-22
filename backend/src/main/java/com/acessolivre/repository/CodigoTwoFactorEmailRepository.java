package com.acessolivre.repository;

import com.acessolivre.model.CodigoTwoFactorEmail;
import com.acessolivre.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CodigoTwoFactorEmailRepository extends JpaRepository<CodigoTwoFactorEmail, Long> {

    @Modifying
    void deleteByUsuario(Usuario usuario);

    @Modifying
    void deleteByDataExpiracaoBefore(LocalDateTime limite);

    Optional<CodigoTwoFactorEmail> findFirstByUsuarioAndCodigoAndUsadoFalseAndDataExpiracaoAfter(Usuario usuario, String codigo, LocalDateTime agora);
}
