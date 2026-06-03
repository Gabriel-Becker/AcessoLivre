package com.acessolivre.controller;

import com.acessolivre.model.Local;
import com.acessolivre.service.LocalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/local")
@RequiredArgsConstructor
@Slf4j
public class LocalPageController {

    private final LocalService localService;

    @GetMapping("/{id}")
    public String paginaLocal(@PathVariable Long id, Model model) {
        try {
            // Buscar local
            Local local = localService.buscarPorIdComImagens(id)
                    .orElseThrow(() -> new RuntimeException("Local não encontrado"));
            
            // Dados que temos certeza que existem
            model.addAttribute("nome", local.getNome() != null ? local.getNome() : "Local sem nome");
            model.addAttribute("categoria", local.getCategoria() != null ? local.getCategoria().toString() : "Não informada");
            model.addAttribute("id", local.getIdLocal());
            model.addAttribute("avaliacaoMedia", local.getAvaliacaoMedia() != null ? local.getAvaliacaoMedia() : 0.0);
            model.addAttribute("descricao", local.getDescricao() != null ? local.getDescricao() : "");
            
            // Total de avaliações (usando valor padrão)
            model.addAttribute("totalAvaliacoes", 0);
            
            // Endereço
            String endereco = "Endereço não informado";
            if (local.getEndereco() != null) {
                StringBuilder sb = new StringBuilder();
                if (local.getEndereco().getLogradouro() != null) sb.append(local.getEndereco().getLogradouro());
                if (local.getEndereco().getNumero() != null) sb.append(", ").append(local.getEndereco().getNumero());
                if (local.getEndereco().getCidade() != null) sb.append(" - ").append(local.getEndereco().getCidade());
                if (local.getEndereco().getEstado() != null) sb.append("/").append(local.getEndereco().getEstado());
                endereco = sb.length() > 0 ? sb.toString() : "Endereço não informado";
            }
            model.addAttribute("endereco", endereco);
            
            // Imagem padrão
            model.addAttribute("imagemUrl", "https://acessolivre.app/images/default-local.png");
            
            // Estrelas
            double media = local.getAvaliacaoMedia() != null ? local.getAvaliacaoMedia() : 0;
            model.addAttribute("fullStars", (int) Math.floor(media));
            model.addAttribute("hasHalfStar", (media - Math.floor(media)) >= 0.5);
            
            log.info("Página do local {} carregada", id);
            
            return "local-page";
            
        } catch (Exception e) {
            log.error("Erro ao carregar página do local {}: {}", id, e.getMessage());
            model.addAttribute("erro", "Local não encontrado");
            return "error";
        }
    }
}