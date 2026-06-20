import { describe, expect, it } from 'vitest';
import {
  sanitizeShipmentField,
  validateDocumentNumber,
  validateEmail,
  validatePhone,
  validatePositiveNumber,
} from './shipmentValidation.js';

describe('shipmentValidation', () => {
  it('sanitiza DNI y telefono respetando longitudes', () => {
    expect(sanitizeShipmentField(
      'remitente_numero_documento',
      '12A34567890',
      { remitente_tipo_documento: 'DNI' },
    )).toBe('12345678');
    expect(sanitizeShipmentField('remitente_telefono', '98A76543210', {})).toBe('987654321');
  });

  it('valida DNI peruano', () => {
    expect(validateDocumentNumber('DNI', '12345678')).toBe('');
    expect(validateDocumentNumber('DNI', '1234567')).toContain('8');
    expect(validateDocumentNumber('DNI', '1234ABCD')).toContain('numeros');
  });

  it('valida telefono, correo y positivos', () => {
    expect(validatePhone('987654321')).toBe('');
    expect(validatePhone('812345678')).toContain('9');
    expect(validatePhone('999999999')).toContain('repetir');
    expect(validateEmail('qa@test.com')).toBe('');
    expect(validateEmail('qa-test')).toContain('correo');
    expect(validatePositiveNumber('10', 'El peso debe ser mayor a 0.')).toBe('');
    expect(validatePositiveNumber('0', 'El peso debe ser mayor a 0.')).toBe('El peso debe ser mayor a 0.');
  });
});
