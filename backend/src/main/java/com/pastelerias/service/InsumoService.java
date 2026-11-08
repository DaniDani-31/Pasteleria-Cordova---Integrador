
package com.pastelerias.service;

import com.pastelerias.model.Insumo;
import java.util.List;

public interface InsumoService {

    List<Insumo> listarInsumos();

    Insumo obtenerPorId(Long id);

    Insumo guardar(Insumo insumo);

    void eliminar(Long id);
}
