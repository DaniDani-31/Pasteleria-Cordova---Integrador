package com.pastelerias.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "contacto")
public class Contacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_contacto;

    private String nombre;
    private String correo;
    private String telefono;
    private String mensaje;

    @Column(name = "fecha_envio", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fecha_envio;

    // ⚙️ Establecer fecha automáticamente antes de guardar
    @PrePersist
    public void prePersist() {
        if (fecha_envio == null) {
            fecha_envio = LocalDateTime.now();
        }
    }
}
