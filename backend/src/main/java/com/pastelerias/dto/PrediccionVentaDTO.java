package com.pastelerias.dto;

public class PrediccionVentaDTO {

    private Long idProducto;
    private String nombreProducto;
    private Integer stockActual;
    private Double demandaPredicha;
    private String nivelDemanda;

    public PrediccionVentaDTO() {
    }

    public PrediccionVentaDTO(
            Long idProducto,
            String nombreProducto,
            Integer stockActual,
            Double demandaPredicha,
            String nivelDemanda) {

        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.stockActual = stockActual;
        this.demandaPredicha = demandaPredicha;
        this.nivelDemanda = nivelDemanda;
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

    public String getNivelDemanda() {
        return nivelDemanda;
    }

    public void setNivelDemanda(String nivelDemanda) {
        this.nivelDemanda = nivelDemanda;
    }
}