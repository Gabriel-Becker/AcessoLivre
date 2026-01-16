package com.acessolivre.repository;

import com.acessolivre.model.CodigoVerificacaoEmail;
import com.acessolivre.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CodigoVerificacaoEmailRepository extends JpaRepository<CodigoVerificacaoEmail, Long> {
    
    Optional<CodigoVerificacaoEmail> findByCodigoAndUsadoFalseAndDataExpiracaoAfter(
        String codigo, 
        LocalDateTime dataAtual
    );
    
    void deleteByUsuario(Usuario usuario);
    
    void deleteByDataExpiracaoBefore(LocalDateTime dataLimite);
}
