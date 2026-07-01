package com.acessolivre.repository;

import com.acessolivre.model.RegistroPendente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RegistroPendenteRepository extends JpaRepository<RegistroPendente, Long> {
    Optional<RegistroPendente> findByEmail(String email);

    @Modifying
    void deleteByEmail(String email);

    @Modifying
    void deleteByDataExpiracaoBefore(LocalDateTime limite);
}
