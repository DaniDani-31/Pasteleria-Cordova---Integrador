package com.pastelerias.dto;

import java.time.LocalDate; // Usamos LocalDate en lugar de LocalDateTime si solo necesitas la fecha

public class CompraDTO {

    // Propiedades de la Compra
    private Long idCliente;
    private String nombreCliente;
    private Long idCompra;
    private Double total;
    private LocalDate fechaCompra;
    private String estado; // Campo importante que añadimos para el historial

    // Propiedades del Detalle y Producto
    private Long idProducto;
    private String nombreProducto;
    private Integer cantidad;
    private Double subtotal;

    public CompraDTO() {
    }

    // Constructor que Spring Data JPA/JPQL usará para mapear la consulta
    public CompraDTO(
            Long idCompra,
            Long idCliente,
            String nombreCliente,
            LocalDate fechaCompra,
            String estado,
            Double total,
            Long idProducto,
            String nombreProducto,
            Integer cantidad,
            Double subtotal) {

        this.idCompra = idCompra;
        this.idCliente = idCliente;
        this.nombreCliente = nombreCliente;
        this.fechaCompra = fechaCompra;
        this.estado = estado;
        this.total = total;
        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.cantidad = cantidad;
        this.subtotal = subtotal;
    }

    // --- Getters y Setters con camelCase ---

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public Long getIdCompra() {
        return idCompra;
    }

    public void setIdCompra(Long idCompra) {
        this.idCompra = idCompra;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public LocalDate getFechaCompra() {
        return fechaCompra;
    }

    public void setFechaCompra(LocalDate fechaCompra) {
        this.fechaCompra = fechaCompra;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
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