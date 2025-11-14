package com.acessolivre.repository;

import com.acessolivre.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    boolean existsByUsuarioIdUsuarioAndLocalIdLocal(Long idUsuario, Long idLocal);

    List<Avaliacao> findByLocalIdLocal(Long idLocal);

    List<Avaliacao> findByLocalIdLocalAndModerado(Long idLocal, Boolean moderado);

    List<Avaliacao> findByUsuarioIdUsuario(Long idUsuario);

    List<Avaliacao> findByModerado(Boolean moderado);
}
