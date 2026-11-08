package com.pastelerias.dto;

public class OptimizacionDTO {

    private Long idProducto;
    private String nombreProducto;
    private Integer stockActual;
    private Double demandaPredicha;
    private Integer stockSeguridad;
    private Integer reposicionSugerida;
    private String recomendacion;

    public OptimizacionDTO() {
    }

    public OptimizacionDTO(
            Long idProducto,
            String nombreProducto,
            Integer stockActual,
            Double demandaPredicha,
            Integer stockSeguridad,
            Integer reposicionSugerida,
            String recomendacion) {

        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.stockActual = stockActual;
        this.demandaPredicha = demandaPredicha;
        this.stockSeguridad = stockSeguridad;
        this.reposicionSugerida = reposicionSugerida;
        this.recomendacion = recomendacion;
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

    public Integer getStockSeguridad() {
        return stockSeguridad;
    }

    public void setStockSeguridad(Integer stockSeguridad) {
        this.stockSeguridad = stockSeguridad;
    }

    public Integer getReposicionSugerida() {
        return reposicionSugerida;
    }

    public void setReposicionSugerida(Integer reposicionSugerida) {
        this.reposicionSugerida = reposicionSugerida;
    }

    public String getRecomendacion() {
        return recomendacion;
    }

    public void setRecomendacion(String recomendacion) {
        this.recomendacion = recomendacion;
    }
}