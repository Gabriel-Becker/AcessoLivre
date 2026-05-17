package com.acessolivre.repository;

import com.acessolivre.model.Local;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.TipoAcessibilidade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface LocalRepository extends JpaRepository<Local, Long> {
    
    @Override
    @EntityGraph(attributePaths = {"tiposAcessibilidade", "endereco", "usuario"})
    Page<Local> findAll(Pageable pageable);
    
    @EntityGraph(attributePaths = {"tiposAcessibilidade", "endereco"})
    Page<Local> findByLocalPrincipalIsNull(Pageable pageable);
    
    @EntityGraph(attributePaths = {"tiposAcessibilidade", "endereco"})
    Page<Local> findByLocalPrincipalIdLocal(Long idLocalPrincipal, Pageable pageable);
    
    
    List<Local> findByUsuarioIdUsuario(Long idUsuario);
    List<Local> findByCategoria(Categoria categoria);
    Page<Local> findByStatus(StatusLocal status, Pageable pageable);
    
    List<Local> findByLocalPrincipalIsNull();
    List<Local> findByLocalPrincipalIdLocal(Long idLocalPrincipal);
    Optional<Local> findByIdLocalAndLocalPrincipalIsNull(Long idLocal);
    
    
    @EntityGraph(attributePaths = {"tiposAcessibilidade", "endereco"})
    @Query("SELECT DISTINCT l FROM Local l JOIN l.tiposAcessibilidade t WHERE t = :tipo")
    Page<Local> findByTipoAcessibilidade(@Param("tipo") TipoAcessibilidade tipo, Pageable pageable);
    
    @Query("SELECT DISTINCT l FROM Local l JOIN l.tiposAcessibilidade t WHERE t = :tipo")
    List<Local> findByTipoAcessibilidade(@Param("tipo") TipoAcessibilidade tipo);
    
    @EntityGraph(attributePaths = {"tiposAcessibilidade", "endereco"})
    @Query("SELECT DISTINCT l FROM Local l JOIN l.tiposAcessibilidade t WHERE t IN :tipos")
    Page<Local> findByAnyTipoAcessibilidade(@Param("tipos") Set<TipoAcessibilidade> tipos, Pageable pageable);
    
    @Query("SELECT DISTINCT l FROM Local l JOIN l.tiposAcessibilidade t WHERE t IN :tipos")
    List<Local> findByAnyTipoAcessibilidade(@Param("tipos") Set<TipoAcessibilidade> tipos);
    
    
    @Query("SELECT COUNT(DISTINCT l) FROM Local l JOIN l.tiposAcessibilidade t WHERE t IN :tipos")
    long countByAnyTipoAcessibilidade(@Param("tipos") Set<TipoAcessibilidade> tipos);
    
    @Query("SELECT COUNT(l) FROM Local l WHERE SIZE(l.tiposAcessibilidade) >= :quantidade AND NOT EXISTS (" +
           "SELECT t FROM Local l2 JOIN l2.tiposAcessibilidade t WHERE l2 = l AND t NOT IN :tipos)")
    long countByAllTipoAcessibilidade(@Param("tipos") Set<TipoAcessibilidade> tipos, 
                                      @Param("quantidade") long quantidade);
    
    
    @Query("SELECT l FROM Local l WHERE SIZE(l.tiposAcessibilidade) >= :quantidade AND NOT EXISTS (" +
           "SELECT t FROM Local l2 JOIN l2.tiposAcessibilidade t WHERE l2 = l AND t NOT IN :tipos)")
    List<Local> findByAllTipoAcessibilidade(@Param("tipos") Set<TipoAcessibilidade> tipos, 
                                            @Param("quantidade") long quantidade);
    
    @EntityGraph(attributePaths = {"tiposAcessibilidade", "endereco"})
    @Query("SELECT l FROM Local l WHERE SIZE(l.tiposAcessibilidade) >= :quantidade AND NOT EXISTS (" +
           "SELECT t FROM Local l2 JOIN l2.tiposAcessibilidade t WHERE l2 = l AND t NOT IN :tipos)")
    Page<Local> findByAllTipoAcessibilidade(@Param("tipos") Set<TipoAcessibilidade> tipos, 
                                            @Param("quantidade") long quantidade, 
                                            Pageable pageable);
   
    
    @EntityGraph(attributePaths = {"tiposAcessibilidade", "endereco"})
    @Query("SELECT DISTINCT l FROM Local l JOIN l.tiposAcessibilidade t WHERE l.categoria = :categoria AND t = :tipo")
    List<Local> findByCategoriaAndTipoAcessibilidade(@Param("categoria") Categoria categoria, 
                                                     @Param("tipo") TipoAcessibilidade tipo);
    
    
    @Query("SELECT SIZE(l.tiposAcessibilidade) FROM Local l WHERE l.idLocal = :idLocal")
    Integer countTiposAcessibilidadeByLocalId(@Param("idLocal") Long idLocal);
    
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