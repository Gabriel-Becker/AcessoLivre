package com.acessolivre.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImageOptimizerService {
    
    public byte[] otimizarImagem(MultipartFile file) throws IOException {
        byte[] originalBytes = file.getBytes();
        long tamanhoOriginal = originalBytes.length;
        
        log.info("📸 Processando imagem: {} bytes ({} KB)", tamanhoOriginal, tamanhoOriginal / 1024);
        
        // TODO: Implementar otimização real (redimensionamento, compressão)
        // Por enquanto, retorna o arquivo original para não quebrar o fluxo
        
        return originalBytes;
    }
}