package com.pastelerias.service;

import com.pastelerias.model.DetalleCompra;
import java.util.List;

public interface DetalleCompraService {
    List<DetalleCompra> listarDetalles();

    DetalleCompra obtenerPorId(Integer id);

    DetalleCompra guardar(DetalleCompra detalle);

    void eliminar(Integer id);
}
