package com.acessolivre.repository;

import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.model.Denuncia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DenunciaRepository extends JpaRepository<Denuncia, Long>, JpaSpecificationExecutor<Denuncia> {

    // ===== BUSCAS BÁSICAS =====
    Page<Denuncia> findByStatus(StatusDenuncia status, Pageable pageable);
    Page<Denuncia> findByTipo(TipoDenuncia tipo, Pageable pageable);
    Page<Denuncia> findByStatusAndTipo(StatusDenuncia status, TipoDenuncia tipo, Pageable pageable);
    
    // ===== BUSCA POR TARGET =====
    List<Denuncia> findByTipoAndTargetId(TipoDenuncia tipo, Long targetId);
    Page<Denuncia> findByTipoAndTargetId(TipoDenuncia tipo, Long targetId, Pageable pageable);
    
    // ===== BUSCA POR USUÁRIO =====
    Page<Denuncia> findByUsuario_IdUsuario(Long usuarioId, Pageable pageable);
    List<Denuncia> findByUsuario_IdUsuario(Long usuarioId);
    
    // ===== VERIFICAÇÃO DE DENÚNCIA EXISTENTE (MÉTODO CORRIGIDO) =====
    // ✅ Usando JPQL explícita - mais seguro e evita problemas de convenção de nomes
    @Query("SELECT COUNT(d) > 0 FROM Denuncia d WHERE d.tipo = :tipo AND d.targetId = :targetId AND d.usuario.idUsuario = :usuarioId")
    boolean existsByTipoAndTargetIdAndUsuario(
            @Param("tipo") TipoDenuncia tipo,
            @Param("targetId") Long targetId,
            @Param("usuarioId") Long usuarioId);
    
    // ===== COUNTS PARA DASHBOARD =====
    long countByStatus(StatusDenuncia status);
    long countByStatusAndTipo(StatusDenuncia status, TipoDenuncia tipo);
    
    // ===== ATUALIZAÇÕES EM MASSA =====
    @Modifying
    @Transactional
    @Query("UPDATE Denuncia d SET d.status = :status, d.dataResolucao = :dataResolucao, d.resolvidoPor = :resolvidoPor WHERE d.id IN :ids")
    int atualizarStatusEmMassa(@Param("ids") List<Long> ids, 
                               @Param("status") StatusDenuncia status,
                               @Param("dataResolucao") LocalDateTime dataResolucao,
                               @Param("resolvidoPor") String resolvidoPor);
    
    // ===== BUSCA DENÚNCIAS ANTIGAS (para limpeza) =====
    List<Denuncia> findByStatusAndDataCriacaoBefore(StatusDenuncia status, LocalDateTime data);
    
    // ===== ESTATÍSTICAS POR PERÍODO =====
    @Query("SELECT FUNCTION('DATE', d.dataCriacao) as data, COUNT(d) as total, " +
           "SUM(CASE WHEN d.status = 'PENDING' THEN 1 ELSE 0 END) as pendentes, " +
           "SUM(CASE WHEN d.status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvidas " +
           "FROM Denuncia d " +
           "WHERE d.dataCriacao BETWEEN :inicio AND :fim " +
           "GROUP BY FUNCTION('DATE', d.dataCriacao)")
    List<Object[]> obterEstatisticasPorPeriodo(@Param("inicio") LocalDateTime inicio, 
                                                @Param("fim") LocalDateTime fim);
}