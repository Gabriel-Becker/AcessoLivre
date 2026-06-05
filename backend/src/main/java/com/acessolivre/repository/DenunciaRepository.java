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
import java.util.Optional;

@Repository
public interface DenunciaRepository extends JpaRepository<Denuncia, Long>, JpaSpecificationExecutor<Denuncia> {

    // Buscas básicas
    Page<Denuncia> findByStatus(StatusDenuncia status, Pageable pageable);
    Page<Denuncia> findByTipo(TipoDenuncia tipo, Pageable pageable);
    Page<Denuncia> findByStatusAndTipo(StatusDenuncia status, TipoDenuncia tipo, Pageable pageable);
    
    // Busca por target
    List<Denuncia> findByTipoAndTargetId(TipoDenuncia tipo, Long targetId);
    Page<Denuncia> findByTipoAndTargetId(TipoDenuncia tipo, Long targetId, Pageable pageable);
    
    // Busca por usuário
    Page<Denuncia> findByUsuarioId(Long usuarioId, Pageable pageable);
    List<Denuncia> findByUsuarioId(Long usuarioId);
    
    // Verificação de denúncia existente
    boolean existsByTipoAndTargetIdAndUsuarioId(TipoDenuncia tipo, Long targetId, Long usuarioId);
    
    // Counts para dashboard
    long countByStatus(StatusDenuncia status);
    long countByStatusAndTipo(StatusDenuncia status, TipoDenuncia tipo);
    
    // Atualizações em massa
    @Modifying
    @Transactional
    @Query("UPDATE Denuncia d SET d.status = :status, d.dataResolucao = :dataResolucao, d.resolvidoPor = :resolvidoPor WHERE d.id IN :ids")
    int atualizarStatusEmMassa(@Param("ids") List<Long> ids, 
                               @Param("status") StatusDenuncia status,
                               @Param("dataResolucao") LocalDateTime dataResolucao,
                               @Param("resolvidoPor") String resolvidoPor);
    
    // Busca denúncias antigas (para limpeza)
    List<Denuncia> findByStatusAndDataCriacaoBefore(StatusDenuncia status, LocalDateTime data);
    
    // Estatísticas por período
    @Query("SELECT DATE(d.dataCriacao) as data, COUNT(d) as total, " +
           "SUM(CASE WHEN d.status = 'PENDING' THEN 1 ELSE 0 END) as pendentes, " +
           "SUM(CASE WHEN d.status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvidas " +
           "FROM Denuncia d " +
           "WHERE d.dataCriacao BETWEEN :inicio AND :fim " +
           "GROUP BY DATE(d.dataCriacao)")
    List<Object[]> obterEstatisticasPorPeriodo(@Param("inicio") LocalDateTime inicio, 
                                                @Param("fim") LocalDateTime fim);
}