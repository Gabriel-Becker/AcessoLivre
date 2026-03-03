package com.acessolivre.exception;

import com.acessolivre.dto.response.ErrorResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler({
        UsuarioException.UsuarioNaoEncontradoException.class,
        UsuarioException.EmailJaExisteException.class,
        UsuarioException.PermissaoNegadaException.class,
        UsuarioException.UsuarioInativoException.class,
        UsuarioException.AutenticacaoFalhouException.class
    })
    public ResponseEntity<Map<String, String>> handleUsuarioExceptions(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", ex.getMessage());
        
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex instanceof UsuarioException.UsuarioNaoEncontradoException) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof UsuarioException.EmailJaExisteException) {
            status = HttpStatus.CONFLICT;
        } else if (ex instanceof UsuarioException.PermissaoNegadaException ||
                  ex instanceof UsuarioException.UsuarioInativoException) {
            status = HttpStatus.FORBIDDEN;
        } else if (ex instanceof UsuarioException.AutenticacaoFalhouException) {
            status = HttpStatus.UNAUTHORIZED;
        }
        
        // Log estruturado com contexto
        log.error("Exceção de usuário: tipo={}, mensagem={}, endpoint={}, usuario={}",
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            MDC.get("endpoint"),
            MDC.get("userEmail"));
        
        return new ResponseEntity<>(errors, status);
    }

    @ExceptionHandler({
        LocalException.LocalNaoEncontradoException.class,
        LocalException.LocalAcessoNegadoException.class,
        LocalException.CategoriaInvalidaException.class,
        LocalException.TipoAcessibilidadeInvalidoException.class
    })
    public ResponseEntity<Map<String, String>> handleLocalExceptions(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", ex.getMessage());
        
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex instanceof LocalException.LocalNaoEncontradoException) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof LocalException.LocalAcessoNegadoException) {
            status = HttpStatus.FORBIDDEN;
        }
        
        log.error("Exceção de local: tipo={}, mensagem={}, endpoint={}, usuario={}",
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            MDC.get("endpoint"),
            MDC.get("userEmail"));
        
        return new ResponseEntity<>(errors, status);
    }

    @ExceptionHandler({
        AvaliacaoException.AvaliacaoNaoEncontradaException.class,
        AvaliacaoException.AvaliacaoJaExisteException.class,
        AvaliacaoException.AvaliacaoNaoPermitidaException.class,
        AvaliacaoException.AvaliacaoAcessoNegadoException.class
    })
    public ResponseEntity<Map<String, String>> handleAvaliacaoExceptions(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", ex.getMessage());
        
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex instanceof AvaliacaoException.AvaliacaoNaoEncontradaException) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof AvaliacaoException.AvaliacaoJaExisteException) {
            status = HttpStatus.CONFLICT;
        } else if (ex instanceof AvaliacaoException.AvaliacaoNaoPermitidaException ||
                  ex instanceof AvaliacaoException.AvaliacaoAcessoNegadoException) {
            status = HttpStatus.FORBIDDEN;
        }
        
        log.error("Exceção de avaliação: tipo={}, mensagem={}, endpoint={}, usuario={}",
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            MDC.get("endpoint"),
            MDC.get("userEmail"));
        
        return new ResponseEntity<>(errors, status);
    }

    @ExceptionHandler({
        AuthenticationException.TokenInvalidoException.class,
        AuthenticationException.TokenExpiradoException.class,
        AuthenticationException.TokenRevogadoException.class,
        AuthenticationException.CredenciaisInvalidasException.class,
        AuthenticationException.AcessoNegadoException.class
    })
    public ResponseEntity<Map<String, String>> handleAuthenticationExceptions(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", ex.getMessage());
        
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        if (ex instanceof AuthenticationException.AcessoNegadoException) {
            status = HttpStatus.FORBIDDEN;
        }
        
        log.error("Exceção de autenticação: tipo={}, mensagem={}, endpoint={}, usuario={}",
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            MDC.get("endpoint"),
            MDC.get("userEmail"));
        
        return new ResponseEntity<>(errors, status);
    }

    @ExceptionHandler({
        PasswordResetException.CodigoInvalidoException.class,
        PasswordResetException.CodigoExpiradoException.class,
        PasswordResetException.CodigoJaUtilizadoException.class,
        PasswordResetException.EnvioEmailException.class
    })
    public ResponseEntity<Map<String, String>> handlePasswordResetExceptions(RuntimeException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", ex.getMessage());
        
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex instanceof PasswordResetException.EnvioEmailException) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        log.error("Exceção de reset de senha: tipo={}, mensagem={}, endpoint={}, usuario={}",
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            MDC.get("endpoint"),
            MDC.get("userEmail"));
        
        return new ResponseEntity<>(errors, status);
    }

    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleValidationException(ValidationException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("erro", "Erro de validação");
        response.put("mensagem", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> detalhes = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            detalhes.put(fieldName, errorMessage);
        });

        ErrorResponseDTO response = ErrorResponseDTO.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .erro("Erro de validação")
            .mensagem("Um ou mais campos estão inválidos")
            .path(MDC.get("endpoint"))
            .detalhes(detalhes)
            .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", "Acesso negado: você não tem permissão para realizar esta operação");
        return new ResponseEntity<>(errors, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentialsException(BadCredentialsException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", "Email ou senha inválidos");
        return new ResponseEntity<>(errors, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", "Usuário não encontrado");
        return new ResponseEntity<>(errors, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", ex.getMessage());
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", ex.getMessage());
        return new ResponseEntity<>(errors, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("erro", "Erro interno do servidor");
        errors.put("mensagem", "Ocorreu um erro inesperado. Tente novamente mais tarde");
        
        log.error("Exceção não tratada: tipo={}, mensagem={}, endpoint={}, usuario={}",
            ex.getClass().getSimpleName(),
            ex.getMessage(),
            MDC.get("endpoint"),
            MDC.get("userEmail"),
            ex);
        
        return new ResponseEntity<>(errors, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
