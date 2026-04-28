package com.acessolivre.service;

import com.acessolivre.dto.request.LocalRequestDTO;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.TipoAcessibilidade;
import com.acessolivre.mapper.EnderecoMapper;
import com.acessolivre.mapper.LocalMapper;
import com.acessolivre.model.*;
import com.acessolivre.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalService {

    private final LocalRepository localRepository;
    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final EnderecoService enderecoService;
    private final AvaliacaoRepository avaliacaoRepository;

    private static final int MAX_PROFUNDIDADE_HIERARQUIA = 5;

    @Transactional(readOnly = true)
    public Page<Local> listarTodos(Pageable pageable) {
        log.info("Listando locais com paginação: página={}, tamanho={}", 
            pageable.getPageNumber(), pageable.getPageSize());
        return localRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Local> listarLocaisRaiz(Pageable pageable) {
        log.info("Listando locais raiz (sem pai)");
        return localRepository.findByLocalPrincipalIsNull(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Local> listarSubLocais(Long idLocalPrincipal, Pageable pageable) {
        log.info("Listando sub-locais do local ID: {}", idLocalPrincipal);
        validarExistenciaLocal(idLocalPrincipal);
        return localRepository.findByLocalPrincipalIdLocal(idLocalPrincipal, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Local> buscarPorId(Long id) {
        log.info("Buscando local por ID: {}", id);
        return localRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Local> buscarPorUsuario(Long idUsuario) {
        log.info("Buscando locais por usuário ID: {}", idUsuario);
        return localRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @Transactional(readOnly = true)
    public List<Local> buscarPorCategoria(Categoria categoria) {
        log.info("Buscando locais por categoria: {}", categoria);
        return localRepository.findByCategoria(categoria);
    }

    // ⭐ NOVOS MÉTODOS PARA ACESSIBILIDADE
    
    @Transactional(readOnly = true)
    public List<Local> buscarPorTipoAcessibilidade(TipoAcessibilidade tipoAcessibilidade) {
        log.info("Buscando locais por tipo de acessibilidade: {}", tipoAcessibilidade);
        return localRepository.findByTipoAcessibilidade(tipoAcessibilidade);
    }
    
    @Transactional(readOnly = true)
    public Page<Local> buscarPorTipoAcessibilidadePaginado(TipoAcessibilidade tipoAcessibilidade, Pageable pageable) {
        log.info("Buscando locais por tipo de acessibilidade com paginação: {}", tipoAcessibilidade);
        return localRepository.findByTipoAcessibilidade(tipoAcessibilidade, pageable);
    }
    
    @Transactional(readOnly = true)
    public List<Local> buscarPorQualquerTipoAcessibilidade(Set<TipoAcessibilidade> tipos) {
        log.info("Buscando locais que possuem qualquer um dos tipos: {}", tipos);
        if (tipos == null || tipos.isEmpty()) {
            return new ArrayList<>();
        }
        return localRepository.findByAnyTipoAcessibilidade(tipos);
    }
    
    @Transactional(readOnly = true)
    public Page<Local> buscarPorQualquerTipoAcessibilidadePaginado(Set<TipoAcessibilidade> tipos, Pageable pageable) {
        log.info("Buscando locais que possuem qualquer um dos tipos com paginação: {}", tipos);
        if (tipos == null || tipos.isEmpty()) {
            return Page.empty(pageable);
        }
        return localRepository.findByAnyTipoAcessibilidade(tipos, pageable);
    }
    
    @Transactional(readOnly = true)
    public List<Local> buscarPorTodosTiposAcessibilidade(Set<TipoAcessibilidade> tipos) {
        log.info("Buscando locais que possuem todos os tipos: {}", tipos);
        if (tipos == null || tipos.isEmpty()) {
            return new ArrayList<>();
        }
        return localRepository.findByAllTipoAcessibilidade(tipos, (long) tipos.size());
    }
    
    @Transactional(readOnly = true)
    public Page<Local> buscarPorTodosTiposAcessibilidadePaginado(Set<TipoAcessibilidade> tipos, Pageable pageable) {
        log.info("Buscando locais que possuem todos os tipos com paginação: {}", tipos);
        if (tipos == null || tipos.isEmpty()) {
            return Page.empty(pageable);
        }
        return localRepository.findByAllTipoAcessibilidade(tipos, (long) tipos.size(), pageable);
    }
    
    @Transactional(readOnly = true)
    public List<Local> buscarPorCategoriaETipoAcessibilidade(Categoria categoria, TipoAcessibilidade tipo) {
        log.info("Buscando locais por categoria {} e tipo de acessibilidade {}", categoria, tipo);
        return localRepository.findByCategoriaAndTipoAcessibilidade(categoria, tipo);
    }
    
    @Transactional(readOnly = true)
    public Integer contarTiposAcessibilidadePorLocal(Long idLocal) {
        log.info("Contando tipos de acessibilidade do local ID: {}", idLocal);
        validarExistenciaLocal(idLocal);
        return localRepository.countTiposAcessibilidadeByLocalId(idLocal);
    }
    
    @Transactional(readOnly = true)
    public List<Local> buscarHierarquiaCompleta(Long idLocal) {
        log.info("Buscando hierarquia completa para local ID: {}", idLocal);
        validarExistenciaLocal(idLocal);
        List<Local> hierarquia = new ArrayList<>();
        Local atual = localRepository.findById(idLocal).get();
        while (atual != null) {
            hierarquia.add(0, atual);
            atual = atual.getLocalPrincipal();
        }
        return hierarquia;
    }
    
    @Transactional(readOnly = true)
    public List<Local> buscarDescendentes(Long idLocal) {
        log.info("Buscando todos os descendentes do local ID: {}", idLocal);
        validarExistenciaLocal(idLocal);
        return localRepository.buscarTodosDescendentes(idLocal);
    }
    
    @Transactional(readOnly = true)
    public List<Local> buscarAncestrais(Long idLocal) {
        log.info("Buscando todos os ancestrais do local ID: {}", idLocal);
        validarExistenciaLocal(idLocal);
        return localRepository.buscarTodosAncestrais(idLocal);
    }
    
    @Transactional(readOnly = true)
    public List<Local> buscarLocaisPorNome(String nome, Pageable pageable) {
        log.info("Buscando locais por nome: {}", nome);
        return localRepository.buscarPorNomeLike(nome, pageable);
    }

    @Transactional
    public Local salvar(LocalRequestDTO dto) {
        log.info("Salvando novo local: nome={}", dto.getNome());

        // Validação dos tipos de acessibilidade
        if (dto.getTiposAcessibilidade() == null || dto.getTiposAcessibilidade().isEmpty()) {
            throw new IllegalArgumentException("Pelo menos um tipo de acessibilidade deve ser informado");
        }

        Usuario usuario = validarUsuario(dto.getIdUsuario());
        
        Endereco endereco = resolverEndereco(dto);
    
        Local localPrincipal = validarLocalPrincipal(dto.getIdLocalPrincipal(), null);
        
        validarHierarquia(localPrincipal, null);
        
        Local local = LocalMapper.toEntity(dto, usuario, endereco);
        local.setLocalPrincipal(localPrincipal); 
        
        Local salvo = localRepository.save(local);
        
        if (localPrincipal != null) {
            localPrincipal.adicionarSubLocal(salvo);
            localRepository.save(localPrincipal);
        }
        
        log.info("Local salvo com sucesso. ID: {}, Tipos de acessibilidade: {}", 
            salvo.getIdLocal(), salvo.getTiposAcessibilidade());
        return salvo;
    }
    
    @Transactional
    public Optional<Local> atualizar(Long id, LocalRequestDTO dto) {
        log.info("Atualizando local: id={}", id);

        // Validação dos tipos de acessibilidade
        if (dto.getTiposAcessibilidade() == null || dto.getTiposAcessibilidade().isEmpty()) {
            throw new IllegalArgumentException("Pelo menos um tipo de acessibilidade deve ser informado");
        }

        return localRepository.findById(id).map(local -> {
    
            Usuario usuario = validarUsuario(dto.getIdUsuario());
            Endereco endereco = resolverEndereco(dto);
            
            Local novoLocalPrincipal = validarLocalPrincipal(dto.getIdLocalPrincipal(), id);
            
            validarHierarquia(novoLocalPrincipal, id);
            
            if (local.getLocalPrincipal() != null) {
                local.getLocalPrincipal().getSubLocais().remove(local);
                localRepository.save(local.getLocalPrincipal());
            }
            
            LocalMapper.updateEntity(local, dto, usuario, endereco);
            local.setLocalPrincipal(novoLocalPrincipal);
            
            Local atualizado = localRepository.save(local);
            
            if (novoLocalPrincipal != null) {
                novoLocalPrincipal.adicionarSubLocal(atualizado);
                localRepository.save(novoLocalPrincipal);
            }
            
            log.info("Local atualizado com sucesso. ID: {}, Tipos de acessibilidade: {}", 
                atualizado.getIdLocal(), atualizado.getTiposAcessibilidade());
            return atualizado;
        });
    }
    
    @Transactional
    public Local atualizarTiposAcessibilidade(Long id, Set<TipoAcessibilidade> novosTipos) {
        log.info("Atualizando tipos de acessibilidade do local ID: {} para {}", id, novosTipos);
        
        if (novosTipos == null || novosTipos.isEmpty()) {
            throw new IllegalArgumentException("Pelo menos um tipo de acessibilidade deve ser informado");
        }
        
        Local local = localRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado com ID: " + id));
        
        local.getTiposAcessibilidade().clear();
        local.getTiposAcessibilidade().addAll(novosTipos);
        
        Local atualizado = localRepository.save(local);
        log.info("Tipos de acessibilidade atualizados para local ID: {}", id);
        return atualizado;
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando local: id={}", id);
        
        Local local = localRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado com ID: " + id));
        
        if (localRepository.hasSubLocais(id)) {
            long countSubLocais = localRepository.countSubLocais(id);
            throw new IllegalStateException(
                String.format("Não é possível deletar o local '%s' pois ele possui %d sub-local(is). " +
                "Mova ou delete os sub-locais primeiro.", local.getNome(), countSubLocais)
            );
        }
         
        if (local.getLocalPrincipal() != null) {
            local.getLocalPrincipal().getSubLocais().remove(local);
            localRepository.save(local.getLocalPrincipal());
        }
        
        localRepository.deleteById(id);
        log.info("Local deletado com sucesso. ID: {}", id);
        return true;
    }
    
    @Transactional
    public void atualizarStatus(Long id, StatusLocal novoStatus) {
        log.info("Atualizando status do local ID: {} para {}", id, novoStatus);
        Local local = localRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));
        local.setStatus(novoStatus);
        localRepository.save(local);
        log.info("Status do local ID: {} atualizado para {}", id, novoStatus);
    }
    
    @Transactional
    public void moverLocal(Long idLocal, Long idNovoPai) {
        log.info("Movendo local ID: {} para novo pai ID: {}", idLocal, idNovoPai);
        
        Local local = localRepository.findById(idLocal)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));
        
        Local novoPai = null;
        if (idNovoPai != null) {
            novoPai = localRepository.findById(idNovoPai)
                    .orElseThrow(() -> new IllegalArgumentException("Local pai não encontrado"));
            
            if (isCicloHierarquico(novoPai, idLocal)) {
                throw new IllegalArgumentException("Não é possível mover: esta operação criaria um ciclo na hierarquia");
            }
            
            int novaProfundidade = getProfundidadeHierarquia(novoPai) + 1;
            if (novaProfundidade > MAX_PROFUNDIDADE_HIERARQUIA) {
                throw new IllegalArgumentException(
                    String.format("Profundidade máxima de %d níveis excedida", MAX_PROFUNDIDADE_HIERARQUIA)
                );
            }
        }
        
        if (local.getLocalPrincipal() != null) {
            local.getLocalPrincipal().getSubLocais().remove(local);
            localRepository.save(local.getLocalPrincipal());
        }
        
        local.setLocalPrincipal(novoPai);
        
        if (novoPai != null) {
            novoPai.getSubLocais().add(local);
            localRepository.save(novoPai);
        }
        
        localRepository.save(local);
        log.info("Local ID: {} movido com sucesso", idLocal);
    }
    
    @Transactional
    public void recalcularMediaAvaliacoes(Long idLocal) {
        log.info("Recalculando média de avaliações para local ID: {}", idLocal);
        Local local = localRepository.findById(idLocal)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));
        Double media = avaliacaoRepository.calcularMediaPorLocal(idLocal);
        local.setAvaliacaoMedia(media != null ? media : 0.0);
        localRepository.save(local);
        log.info("Média de avaliações atualizada para local ID {}: {}", idLocal, local.getAvaliacaoMedia());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasGerais() {
        log.info("Obtendo estatísticas gerais para locais");
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsuarios", usuarioRepository.count());
        stats.put("totalLocais", localRepository.count());
        stats.put("totalAvaliacoes", avaliacaoRepository.count());
        return stats;
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> obterEstatisticasHierarquia(Long idLocal) {
        log.info("Obtendo estatísticas de hierarquia para local ID: {}", idLocal);
        validarExistenciaLocal(idLocal);
        Map<String, Object> stats = new HashMap<>();
        stats.put("profundidade", getProfundidadeHierarquia(localRepository.findById(idLocal).get()));
        stats.put("totalDescendentes", localRepository.buscarTodosDescendentes(idLocal).size());
        stats.put("totalSubLocaisDiretos", localRepository.countSubLocais(idLocal));
        return stats;
    }
    
    // Métodos privados de validação
    private Usuario validarUsuario(Long idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + idUsuario));
    }
    
    private Local validarLocalPrincipal(Long idLocalPrincipal, Long idLocalAtual) {
        if (idLocalPrincipal == null) {
            return null;
        }
        Local localPrincipal = localRepository.findById(idLocalPrincipal)
                .orElseThrow(() -> new IllegalArgumentException("Local principal não encontrado com ID: " + idLocalPrincipal));
        if (idLocalAtual != null && localPrincipal.getIdLocal().equals(idLocalAtual)) {
            throw new IllegalArgumentException("Um local não pode ser principal de si mesmo");
        }
        return localPrincipal;
    }
    
    private void validarHierarquia(Local localPrincipal, Long idLocalAtual) {
        if (localPrincipal == null) return;
        
        int profundidadeAtual = getProfundidadeHierarquia(localPrincipal);
        if (profundidadeAtual + 1 > MAX_PROFUNDIDADE_HIERARQUIA) {
            throw new IllegalArgumentException(
                String.format("Profundidade máxima de %d níveis excedida. " +
                "A profundidade atual do pai é %d e o limite é %d.", 
                MAX_PROFUNDIDADE_HIERARQUIA, profundidadeAtual, MAX_PROFUNDIDADE_HIERARQUIA - 1)
            );
        }
        
        if (idLocalAtual != null && isCicloHierarquico(localPrincipal, idLocalAtual)) {
            throw new IllegalArgumentException("Esta operação criaria um ciclo na hierarquia");
        }
    }
    
    private Endereco resolverEndereco(LocalRequestDTO dto) {
        if (dto.getEndereco() != null) {
            if (dto.getEndereco().getIdUsuario() == null) {
                dto.getEndereco().setIdUsuario(dto.getIdUsuario());
            }
            Endereco endereco = EnderecoMapper.toEntity(dto.getEndereco());
            enderecoService.validarEndereco(endereco);
            return enderecoRepository.save(endereco);
        }
        if (dto.getIdEndereco() == null) {
            throw new IllegalArgumentException("Endereço é obrigatório");
        }
        return enderecoRepository.findById(dto.getIdEndereco())
                .orElseThrow(() -> new IllegalArgumentException("Endereço não encontrado com ID: " + dto.getIdEndereco()));
    }
    
    private int getProfundidadeHierarquia(Local local) {
        int profundidade = 0;
        Local atual = local;
        while (atual != null && atual.getLocalPrincipal() != null) {
            profundidade++;
            atual = atual.getLocalPrincipal();
        }
        return profundidade;
    }
    
    private boolean isCicloHierarquico(Local local, Long idLocalFilho) {
        Local atual = local;
        while (atual != null) {
            if (atual.getIdLocal().equals(idLocalFilho)) {
                return true;
            }
            atual = atual.getLocalPrincipal();
        }
        return false;
    }
    
    private void validarExistenciaLocal(Long idLocal) {
        if (!localRepository.existsById(idLocal)) {
            throw new IllegalArgumentException("Local não encontrado com ID: " + idLocal);
        }
    }
}