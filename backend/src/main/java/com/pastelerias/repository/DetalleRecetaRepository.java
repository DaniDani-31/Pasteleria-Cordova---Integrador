
package com.pastelerias.repository;

import com.pastelerias.model.DetalleReceta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleRecetaRepository
        extends JpaRepository<DetalleReceta, Long> {

    List<DetalleReceta> findByReceta_IdReceta(Long idReceta);

    void deleteByReceta_IdReceta(Long idReceta);
}
