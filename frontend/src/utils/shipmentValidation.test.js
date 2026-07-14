import { describe, expect, it } from 'vitest';
import {
  MAX_DIMENSION_CM,
  MAX_WEIGHT_KG,
  sanitizeShipmentField,
  validateContentDescriptionCoherence,
  validateDimension,
  validateDocumentNumber,
  validateEmail,
  validatePackageBaseOrientation,
  validatePhone,
  validatePositiveNumber,
  validateShipmentNumericFields,
  validateWeight,
  validateDistinctContact,
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

  describe('limites min/max de peso y dimensiones', () => {
    it('peso: rechaza 0, negativo, no numerico y sobre el maximo; acepta limites', () => {
      expect(validateWeight('0')).toContain('mayor a 0');
      expect(validateWeight('-1')).toContain('numeros');
      expect(validateWeight('abc')).toContain('numeros');
      expect(validateWeight('0.01')).toBe('');                 // limite inferior valido
      expect(validateWeight(String(MAX_WEIGHT_KG))).toBe('');   // limite superior valido
      expect(validateWeight(String(MAX_WEIGHT_KG + 0.01))).toContain('no debe superar');
      expect(validateWeight('999999')).toContain('no debe superar');
    });

    it('dimension: rechaza 0 y sobre el maximo; acepta limites', () => {
      expect(validateDimension('0')).toContain('mayores a 0');
      expect(validateDimension('1')).toBe('');
      expect(validateDimension(String(MAX_DIMENSION_CM))).toBe('');       // limite superior valido
      expect(validateDimension(String(MAX_DIMENSION_CM + 0.01))).toContain('no deben superar');
      expect(validateDimension('50000')).toContain('no deben superar');
    });

    it('validatePositiveNumber respeta la cota superior opcional', () => {
      expect(validatePositiveNumber('12', 'msg', { max: 10, maxMessage: 'tope' })).toBe('tope');
      expect(validatePositiveNumber('8', 'msg', { max: 10 })).toBe('');
    });

    it('validateShipmentNumericFields: sobre solo valida peso; paquete valida dimensiones', () => {
      const sobre = validateShipmentNumericFields(
        { peso_kg: '0', largo_cm: '0', ancho_cm: '0', alto_cm: '0' },
        { isEnvelope: true },
      );
      expect(sobre.peso_kg).toContain('mayor a 0');
      expect(sobre.largo_cm).toBeUndefined();

      const paquete = validateShipmentNumericFields(
        { peso_kg: '10', largo_cm: '999', ancho_cm: '30', alto_cm: '20' },
        { isEnvelope: false },
      );
      expect(paquete.peso_kg).toBeUndefined();
      expect(paquete.largo_cm).toContain('no deben superar');
    });
  });

  describe('validateDistinctContact', () => {
    it('personas distintas no pueden compartir celular ni correo', () => {
      const errors = validateDistinctContact({
        remitente_numero_documento: '70123456',
        destinatario_numero_documento: '70876543',
        remitente_telefono: '987654321',
        destinatario_telefono: '987654321',
        remitente_correo: 'a@test.com',
        destinatario_correo: 'A@test.com',
      });
      expect(errors.destinatario_telefono).toContain('mismo celular');
      expect(errors.destinatario_correo).toContain('mismo correo');
    });

    it('misma persona (mismo DNI) si puede compartir contacto', () => {
      const errors = validateDistinctContact({
        remitente_numero_documento: '70123456',
        destinatario_numero_documento: '70123456',
        remitente_telefono: '987654321',
        destinatario_telefono: '987654321',
        remitente_correo: 'a@test.com',
        destinatario_correo: 'a@test.com',
      });
      expect(errors).toEqual({});
    });
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

  describe('validateContentDescriptionCoherence', () => {
    const validCases = [
      ['DOCUMENTOS', 'un sobre con contratos y facturas'],
      ['DOCUMENTOS', 'papeles de la universidad'],
      ['ROPA', 'dos casacas y un pantalon jean'],
      ['ROPA', 'zapatos y prendas de vestir'],
      ['ELECTRONICOS', 'televisor smart con parlante'],
      ['ELECTRONICOS', 'laptop con cargador y mouse'],
      ['ELECTRODOMESTICOS', 'una refrigeradora familiar'],
      ['ELECTRODOMESTICOS', 'cocina y microondas'],
      ['ALIMENTOS', 'saco de papas'],
      ['ALIMENTOS', 'canasta de frutas'],
      ['OTROS', 'herramientas de trabajo'],
      ['OTROS', 'repuestos varios para taller'],
      ['ROPA', 'una chompa y tres polos'],
      ['DOCUMENTOS', 'libros y cuadernos'],
      ['ALIMENTOS', 'arroz azucar y fideos'],
    ];

    it.each(validCases)('acepta descripcion coherente para %s: %s', (contentType, description) => {
      expect(validateContentDescriptionCoherence(contentType, description)).toBe('');
    });

    const invalidCases = [
      ['ROPA', 'refrigeradora nueva', 'Electrodomesticos'],
      ['ALIMENTOS', 'televisor de 32 pulgadas', 'Electronicos'],
      ['DOCUMENTOS', 'saco de arroz', 'Alimentos'],
      ['ROPA', 'olla arrocera', 'Electrodomesticos'],
      ['DOCUMENTOS', 'pantalones y casacas', 'Ropa'],
      ['ELECTRODOMESTICOS', 'papeles de contrato', 'Documentos'],
      ['ALIMENTOS', 'celular y audifonos', 'Electronicos'],
      ['ELECTRONICOS', 'canasta de verduras', 'Alimentos'],
      ['ROPA', 'microondas pequeno', 'Electrodomesticos'],
      ['DOCUMENTOS', 'zapatillas deportivas', 'Ropa'],
      ['ALIMENTOS', 'monitor de computadora', 'Electronicos'],
      ['ELECTRODOMESTICOS', 'folder con boletas', 'Documentos'],
      ['DOCUMENTOS', 'licuadora y tostadora', 'Electrodomesticos'],
      ['ROPA', 'conservas y galletas', 'Alimentos'],
      ['ALIMENTOS', 'router inalambrico', 'Electronicos'],
    ];

    it.each(invalidCases)(
      'detecta incoherencia entre %s y "%s"',
      (contentType, description, expectedCategory) => {
        const error = validateContentDescriptionCoherence(contentType, description);

        expect(error).toContain('no coincide');
        expect(error).toContain(expectedCategory);
      },
    );
  });
});
