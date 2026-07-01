package com.acessolivre.mapper;

import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.service.ArmazenamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ImagemMapper {
    
    private static ArmazenamentoService storageService;
    
    @Autowired
    public void setStorageService(ArmazenamentoService service) {
        storageService = service;
        System.out.println(" ImagemMapper inicializado com StorageService");
    }
    
    public static ImagemResponseDTO toResponse(Imagem entity) {
        if (entity == null) {
            return null;
        }
        
        String urlCompleta = null;
        if (storageService != null && entity.getCaminhoRelativo() != null) {
            urlCompleta = storageService.construirUrlCompleta(entity.getCaminhoRelativo());
            System.out.println(" Construindo URL: " + entity.getCaminhoRelativo() + " -> " + urlCompleta);
        } else {
            System.out.println("StorageService é null ou caminho vazio");
        }
        
        return ImagemResponseDTO.builder()
                .idImagem(entity.getIdImagem())
                .urlCompleta(urlCompleta)
                .caminhoRelativo(entity.getCaminhoRelativo())
                .nomeOriginal(entity.getNomeOriginal())
                .idLocal(entity.getIdLocal())
                .tamanhoBytes(entity.getTamanhoBytes())
                .contentType(entity.getContentType())
                .ordem(entity.getOrdem())
                .build();
    }
}