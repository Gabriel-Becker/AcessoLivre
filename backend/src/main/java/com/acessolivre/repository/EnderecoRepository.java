package com.acessolivre.repository;

import com.acessolivre.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
    
    List<Endereco> findByCep(String cep);
    List<Endereco> findByCidade(String cidade);
    List<Endereco> findByEstado(String estado);
    Optional<Endereco> findByCepAndLogradouroAndNumero(String cep, String logradouro, String numero);
}