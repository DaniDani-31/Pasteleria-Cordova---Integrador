package com.pastelerias.service;

import com.pastelerias.model.Producto;
import java.util.List;

public interface ProductoService {
    List<Producto> listarProductos();

    Producto obtenerPorId(Long id);

    Producto guardar(Producto producto);

    void eliminar(Long id);
}
