import { describe, expect, it } from 'vitest';
import {
  buildPublicShipmentPayload,
  emptyPublicShipmentForm,
  validatePublicShipmentForm,
} from './publicShipment.js';

function validForm(overrides = {}) {
  return {
    ...emptyPublicShipmentForm,
    remitente_numero_documento: '70123456',
    remitente_nombre: 'Remitente QA',
    remitente_telefono: '987654321',
    destinatario_numero_documento: '70876543',
    destinatario_nombre: 'Destinatario QA',
    destinatario_telefono: '976543210',
    origen: 'Trujillo',
    destino: 'Shorey',
    descripcion: 'Sobre de prueba',
    tipo_contenido: 'DOCUMENTOS',
    peso_kg: '1',
    fragilidad: 'BAJA',
    ...overrides,
  };
}

describe('public shipment validation', () => {
  it('rechaza origen y destino iguales', () => {
    const errors = validatePublicShipmentForm(validForm({ destino: 'Trujillo' }));

    expect(errors.destino).toBe('El destino debe ser diferente al origen.');
  });

  it('permite sobres sin dimensiones y envia ceros al backend', () => {
    const form = validForm();

    expect(validatePublicShipmentForm(form)).toEqual({});
    expect(buildPublicShipmentPayload(form)).toMatchObject({
      tipo_contenido: 'DOCUMENTOS',
      largo_cm: 0,
      ancho_cm: 0,
      alto_cm: 0,
    });
  });

  it('mantiene las dimensiones obligatorias para paquetes', () => {
    const errors = validatePublicShipmentForm(validForm({ tipo_contenido: 'ROPA' }));

    expect(errors.largo_cm).toBeTruthy();
    expect(errors.ancho_cm).toBeTruthy();
    expect(errors.alto_cm).toBeTruthy();
  });

  it('ignora medidas, fragilidad y base en sobres aunque el formulario tenga residuos', () => {
    const form = validForm({
      tipo_contenido: 'DOCUMENTOS',
      descripcion: 'sobre con contratos',
      largo_cm: '40',
      ancho_cm: '30',
      alto_cm: '20',
      fragilidad: 'ALTA',
      orientacion_base: 'LARGO_ALTO',
    });

    expect(validatePublicShipmentForm(form)).toEqual({});
    expect(buildPublicShipmentPayload(form)).toMatchObject({
      tipo_contenido: 'DOCUMENTOS',
      largo_cm: 0,
      ancho_cm: 0,
      alto_cm: 0,
      fragilidad: 'BAJA',
      orientacion_base: null,
    });
  });

  it('requiere base para paquetes y la normaliza al construir payload', () => {
    const form = validForm({
      tipo_contenido: 'ROPA',
      descripcion: 'camisas',
      peso_kg: '2',
      largo_cm: '40',
      ancho_cm: '30',
      alto_cm: '20',
      fragilidad: 'BAJA',
      orientacion_base: '',
    });

    expect(validatePublicShipmentForm(form).orientacion_base).toContain('cara');

    const validPackage = { ...form, orientacion_base: 'largo_ancho' };
    expect(validatePublicShipmentForm(validPackage)).toEqual({});
    expect(buildPublicShipmentPayload(validPackage)).toMatchObject({
      tipo_contenido: 'ROPA',
      largo_cm: 40,
      ancho_cm: 30,
      alto_cm: 20,
      orientacion_base: 'LARGO_ANCHO',
    });
  });

  it('bloquea descripcion incoherente con tipo de contenido', () => {
    const errors = validatePublicShipmentForm(validForm({
      tipo_contenido: 'ROPA',
      descripcion: 'refrigeradora',
      peso_kg: '80',
      largo_cm: '70',
      ancho_cm: '60',
      alto_cm: '170',
      fragilidad: 'MEDIA',
      orientacion_base: 'LARGO_ANCHO',
    }));

    expect(errors.tipo_contenido).toContain('no coincide');
  });

  it('bloquea base insegura para electrodomesticos antes de pasar a pago', () => {
    const errors = validatePublicShipmentForm(validForm({
      tipo_contenido: 'ELECTRODOMESTICOS',
      descripcion: 'refrigeradora',
      peso_kg: '80',
      largo_cm: '70',
      ancho_cm: '60',
      alto_cm: '170',
      fragilidad: 'MEDIA',
      orientacion_base: 'LARGO_ALTO',
    }));

    expect(errors.orientacion_base).toContain('acostado');
  });
});
