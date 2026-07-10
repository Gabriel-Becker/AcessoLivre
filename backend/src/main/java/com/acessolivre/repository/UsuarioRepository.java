package com.acessolivre.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByEmailAndAtivoTrue(String email);

    Optional<Usuario> findByEmailIgnoreCaseAndAtivoTrue(String email);

    boolean existsByEmailIgnoreCase(String email);
    
    Optional<Usuario> findByNome(String nome);  

    Optional<Usuario> findByIdUsuarioAndAtivoTrue(Long idUsuario);

    Optional<Usuario> findByIdUsuarioAndAtivoFalse(Long idUsuario);

    java.util.List<Usuario> findAllByAtivoTrue();

    Page<Usuario> findAllByAtivoTrue(Pageable pageable);

    Page<Usuario> findAllByAtivoFalse(Pageable pageable);

    long countByAtivoTrue();

    boolean existsByRole(Role role);
    
}