package com.pastelerias.dto;

public class ClienteMLDTO {

    private Long idCliente;
    private Integer numeroCompras;
    private Double gastoTotal;
    private Integer cantidadProductos;
    private Integer diasDesdeUltimaCompra;
    private Integer segmento;

    public ClienteMLDTO() {
    }

    public ClienteMLDTO(
            Long idCliente,
            Integer numeroCompras,
            Double gastoTotal,
            Integer cantidadProductos,
            Integer diasDesdeUltimaCompra) {

        this.idCliente = idCliente;
        this.numeroCompras = numeroCompras;
        this.gastoTotal = gastoTotal;
        this.cantidadProductos = cantidadProductos;
        this.diasDesdeUltimaCompra = diasDesdeUltimaCompra;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Integer getNumeroCompras() {
        return numeroCompras;
    }

    public void setNumeroCompras(Integer numeroCompras) {
        this.numeroCompras = numeroCompras;
    }

    public Double getGastoTotal() {
        return gastoTotal;
    }

    public void setGastoTotal(Double gastoTotal) {
        this.gastoTotal = gastoTotal;
    }

    public Integer getCantidadProductos() {
        return cantidadProductos;
    }

    public void setCantidadProductos(Integer cantidadProductos) {
        this.cantidadProductos = cantidadProductos;
    }

    public Integer getDiasDesdeUltimaCompra() {
        return diasDesdeUltimaCompra;
    }

    public void setDiasDesdeUltimaCompra(Integer diasDesdeUltimaCompra) {
        this.diasDesdeUltimaCompra = diasDesdeUltimaCompra;
    }

    public Integer getSegmento() {
        return segmento;
    }

    public void setSegmento(Integer segmento) {
        this.segmento = segmento;
    }
}