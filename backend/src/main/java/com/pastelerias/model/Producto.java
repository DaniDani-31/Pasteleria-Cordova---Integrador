package com.pastelerias.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "productos")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "detalles" })
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    private String nombreProducto;
    private String descripcion;
    private Double precio;
    private Integer stock;

    @Column(name = "fecha_creacion", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion;

    @Column(name = "costo_produccion", precision = 12, scale = 2)
    private BigDecimal costoProduccion;
}
