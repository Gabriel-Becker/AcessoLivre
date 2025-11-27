package com.acessolivre.repository;

import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca um usuário pelo email
     * @param email email do usuário
     * @return Optional contendo o usuário se encontrado
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Verifica se já existe um usuário com o CPF informado
     * @param cpf CPF a ser verificado
     * @return true se o CPF já existe, false caso contrário
     */
    boolean existsByCpf(String cpf);

    /**
     * Busca um usuário pelo CPF
     * @param cpf CPF do usuário
     * @return Optional contendo o usuário se encontrado
     */
    Optional<Usuario> findByCpf(String cpf);

    /**
     * Verifica se existe pelo menos um usuário com a role informada.
     * A role deve ser armazenada preferencialmente já com prefixo (ex: ROLE_ADMIN).
     * @param role valor da role a pesquisar
     * @return true se existir ao menos um registro, false caso contrário
     */
    boolean existsByRole(Role role);
}
