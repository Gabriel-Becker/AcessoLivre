package com.acessolivre.repository;

import com.acessolivre.model.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalRepository extends JpaRepository<Local, Long> {
    List<Local> findByUsuarioIdUsuario(Long idUsuario);
    List<Local> findByCategoriaIdCategoria(Long idCategoria);
    List<Local> findByTipoAcessibilidadeIdTipoAcessibilidade(Long idTipoAcessibilidade);
}