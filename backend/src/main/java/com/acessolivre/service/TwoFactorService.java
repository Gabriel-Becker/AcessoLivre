package com.acessolivre.service;

import com.acessolivre.model.CodigoRecuperacaoDoisFatores;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoRecuperacaoDoisFatoresRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TwoFactorService {

    private final UsuarioRepository usuarioRepository;
    private final CodigoRecuperacaoDoisFatoresRepository codigoRecuperacaoRepository;
    private final GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();
    private static final String ISSUER = "AcessoLivre";
    private static final int RECOVERY_CODES_COUNT = 10;
    private static final int RECOVERY_CODE_LENGTH = 8;

    public Map<String, Object> generateQRCodeAndSecret(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        String secretKey = key.getKey();
        
        usuario.setTwoFactorSecret(secretKey);
        usuarioRepository.save(usuario);
        
        String accountName = usuario.getEmail();
        String otpAuthUrl = String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
            ISSUER, accountName, secretKey, ISSUER
        );
        
        String qrCodeBase64 = generateQRCodeImage(otpAuthUrl);
        
        Map<String, Object> result = new HashMap<>();
        result.put("qrCode", "data:image/png;base64," + qrCodeBase64);
        result.put("secretKey", secretKey);
        result.put("issuer", ISSUER);
        result.put("accountName", accountName);
        
        return result;
    }

    private String generateQRCodeImage(String otpAuthUrl) {
        try {
            int width = 300;
            int height = 300;
            
            BitMatrix bitMatrix = new MultiFormatWriter().encode(
                otpAuthUrl,
                BarcodeFormat.QR_CODE,
                width,
                height
            );
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | IOException e) {
            log.error("Erro ao gerar QR Code", e);
            throw new RuntimeException("Erro ao gerar QR Code", e);
        }
    }

    @Transactional
    public boolean enableTwoFactor(Long userId, int verificationCode) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (usuario.getTwoFactorSecret() == null) {
            throw new RuntimeException("Secret 2FA não configurado. Gere o QR Code primeiro.");
        }

        boolean isCodeValid = googleAuthenticator.authorize(usuario.getTwoFactorSecret(), verificationCode);
        
        if (isCodeValid) {
            usuario.setTwoFactorEnabled(true);
            usuarioRepository.save(usuario);
            log.info("2FA habilitado para userId={}", userId);
            return true;
        }
        
        log.warn("Código 2FA inválido para userId={}", userId);
        return false;
    }

    @Transactional
    public boolean disableTwoFactor(Long userId, int verificationCode) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!usuario.getTwoFactorEnabled() || usuario.getTwoFactorSecret() == null) {
            throw new RuntimeException("2FA não está habilitado");
        }

        boolean isCodeValid = googleAuthenticator.authorize(usuario.getTwoFactorSecret(), verificationCode);
        
        if (isCodeValid) {
            usuario.setTwoFactorEnabled(false);
            usuario.setTwoFactorSecret(null);
            usuarioRepository.save(usuario);
            
            codigoRecuperacaoRepository.deleteByUsuario(usuario);
            
            log.info("2FA desabilitado para userId={}", userId);
            return true;
        }
        
        log.warn("Código 2FA inválido ao tentar desabilitar para userId={}", userId);
        return false;
    }

    public boolean validateCode(Long userId, int verificationCode) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!usuario.getTwoFactorEnabled() || usuario.getTwoFactorSecret() == null) {
            return false;
        }

        return googleAuthenticator.authorize(usuario.getTwoFactorSecret(), verificationCode);
    }

    public boolean validateCodeByEmail(String email, int verificationCode) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (!usuario.getTwoFactorEnabled() || usuario.getTwoFactorSecret() == null) {
            return false;
        }

        return googleAuthenticator.authorize(usuario.getTwoFactorSecret(), verificationCode);
    }

    public boolean isTwoFactorEnabled(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId).orElse(null);
        return usuario != null && Boolean.TRUE.equals(usuario.getTwoFactorEnabled());
    }

    public boolean isTwoFactorEnabledByEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        return usuario != null && Boolean.TRUE.equals(usuario.getTwoFactorEnabled());
    }

    @Transactional
    public List<String> generateRecoveryCodes(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        codigoRecuperacaoRepository.deleteByUsuario(usuario);
        
        List<String> recoveryCodes = new ArrayList<>();
        SecureRandom random = new SecureRandom();
        
        for (int i = 0; i < RECOVERY_CODES_COUNT; i++) {
            String code = generateRandomCode(random);
            
            CodigoRecuperacaoDoisFatores recoveryCode = CodigoRecuperacaoDoisFatores.builder()
                .codigo(code)
                .usado(false)
                .usuario(usuario)
                .build();
            
            codigoRecuperacaoRepository.save(recoveryCode);
            recoveryCodes.add(code);
        }
        
        log.info("Gerados {} códigos de recuperação para userId={}", RECOVERY_CODES_COUNT, userId);
        return recoveryCodes;
    }

    private String generateRandomCode(SecureRandom random) {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < RECOVERY_CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    @Transactional
    public boolean validateRecoveryCode(String email, String recoveryCode) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Optional<CodigoRecuperacaoDoisFatores> codeOpt = codigoRecuperacaoRepository
            .findByCodigoAndUsadoFalse(recoveryCode);
        
        if (codeOpt.isPresent()) {
            CodigoRecuperacaoDoisFatores code = codeOpt.get();
            
            if (!code.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
                return false;
            }
            
            code.setUsado(true);
            code.setDataUso(LocalDateTime.now());
            codigoRecuperacaoRepository.save(code);
            
            log.info("Código de recuperação usado para userId={}", usuario.getIdUsuario());
            return true;
        }
        
        return false;
    }

    public List<String> getRecoveryCodes(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        return codigoRecuperacaoRepository.findByUsuarioAndUsadoFalse(usuario)
            .stream()
            .map(CodigoRecuperacaoDoisFatores::getCodigo)
            .collect(Collectors.toList());
    }
}
