package com.acessolivre.repository;

import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.acessolivre.model.Denuncia;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DenunciaSpecification {

    public static Specification<Denuncia> withFilters(
            TipoDenuncia tipo,
            StatusDenuncia status,
            String search,
            LocalDateTime dataInicio,
            LocalDateTime dataFim,
            Long usuarioId) {
        
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (tipo != null) {
                predicates.add(cb.equal(root.get("tipo"), tipo));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate motivoPredicate = cb.like(cb.lower(root.get("motivoLabel")), searchPattern);
                Predicate targetPredicate = cb.like(cb.lower(root.get("targetName")), searchPattern);
                Predicate descricaoPredicate = cb.like(cb.lower(root.get("descricao")), searchPattern);
                predicates.add(cb.or(motivoPredicate, targetPredicate, descricaoPredicate));
            }

            if (dataInicio != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataCriacao"), dataInicio));
            }

            if (dataFim != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataCriacao"), dataFim));
            }

            if (usuarioId != null) {
                predicates.add(cb.equal(root.get("usuario").get("id"), usuarioId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}