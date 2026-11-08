package com.pastelerias.service.impl;

import com.pastelerias.model.DetalleCompra;
import com.pastelerias.repository.DetalleCompraRepository;
import com.pastelerias.service.DetalleCompraService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DetalleCompraServiceImpl implements DetalleCompraService {

    private final DetalleCompraRepository detalleCompraRepository;

    public DetalleCompraServiceImpl(DetalleCompraRepository detalleCompraRepository) {
        this.detalleCompraRepository = detalleCompraRepository;
    }

    @Override
    public List<DetalleCompra> listarDetalles() {
        return detalleCompraRepository.findAll();
    }

    @Override
    public DetalleCompra obtenerPorId(Integer id) {
        return detalleCompraRepository.findById(id).orElse(null);
    }

    @Override
    public DetalleCompra guardar(DetalleCompra detalle) {
        return detalleCompraRepository.save(detalle);
    }

    @Override
    public void eliminar(Integer id) {
        detalleCompraRepository.deleteById(id);
    }
}
