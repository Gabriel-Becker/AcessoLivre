package com.acessolivre.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@Slf4j
public class ImageOptimizerService {
    
    private static final int MAX_WIDTH = 1920;
    private static final int MAX_HEIGHT = 1080;
    private static final float JPEG_QUALITY = 0.85f;
    
    public byte[] otimizarImagem(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        BufferedImage imagem = ImageIO.read(new ByteArrayInputStream(bytes));
        
        if (imagem == null) {
            throw new IllegalArgumentException("Formato de imagem não suportado");
        }
        
        // Redimensionar se necessário
        BufferedImage imagemRedimensionada = redimensionarSeNecessario(imagem);
        
        // Converter para WebP ou manter formato
        return converterParaWebP(imagemRedimensionada);
    }
    
    private BufferedImage redimensionarSeNecessario(BufferedImage imagem) {
        int width = imagem.getWidth();
        int height = imagem.getHeight();
        
        if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
            return imagem;
        }
        
        double ratio = Math.min((double) MAX_WIDTH / width, (double) MAX_HEIGHT / height);
        int newWidth = (int) (width * ratio);
        int newHeight = (int) (height * ratio);
        
        Image scaled = imagem.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH);
        BufferedImage output = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        output.getGraphics().drawImage(scaled, 0, 0, null);
        
        return output;
    }
    
    private byte[] converterParaWebP(BufferedImage imagem) throws IOException {
        // Aqui você pode implementar conversão para WebP
        // Ou manter como JPEG/PNG por enquanto
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(imagem, "jpg", baos);
        return baos.toByteArray();
    }
}