import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCATION_NAMES,
  getLocationOptionsByProvince,
  getProvinceForLocation,
} from './locationHierarchy.js';

describe('locationHierarchy', () => {
  it('contiene el catalogo actual de 19 destinos', () => {
    expect(DEFAULT_LOCATION_NAMES).toHaveLength(19);
    expect(DEFAULT_LOCATION_NAMES).toContain('Orocullay');
    expect(DEFAULT_LOCATION_NAMES).toContain('Tambo Pampamarca Alta');
  });

  it('resuelve provincias y alias anteriores', () => {
    expect(getProvinceForLocation('Trujillo')).toBe('Trujillo');
    expect(getProvinceForLocation('Huayatan')).toBe('Santiago de Chuco');
    expect(getProvinceForLocation('Ugallama')).toBe('Santiago de Chuco');
  });

  it('genera opciones disponibles por provincia', () => {
    const options = getLocationOptionsByProvince(
      DEFAULT_LOCATION_NAMES,
      'Santiago de Chuco',
    );
    expect(options.some((option) => option.value === 'Angasmarca')).toBe(true);
    expect(options.some((option) => option.value === 'Trujillo')).toBe(false);
  });
});
