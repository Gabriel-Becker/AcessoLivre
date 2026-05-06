package com.acessolivre.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca um usuário pelo email
     * @param email email do usuário
     * @return Optional contendo o usuário se encontrado
     */
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByEmailAndAtivoTrue(String email);

    Optional<Usuario> findByIdAndAtivoTrue(Long idUsuario);

    java.util.List<Usuario> findAllByAtivoTrue();

    long countByAtivoTrue();

    /**
     * Verifica se existe pelo menos um usuário com a role informada.
     * A role deve ser armazenada preferencialmente já com prefixo (ex: ROLE_ADMIN).
     * @param role valor da role a pesquisar
     * @return true se existir ao menos um registro, false caso contrário
     */
    boolean existsByRole(Role role);
}
