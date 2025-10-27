package com.acessolivre.repository;

import com.acessolivre.model.TipoAcessibilidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoAcessibilidadeRepository extends JpaRepository<TipoAcessibilidade, Long> {
}