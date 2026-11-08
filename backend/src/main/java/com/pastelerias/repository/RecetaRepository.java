
package com.pastelerias.repository;

import com.pastelerias.model.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {

    Optional<Receta> findByProducto_IdProducto(Long idProducto);

    boolean existsByProducto_IdProducto(Long idProducto);
}
