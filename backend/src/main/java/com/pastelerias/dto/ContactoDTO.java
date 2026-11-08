package com.pastelerias.dto;

import java.time.LocalDateTime;

public class ContactoDTO {
    private Long id_contacto;
    private String nombre;
    private String correo;
    private String telefono;
    private String mensaje;
    private LocalDateTime fecha_envio;

    public ContactoDTO() {
    }

    public ContactoDTO(Long id_contacto, String nombre, String correo, String telefono, String mensaje,
            LocalDateTime fecha_envio) {
        this.id_contacto = id_contacto;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.mensaje = mensaje;
        this.fecha_envio = fecha_envio;
    }

    public Long getId_contacto() {
        return id_contacto;
    }

    public void setId_contacto(Long id_contacto) {
        this.id_contacto = id_contacto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFecha_envio() {
        return fecha_envio;
    }

    public void setFecha_envio(LocalDateTime fecha_envio) {
        this.fecha_envio = fecha_envio;
    }
}
