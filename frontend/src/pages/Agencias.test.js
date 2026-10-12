import { describe, expect, it } from 'vitest';
import { getAvailablePlaces } from './Agencias.jsx';

describe('catálogo de lugares para agencias', () => {
  it('interpreta el contrato real de destinos y excluye lugares ocupados o inactivos', () => {
    const places = [
      { id: 1, nombre: 'Trujillo', activo: true },
      { id: 2, nombre: 'Agallpampa', activo: true },
      { id: 3, nombre: 'Otuzco', activo: false },
    ];
    expect(getAvailablePlaces(places, [{ destination_id: 1 }])).toEqual([
      { id: 2, name: 'Agallpampa' },
    ]);
  });
});
