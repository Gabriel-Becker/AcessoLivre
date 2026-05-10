// repository/ImagemRepository.java
package com.acessolivre.repository;

import com.acessolivre.model.Imagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImagemRepository extends JpaRepository<Imagem, Long> {
    
    List<Imagem> findByLocalIdLocalOrderByOrdemAsc(Long idLocal);
    
    Optional<Imagem> findFirstByLocalIdLocalOrderByOrdemDesc(Long idLocal);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Imagem i WHERE i.local.idLocal = :idLocal")
    void deleteByLocalId(@Param("idLocal") Long idLocal);
    
    @Modifying
    @Transactional
    @Query("UPDATE Imagem i SET i.ordem = i.ordem + 1 WHERE i.local.idLocal = :idLocal AND i.ordem >= :ordem")
    void incrementarOrdem(@Param("idLocal") Long idLocal, @Param("ordem") Integer ordem);
    
    long countByLocalIdLocal(Long idLocal);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Imagem i WHERE i.idImagem = :id")
    void deleteById(@Param("id") Long id);
}