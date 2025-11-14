package com.acessolivre.repository;

import com.acessolivre.model.Imagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImagemRepository extends JpaRepository<Imagem, Long> {
    List<Imagem> findByLocalIdLocal(Long idLocal);
}
