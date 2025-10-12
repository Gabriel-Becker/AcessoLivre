package com.acessolivre.repository;

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
}
