package com.pastelerias.dto;

public class InventarioMLDTO {

    private Long idProducto;
    private String nombreProducto;
    private Integer stockActual;
    private Double demandaPredicha;
    private Double cobertura;
    private String estadoInventario;

    public InventarioMLDTO() {
    }

    public InventarioMLDTO(
            Long idProducto,
            String nombreProducto,
            Integer stockActual,
            Double demandaPredicha,
            Double cobertura,
            String estadoInventario) {

        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.stockActual = stockActual;
        this.demandaPredicha = demandaPredicha;
        this.cobertura = cobertura;
        this.estadoInventario = estadoInventario;
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

    public Integer getStockActual() {
        return stockActual;
    }

    public void setStockActual(Integer stockActual) {
        this.stockActual = stockActual;
    }

    public Double getDemandaPredicha() {
        return demandaPredicha;
    }

    public void setDemandaPredicha(Double demandaPredicha) {
        this.demandaPredicha = demandaPredicha;
    }

    public Double getCobertura() {
        return cobertura;
    }

    public void setCobertura(Double cobertura) {
        this.cobertura = cobertura;
    }

    public String getEstadoInventario() {
        return estadoInventario;
    }

    public void setEstadoInventario(String estadoInventario) {
        this.estadoInventario = estadoInventario;
    }
}