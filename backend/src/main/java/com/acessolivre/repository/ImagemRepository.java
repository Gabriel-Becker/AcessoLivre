package com.acessolivre.repository;

import com.acessolivre.model.Imagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ImagemRepository extends JpaRepository<Imagem, Long> {
    
    List<Imagem> findByLocalIdLocal(Long idLocal);
    
    List<Imagem> findByLocalIdLocalOrderByOrdemAsc(Long idLocal);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Imagem i WHERE i.local.idLocal = :idLocal")
    void deleteByLocalId(@Param("idLocal") Long idLocal);
    
    @Modifying
    @Transactional
    @Query("UPDATE Imagem i SET i.ordem = :ordem WHERE i.idImagem = :idImagem")
    void updateOrdem(@Param("idImagem") Long idImagem, @Param("ordem") Integer ordem);
    
    long countByLocalIdLocal(Long idLocal);
}