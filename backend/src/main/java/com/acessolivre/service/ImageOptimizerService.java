package com.acessolivre.service;

import com.acessolivre.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageOptimizerService {
    
    private final StorageProperties storageProperties;
    
    private static final int MAX_WIDTH = 1920;
    private static final int MAX_HEIGHT = 1080;
    private static final float JPEG_QUALITY = 0.82f;  // 82% qualidade
    
    public byte[] otimizarImagem(MultipartFile file) throws IOException {
        byte[] originalBytes = file.getBytes();
        BufferedImage imagem = ImageIO.read(new ByteArrayInputStream(originalBytes));
        
        if (imagem == null) {
            throw new IllegalArgumentException("Formato de imagem não suportado. Use JPG, PNG ou WEBP.");
        }
        
        long tamanhoOriginal = originalBytes.length;
        
        // 1. Redimensionar se necessário
        BufferedImage imagemRedimensionada = redimensionarSeNecessario(imagem);
        
        // 2. Comprimir imagem
        byte[] imagemComprimida = comprimirImagem(imagemRedimensionada, file.getContentType());
        
        long tamanhoFinal = imagemComprimida.length;
        double economiaPercentual = (1 - (double) tamanhoFinal / tamanhoOriginal) * 100;
        
        log.info("Otimização: {}KB → {}KB (economia de {:.1f}%)", 
                tamanhoOriginal / 1024, 
                tamanhoFinal / 1024, 
                economiaPercentual);
        
        return imagemComprimida;
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
        
        log.debug("Redimensionando: {}x{} → {}x{}", width, height, newWidth, newHeight);
        
        BufferedImage output = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = output.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.drawImage(imagem, 0, 0, newWidth, newHeight, null);
        g2d.dispose();
        
        return output;
    }
    
    private byte[] comprimirImagem(BufferedImage imagem, String contentType) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        // Para JPEG usamos compressão com qualidade controlada
        if (contentType != null && contentType.contains("jpeg") || contentType.contains("jpg")) {
            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
            if (writers.hasNext()) {
                ImageWriter writer = writers.next();
                ImageWriteParam param = writer.getDefaultWriteParam();
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(JPEG_QUALITY);
                
                try (ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {
                    writer.setOutput(ios);
                    writer.write(null, new IIOImage(imagem, null, null), param);
                }
                writer.dispose();
            } else {
                ImageIO.write(imagem, "jpg", baos);
            }
        } else {
            // PNG ou outros formatos
            ImageIO.write(imagem, "png", baos);
        }
        
        return baos.toByteArray();
    }
}