package com.pastelerias.dto;

import java.util.List;

public class CompraRequest {
    private Long idCliente;
    private Double total;
    private String estado;
    private List<DetalleCompraRequest> detalles;

    // Getters y setters
    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public List<DetalleCompraRequest> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleCompraRequest> detalles) {
        this.detalles = detalles;
    }
}
