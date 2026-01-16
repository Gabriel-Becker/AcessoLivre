package com.acessolivre.repository;

import com.acessolivre.model.CodigoRecuperacaoDoisFatores;
import com.acessolivre.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodigoRecuperacaoDoisFatoresRepository extends JpaRepository<CodigoRecuperacaoDoisFatores, Long> {
    List<CodigoRecuperacaoDoisFatores> findByUsuarioAndUsadoFalse(Usuario usuario);
    Optional<CodigoRecuperacaoDoisFatores> findByCodigoAndUsadoFalse(String codigo);
    void deleteByUsuario(Usuario usuario);
}