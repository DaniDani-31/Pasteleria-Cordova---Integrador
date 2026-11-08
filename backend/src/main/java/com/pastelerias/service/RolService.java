package com.pastelerias.service;

import com.pastelerias.model.Rol;
import java.util.List;
import java.util.Optional;

public interface RolService {
    List<Rol> listarRoles();

    Optional<Rol> obtenerRolPorId(Long id);

    Rol guardar(Rol rol);

    Rol actualizarRol(Long id, Rol rol);

    void eliminar(Long id);
}
