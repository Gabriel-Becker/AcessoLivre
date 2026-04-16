package com.acessolivre.repository;

import com.acessolivre.model.Local;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.TipoAcessibilidade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocalRepository extends JpaRepository<Local, Long> {
    
    List<Local> findByUsuarioIdUsuario(Long idUsuario);
 
    List<Local> findByCategoria(Categoria categoria);
 
    List<Local> findByTipoAcessibilidade(TipoAcessibilidade tipoAcessibilidade);
    
    Page<Local> findByStatus(StatusLocal status, Pageable pageable);
    
    List<Local> findByLocalPrincipalIsNull();
    
    List<Local> findByLocalPrincipalIdLocal(Long idLocalPrincipal);
    
    Optional<Local> findByIdLocalAndLocalPrincipalIsNull(Long idLocal);
    
    Page<Local> findByLocalPrincipalIsNull(Pageable pageable);
    Page<Local> findByLocalPrincipalIdLocal(Long idLocalPrincipal, Pageable pageable);
    
    @Query(value = """
        WITH RECURSIVE hierarquia AS (
            SELECT * FROM local WHERE idlocal = :idLocal
            UNION ALL
            SELECT l.* FROM local l
            INNER JOIN hierarquia h ON l.idlocal_principal = h.idlocal
        )
        SELECT * FROM hierarquia WHERE idlocal != :idLocal
        """, nativeQuery = true)
    List<Local> buscarTodosDescendentes(@Param("idLocal") Long idLocal);

    @Query(value = """
        WITH RECURSIVE hierarquia AS (
            SELECT * FROM local WHERE idlocal = :idLocal
            UNION ALL
            SELECT l.* FROM local l
            INNER JOIN hierarquia h ON l.idlocal = h.idlocal_principal
        )
        SELECT * FROM hierarquia WHERE idlocal != :idLocal
        """, nativeQuery = true)
    List<Local> buscarTodosAncestrais(@Param("idLocal") Long idLocal);
    
    @Query("SELECT l FROM Local l WHERE LOWER(l.nome) LIKE LOWER(CONCAT('%', :nome, '%'))")
    List<Local> buscarPorNomeLike(@Param("nome") String nome, Pageable pageable);
    
    @Query("SELECT COUNT(l) FROM Local l WHERE l.localPrincipal.idLocal = :idLocalPrincipal")
    long countSubLocais(@Param("idLocalPrincipal") Long idLocalPrincipal);
    
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Local l WHERE l.localPrincipal.idLocal = :idLocal")
    boolean hasSubLocais(@Param("idLocal") Long idLocal);
    
    List<Local> findByStatusOrderByAvaliacaoMediaDesc(StatusLocal status, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Local l SET l.status = :novoStatus WHERE l.idLocal IN :ids")
    int atualizarStatusEmMassa(@Param("ids") List<Long> ids, @Param("novoStatus") StatusLocal novoStatus);
}