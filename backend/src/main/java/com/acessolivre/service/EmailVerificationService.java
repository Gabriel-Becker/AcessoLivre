package com.acessolivre.service;

import com.acessolivre.model.CodigoVerificacaoEmail;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoVerificacaoEmailRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final CodigoVerificacaoEmailRepository codigoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    
    private static final int CODIGO_EXPIRACAO_MINUTOS = 15;

    @Transactional
    public void gerarEEnviarCodigo(Usuario usuario) {
        // Remove códigos antigos
        codigoRepository.deleteByUsuario(usuario);
        
        // Gera novo código
        String codigo = emailService.gerarCodigoVerificacao();
        
        CodigoVerificacaoEmail codigoVerificacao = CodigoVerificacaoEmail.builder()
            .codigo(codigo)
            .usuario(usuario)
            .dataExpiracao(LocalDateTime.now().plusMinutes(CODIGO_EXPIRACAO_MINUTOS))
            .usado(false)
            .build();
        
        codigoRepository.save(codigoVerificacao);
        
        // Envia email
        emailService.enviarCodigoVerificacao(usuario.getEmail(), codigo);
        
        log.info("Código de verificação gerado e enviado para userId={}", usuario.getIdUsuario());
    }

    @Transactional
    public boolean verificarCodigo(String email, String codigo) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (usuario.getEmailVerified()) {
            log.warn("Email já verificado para userId={}", usuario.getIdUsuario());
            return true;
        }
        
        Optional<CodigoVerificacaoEmail> codigoOpt = codigoRepository
            .findByCodigoAndUsadoFalseAndDataExpiracaoAfter(codigo, LocalDateTime.now());
        
        if (codigoOpt.isEmpty()) {
            log.warn("Código inválido ou expirado para email={}", email);
            return false;
        }
        
        CodigoVerificacaoEmail codigoVerificacao = codigoOpt.get();
        
        if (!codigoVerificacao.getUsuario().getEmail().equals(email)) {
            log.warn("Código não pertence ao usuário email={}", email);
            return false;
        }
        
        // Marca código como usado
        codigoVerificacao.setUsado(true);
        codigoVerificacao.setDataUso(LocalDateTime.now());
        codigoRepository.save(codigoVerificacao);
        
        // Marca email como verificado
        usuario.setEmailVerified(true);
        usuarioRepository.save(usuario);
        
        // Envia email de boas-vindas
        emailService.enviarBoasVindas(usuario.getEmail(), usuario.getNome());
        
        log.info("Email verificado com sucesso para userId={}", usuario.getIdUsuario());
        return true;
    }

    @Transactional
    public void reenviarCodigo(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        if (usuario.getEmailVerified()) {
            throw new RuntimeException("Email já verificado");
        }
        
        gerarEEnviarCodigo(usuario);
    }
}
