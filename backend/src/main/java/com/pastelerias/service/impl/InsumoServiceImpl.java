
package com.pastelerias.service.impl;

import com.pastelerias.model.Insumo;
import com.pastelerias.repository.InsumoRepository;
import com.pastelerias.service.InsumoService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InsumoServiceImpl implements InsumoService {

    private final InsumoRepository insumoRepository;

    public InsumoServiceImpl(InsumoRepository insumoRepository) {
        this.insumoRepository = insumoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Insumo> listarInsumos() {
        return insumoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Insumo obtenerPorId(Long id) {
        return insumoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado: " + id));
    }

    @Override
    public Insumo guardar(Insumo insumo) {
        return insumoRepository.save(insumo);
    }

    @Override
    public void eliminar(Long id) {
        Insumo insumo = obtenerPorId(id);
        insumoRepository.delete(insumo);
    }
}
