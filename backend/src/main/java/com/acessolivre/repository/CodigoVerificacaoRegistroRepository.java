package com.acessolivre.repository;

import com.acessolivre.model.CodigoVerificacaoRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CodigoVerificacaoRegistroRepository extends JpaRepository<CodigoVerificacaoRegistro, Long> {
    Optional<CodigoVerificacaoRegistro> findByEmailAndCodigoAndUsadoFalseAndDataExpiracaoAfter(String email, String codigo, LocalDateTime agora);

    @Modifying
    void deleteByEmail(String email);

    @Modifying
    void deleteByDataExpiracaoBefore(LocalDateTime limite);
}
