import { describe, expect, it } from 'vitest';
import {
  sanitizeShipmentField,
  validateDocumentNumber,
  validateEmail,
  validatePackageBaseOrientation,
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

  describe('validatePackageBaseOrientation', () => {
    const tallFridge = {
      contentType: 'ELECTRODOMESTICOS',
      description: 'refrigeradora',
      fragility: 'MEDIA',
      lengthCm: '60',
      widthCm: '60',
      heightCm: '170',
    };

    it('acepta base correcta para electrodomestico vertical (alto es la dimension mayor)', () => {
      // LARGO_ANCHO => la dimension vertical es el ALTO; 170 >= 60/1.3 => ok
      expect(validatePackageBaseOrientation({ ...tallFridge, baseOrientation: 'LARGO_ANCHO' })).toBe('');
    });

    it('rechaza base que tumba electrodomestico vertical', () => {
      // LARGO_ALTO => la dimension vertical es el ANCHO (60); max = 170; 60 < 170/1.3 => error
      const error = validatePackageBaseOrientation({ ...tallFridge, baseOrientation: 'LARGO_ALTO' });
      expect(error).toBeTruthy();
      expect(error).toContain('acostado');
    });

    it('no valida orientacion para paquetes normales no fragiles', () => {
      expect(validatePackageBaseOrientation({
        contentType: 'ROPA',
        description: 'camisas',
        fragility: 'BAJA',
        baseOrientation: 'LARGO_ALTO',
        lengthCm: '60',
        widthCm: '40',
        heightCm: '20',
      })).toBe('');
    });

    it('valida paquetes de fragilidad ALTA aunque no sean electrodomesticos', () => {
      // LARGO_ALTO => vertical = ANCHO = 20; max = 80; 20 < 80/1.3 = 61.5 => error
      const error = validatePackageBaseOrientation({
        contentType: 'ELECTRONICOS',
        description: 'monitor largo',
        fragility: 'ALTA',
        baseOrientation: 'LARGO_ALTO',
        lengthCm: '80',
        widthCm: '20',
        heightCm: '20',
      });
      expect(error).toBeTruthy();
    });

    it('devuelve vacio si la orientacion no esta seleccionada', () => {
      expect(validatePackageBaseOrientation({ ...tallFridge, baseOrientation: '' })).toBe('');
    });
  });
});
