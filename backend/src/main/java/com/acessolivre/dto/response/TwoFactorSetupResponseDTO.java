package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupResponseDTO {
    private String qrCode;
    private String secretKey;
    private String issuer;
    private String accountName;
    private List<String> recoveryCodes;
}
