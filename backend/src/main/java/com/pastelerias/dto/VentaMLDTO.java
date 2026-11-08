package com.pastelerias.dto;

import java.time.LocalDate;

public class VentaMLDTO {

    private LocalDate fecha;
    private Long idProducto;
    private String nombreProducto;
    private Long cantidadVendida;

    public VentaMLDTO() {
    }

    public VentaMLDTO(
            LocalDate fecha,
            Long idProducto,
            String nombreProducto,
            Long cantidadVendida) {

        this.fecha = fecha;
        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.cantidadVendida = cantidadVendida;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
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

    public Long getCantidadVendida() {
        return cantidadVendida;
    }

    public void setCantidadVendida(Long cantidadVendida) {
        this.cantidadVendida = cantidadVendida;
    }
}