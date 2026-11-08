package com.pastelerias.service;

import com.pastelerias.model.Contacto;
import java.util.List;

public interface ContactoService {
    List<Contacto> listarContactos();

    Contacto guardar(Contacto contacto);

    void eliminar(Long id);
}
