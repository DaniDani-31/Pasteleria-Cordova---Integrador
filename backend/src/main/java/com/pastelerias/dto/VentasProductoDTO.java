package com.pastelerias.dto;

public class VentasProductoDTO {

    private Long idProducto;
    private String nombreProducto;
    private Long totalVendido;

    // Constructor
    public VentasProductoDTO(Long idProducto, String nombreProducto, Long totalVendido) {
        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.totalVendido = totalVendido;
    }

    // Getters y Setters
    public Long getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Long idProducto) {
        this.idProducto = idProducto;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public Long getTotalVendido() {
        return totalVendido;
    }

    public void setTotalVendido(Long totalVendido) {
        this.totalVendido = totalVendido;
    }
}
