package com.acessolivre.repository;

import com.acessolivre.model.PendingUsuarioRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PendingUsuarioRegistroRepository extends JpaRepository<PendingUsuarioRegistro, Long> {
    Optional<PendingUsuarioRegistro> findByEmail(String email);

    @Modifying
    void deleteByEmail(String email);

    @Modifying
    void deleteByDataExpiracaoBefore(LocalDateTime limite);
}
