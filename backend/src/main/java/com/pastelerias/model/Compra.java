package com.pastelerias.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Getter
@Setter
@Table(name = "compras")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compra")
    private Long idCompra;

    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    @JsonIgnoreProperties({ "contrasena", "rol", "compras" })
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private Cliente cliente;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({ "compra" })
    private List<DetalleCompra> detalles = new ArrayList<>();;

    private Double total;

    @Column(name = "fecha_compra", nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaCompra;

    private String estado = "Pendiente";

    @PrePersist
    public void prePersist() {
        if (fechaCompra == null) {
            fechaCompra = LocalDate.now();
        }
        if (estado == null) {
            estado = "Pendiente";
        }
    }
}
