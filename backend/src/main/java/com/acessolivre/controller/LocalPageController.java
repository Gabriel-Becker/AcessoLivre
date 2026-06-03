// LocalPageController.java
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
            Local local = localService.buscarPorIdComImagens(id)
                    .orElseThrow(() -> new RuntimeException("Local não encontrado"));
            
            model.addAttribute("nome", local.getNome());
            model.addAttribute("categoria", local.getCategoria());
            model.addAttribute("avaliacaoMedia", local.getAvaliacaoMedia());
            model.addAttribute("totalAvaliacoes", local.getTotalAvaliacoes());
            model.addAttribute("descricao", local.getDescricao());
            
            if (local.getEndereco() != null) {
                String enderecoCompleto = String.format("%s, %s - %s/%s",
                    local.getEndereco().getLogradouro(),
                    local.getEndereco().getNumero(),
                    local.getEndereco().getCidade(),
                    local.getEndereco().getEstado()
                );
                model.addAttribute("endereco", enderecoCompleto);
            }
            
            if (local.getImagens() != null && !local.getImagens().isEmpty()) {
                String imagemUrl = local.getImagens().get(0).getUrlCompleta();
                model.addAttribute("imagemUrl", imagemUrl);
            } else {
                model.addAttribute("imagemUrl", "/images/default-local.png");
            }
            
            int fullStars = (int) Math.floor(local.getAvaliacaoMedia() != null ? local.getAvaliacaoMedia() : 0);
            boolean hasHalfStar = (local.getAvaliacaoMedia() != null && 
                                   local.getAvaliacaoMedia() % 1 >= 0.5);
            model.addAttribute("fullStars", fullStars);
            model.addAttribute("hasHalfStar", hasHalfStar);
            
            return "local-page";
            
        } catch (Exception e) {
            log.error("Erro ao carregar página do local {}: {}", id, e.getMessage());
            return "error";
        }
    }
}