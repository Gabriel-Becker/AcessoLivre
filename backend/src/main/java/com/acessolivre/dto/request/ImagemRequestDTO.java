package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagemRequestDTO {
    
    @NotNull(message = "Arquivo da imagem é obrigatório")
    private MultipartFile arquivo;
    
    @NotNull(message = "ID do local é obrigatório")
    private Long idLocal;
}