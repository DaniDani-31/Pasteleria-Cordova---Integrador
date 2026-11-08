package com.pastelerias.dto;

import java.time.LocalDate;

public class VentaHistoricaDTO {

    private Long idProducto;
    private String nombreProducto;
    private LocalDate fechaCompra;
    private Double precio;
    private Integer cantidad;
    private Double subtotal;

    public VentaHistoricaDTO() {
    }

    public VentaHistoricaDTO(
            Long idProducto,
            String nombreProducto,
            LocalDate fechaCompra,
            Double precio,
            Integer cantidad,
            Double subtotal) {

        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.fechaCompra = fechaCompra;
        this.precio = precio;
        this.cantidad = cantidad;
        this.subtotal = subtotal;
    }

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

    public LocalDate getFechaCompra() {
        return fechaCompra;
    }

    public void setFechaCompra(LocalDate fechaCompra) {
        this.fechaCompra = fechaCompra;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
}