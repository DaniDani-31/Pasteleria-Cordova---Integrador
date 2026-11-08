package com.pastelerias.dto;

public class ClienteTopDTO {
    private String nombreCliente;
    private Long totalCompras;

    public ClienteTopDTO(String nombreCliente, Long totalCompras) {
        this.nombreCliente = nombreCliente;
        this.totalCompras = totalCompras;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public Long getTotalCompras() {
        return totalCompras;
    }
}
