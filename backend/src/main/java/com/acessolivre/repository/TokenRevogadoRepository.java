package com.acessolivre.repository;

import com.acessolivre.model.TokenRevogado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRevogadoRepository extends JpaRepository<TokenRevogado, Long> {

    List<TokenRevogado> findByUsuario_IdUsuario(Long idUsuario);

    boolean existsByToken(String token);

    Optional<TokenRevogado> findByToken(String token);

    @Modifying
    @Transactional
    int deleteByExpiracaoBefore(LocalDateTime dataExpiracao);
}
