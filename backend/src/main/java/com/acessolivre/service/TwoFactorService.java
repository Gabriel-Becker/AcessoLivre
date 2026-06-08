package com.acessolivre.service;

import java.io.ByteArrayOutputStream;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.dto.response.TwoFactorSetupResponseDTO;
import com.acessolivre.model.TwoFactorRecoveryCode;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TwoFactorRecoveryCodeRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TwoFactorService {

    private static final int RECOVERY_CODES_QUANTIDADE = 8;
    private static final int RECOVERY_CODE_EXPIRATION_DAYS = 365;
    private static final String ISSUER = "AcessoLivre";

    private final UsuarioRepository usuarioRepository;
    private final TwoFactorRecoveryCodeRepository twoFactorRecoveryCodeRepository;
    private final GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();
    private final SecureRandom secureRandom = new SecureRandom();

    public boolean isTwoFactorEnabledByEmail(String email) {
        return usuarioRepository.findByEmail(email)
            .map(Usuario::getTwoFactorEnabled)
            .orElse(false);
    }

    @Transactional
    public TwoFactorSetupResponseDTO prepararConfiguracao(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        limparCodigosRecuperacao(usuario);

        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        String secretKey = key.getKey();
        String accountName = usuario.getEmail();
        String otpAuthUrl = GoogleAuthenticatorQRGenerator.getOtpAuthURL(ISSUER, accountName, key);
        String qrCode = gerarQrCodeBase64(otpAuthUrl);

        usuario.setTwoFactorSecret(secretKey);
        usuario.setTwoFactorEnabled(false);
        usuarioRepository.save(usuario);

        List<String> recoveryCodes = gerarCodigosRecuperacao();
        salvarCodigosRecuperacao(usuario, recoveryCodes);

        log.info("Setup de 2FA preparado para userId={}", userId);
        return TwoFactorSetupResponseDTO.builder()
            .qrCode(qrCode)
            .secretKey(secretKey)
            .issuer(ISSUER)
            .accountName(accountName)
            .recoveryCodes(recoveryCodes)
            .build();
    }

    @Transactional
    public boolean habilitar(Long userId, String verificationCode) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!validarCodigoAutenticador(usuario, verificationCode)) {
            throw new IllegalArgumentException("Código inválido ou expirado");
        }

        usuario.setTwoFactorEnabled(true);
        usuarioRepository.save(usuario);
        log.info("2FA habilitado para userId={}", userId);
        return true;
    }

    @Transactional
    public boolean desabilitar(Long userId, String verificationCode) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        boolean codigoValido = validarCodigoAutenticador(usuario, verificationCode)
            || validarCodigoRecuperacao(usuario, verificationCode);

        if (!codigoValido) {
            throw new IllegalArgumentException("Código inválido ou expirado");
        }

        usuario.setTwoFactorEnabled(false);
        usuario.setTwoFactorSecret(null);
        usuarioRepository.save(usuario);
        limparCodigosRecuperacao(usuario);

        log.info("2FA desabilitado para userId={}", userId);
        return true;
    }

    public boolean validarCodigoAutenticador(String email, String codigo) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return validarCodigoAutenticador(usuario, codigo);
    }

    public boolean validarCodigoAutenticador(Usuario usuario, String codigo) {
        if (usuario == null || usuario.getTwoFactorSecret() == null || codigo == null) {
            return false;
        }

        String codigoNormalizado = codigo.trim();
        if (codigoNormalizado.isEmpty()) {
            return false;
        }

        try {
            return googleAuthenticator.authorize(usuario.getTwoFactorSecret(), Integer.parseInt(codigoNormalizado));
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Transactional
    public boolean validarCodigoRecuperacao(Usuario usuario, String codigo) {
        if (usuario == null || codigo == null || codigo.isBlank()) {
            return false;
        }

        String codigoNormalizado = codigo.trim();
        Optional<TwoFactorRecoveryCode> codigoRecuperacao = twoFactorRecoveryCodeRepository
            .findByCodigoAndUsuario_IdUsuario(codigoNormalizado, usuario.getIdUsuario());

        if (codigoRecuperacao.isEmpty()) {
            return false;
        }

        TwoFactorRecoveryCode registro = codigoRecuperacao.get();
        if (Boolean.TRUE.equals(registro.getUtilizado()) || registro.getDataExpiracao().isBefore(LocalDateTime.now())) {
            return false;
        }

        registro.setUtilizado(true);
        twoFactorRecoveryCodeRepository.save(registro);
        return true;
    }

    public String mascararEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "email informado";
        }
        String[] partes = email.split("@", 2);
        String usuario = partes[0];
        String dominio = partes[1];
        String visivel = usuario.length() <= 2 ? usuario : usuario.substring(0, 2);
        return visivel + "***@" + dominio;
    }

    private List<String> gerarCodigosRecuperacao() {
        List<String> codigos = new ArrayList<>();
        for (int i = 0; i < RECOVERY_CODES_QUANTIDADE; i++) {
            codigos.add(gerarCodigoRecuperacao());
        }
        return codigos;
    }

    private String gerarCodigoRecuperacao() {
        final String caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder builder = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            builder.append(caracteres.charAt(secureRandom.nextInt(caracteres.length())));
        }
        return builder.toString();
    }

    private String gerarQrCodeBase64(String otpAuthUrl) {
        try {
            BitMatrix bitMatrix = new QRCodeWriter().encode(otpAuthUrl, BarcodeFormat.QR_CODE, 320, 320);
            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
                return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar QR Code do 2FA", e);
        }
    }

    @Transactional
    private void limparCodigosRecuperacao(Usuario usuario) {
        twoFactorRecoveryCodeRepository.deleteByUsuario(usuario);
    }

    @Transactional
    private void salvarCodigosRecuperacao(Usuario usuario, List<String> recoveryCodes) {
        LocalDateTime expiracao = LocalDateTime.now().plusDays(RECOVERY_CODE_EXPIRATION_DAYS);
        List<TwoFactorRecoveryCode> codigos = recoveryCodes.stream()
            .map(codigo -> TwoFactorRecoveryCode.builder()
                .usuario(usuario)
                .codigo(codigo)
                .dataCriacao(LocalDateTime.now())
                .dataExpiracao(expiracao)
                .utilizado(false)
                .build())
            .toList();

        twoFactorRecoveryCodeRepository.saveAll(codigos);
    }
}
