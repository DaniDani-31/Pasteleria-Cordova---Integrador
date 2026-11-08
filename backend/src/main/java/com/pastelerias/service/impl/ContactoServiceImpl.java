package com.pastelerias.service.impl;

import com.pastelerias.model.Contacto;
import com.pastelerias.repository.ContactoRepository;
import com.pastelerias.service.ContactoService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactoServiceImpl implements ContactoService {

    private final ContactoRepository contactoRepository;

    public ContactoServiceImpl(ContactoRepository contactoRepository) {
        this.contactoRepository = contactoRepository;
    }

    @Override
    public List<Contacto> listarContactos() {
        return contactoRepository.findAll();
    }

    @Override
    public Contacto guardar(Contacto contacto) {
        return contactoRepository.save(contacto);
    }

    @Override
    public void eliminar(Long id) {
        contactoRepository.deleteById(id);
    }
}
