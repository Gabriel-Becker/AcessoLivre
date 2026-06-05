package com.acessolivre.exception;

public class DenunciaNotFoundException extends RuntimeException {
    
    public DenunciaNotFoundException(Long id) {
        super("Denúncia não encontrada com ID: " + id);
    }
    
    public DenunciaNotFoundException(String message) {
        super(message);
    }
}