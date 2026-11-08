
package com.pastelerias.service.impl;

import com.pastelerias.model.Insumo;
import com.pastelerias.model.Merma;
import com.pastelerias.repository.InsumoRepository;
import com.pastelerias.repository.MermaRepository;
import com.pastelerias.service.MermaService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import com.pastelerias.dto.ResumenMermaDTO;
import com.pastelerias.dto.ResumenMotivoDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@Transactional
public class MermaServiceImpl implements MermaService {

    private final MermaRepository mermaRepository;
    private final InsumoRepository insumoRepository;

    public MermaServiceImpl(
            MermaRepository mermaRepository,
            InsumoRepository insumoRepository) {
        this.mermaRepository = mermaRepository;
        this.insumoRepository = insumoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Merma> listarMermas() {
        return mermaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Merma obtenerPorId(Long id) {
        return mermaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Merma no encontrada: " + id));
    }

    @Override
    public Merma registrar(Merma merma) {

        // Validar que exista exactamente un tipo de inventario.
        boolean tieneInsumo = merma.getInsumo() != null;
        boolean tieneProducto = merma.getProducto() != null;

        if (tieneInsumo == tieneProducto) {
            throw new IllegalArgumentException(
                    "Debe seleccionar un insumo o un producto, pero no ambos.");
        }

        // Por ahora, el registro de productos terminados
        // se habilitará cuando incorporemos su costo de producción.
        if (tieneProducto) {
            throw new IllegalArgumentException(
                    "El registro de mermas de productos estará disponible " +
                            "cuando se incorpore el costo de producción.");
        }

        // Validar cantidad.
        if (merma.getCantidad() == null ||
                merma.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad de la merma debe ser mayor que cero.");
        }

        // Validar motivo.
        if (merma.getMotivo() == null ||
                merma.getMotivo().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Debe especificar el motivo de la merma.");
        }

        // Buscar el insumo registrado en la base de datos.
        Long idInsumo = merma.getInsumo().getIdInsumo();

        Insumo insumo = insumoRepository.buscarPorIdConBloqueo(idInsumo)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado: " + idInsumo));

        // Comprobar stock disponible.
        if (insumo.getStock() == null ||
                insumo.getStock().compareTo(merma.getCantidad()) < 0) {
            throw new IllegalArgumentException(
                    "Stock insuficiente para registrar esta merma.");
        }

        // Calcular el costo de la pérdida.
        BigDecimal costoUnitario = insumo.getCostoUnitario();

        if (costoUnitario == null ||
                costoUnitario.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "El costo unitario del insumo no es válido.");
        }

        BigDecimal costoTotal = costoUnitario
                .multiply(merma.getCantidad())
                .setScale(2, RoundingMode.HALF_UP);

        // Descontar la cantidad del inventario.
        insumo.setStock(
                insumo.getStock().subtract(merma.getCantidad()));

        insumoRepository.save(insumo);

        // Guardar el costo histórico de la merma.
        merma.setInsumo(insumo);
        merma.setCostoUnitario(costoUnitario);
        merma.setCostoTotal(costoTotal);

        return mermaRepository.save(merma);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenMermaDTO obtenerResumen() {

        Long totalMermas = mermaRepository.contarMermasFiltradas(
                null, null, null, null);

        BigDecimal totalPerdidas = mermaRepository.obtenerTotalPerdidasFiltradas(
                null, null, null, null);

        List<ResumenMotivoDTO> resumenPorMotivo = mermaRepository.obtenerResumenPorMotivoFiltrado(
                null, null, null, null);

        return new ResumenMermaDTO(
                totalMermas,
                totalPerdidas,
                resumenPorMotivo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Merma> listarMermasFiltradas(
            LocalDate desde,
            LocalDate hasta,
            String tipo,
            String motivo) {

        validarFechas(desde, hasta);

        LocalDateTime fechaDesde = desde != null
                ? desde.atStartOfDay()
                : null;

        LocalDateTime fechaHasta = hasta != null
                ? hasta.atTime(LocalTime.MAX)
                : null;

        String tipoNormalizado = normalizarTipo(tipo);
        String motivoNormalizado = normalizarMotivo(motivo);

        return mermaRepository.buscarConFiltros(
                fechaDesde,
                fechaHasta,
                tipoNormalizado,
                motivoNormalizado);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenMermaDTO obtenerResumenFiltrado(
            LocalDate desde,
            LocalDate hasta,
            String tipo,
            String motivo) {

        validarFechas(desde, hasta);

        LocalDateTime fechaDesde = desde != null
                ? desde.atStartOfDay()
                : null;

        LocalDateTime fechaHasta = hasta != null
                ? hasta.atTime(LocalTime.MAX)
                : null;

        String tipoNormalizado = normalizarTipo(tipo);
        String motivoNormalizado = normalizarMotivo(motivo);

        Long total = mermaRepository.contarMermasFiltradas(
                fechaDesde, fechaHasta, tipoNormalizado, motivoNormalizado);

        BigDecimal perdidas = mermaRepository.obtenerTotalPerdidasFiltradas(
                fechaDesde, fechaHasta, tipoNormalizado, motivoNormalizado);

        List<ResumenMotivoDTO> motivos = mermaRepository.obtenerResumenPorMotivoFiltrado(
                fechaDesde, fechaHasta,
                tipoNormalizado, motivoNormalizado);

        return new ResumenMermaDTO(total, perdidas, motivos);
    }

    private void validarFechas(LocalDate desde, LocalDate hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw new IllegalArgumentException(
                    "La fecha inicial no puede ser posterior a la fecha final.");
        }
    }

    private String normalizarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return null;
        }

        String valor = tipo.trim().toUpperCase();

        if (!valor.equals("INSUMO") && !valor.equals("PRODUCTO")) {
            throw new IllegalArgumentException(
                    "El tipo debe ser INSUMO o PRODUCTO.");
        }

        return valor;
    }

    private String normalizarMotivo(String motivo) {
        return motivo == null || motivo.isBlank()
                ? null
                : motivo.trim();
    }

}
