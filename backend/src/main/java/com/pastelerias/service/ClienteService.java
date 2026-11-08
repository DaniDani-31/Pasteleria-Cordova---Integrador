package com.pastelerias.service;

import com.pastelerias.dto.ClienteDTO;
import com.pastelerias.model.Cliente;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ClienteService {

    List<Cliente> listarClientes();

    Cliente obtenerPorId(Long id);

    Cliente guardar(Cliente cliente);

    void eliminar(Long id);

    ResponseEntity<?> registrar(Cliente cliente);

    ResponseEntity<?> login(String correo, String contrasena);

    ClienteDTO obtenerClienteDTO(Long id);

    ResponseEntity<?> registrarAdmin(Cliente cliente);

}
