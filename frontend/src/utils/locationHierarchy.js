export const DEFAULT_LOCATION_NAMES = [
  'Trujillo',
  'Shorey',
  'Huaycatan',
  'Santiago de Chuco',
  'Chacomas',
  'Cachicadan',
  'Santa Cruz',
  'Cochapampa',
  'Ugallama',
  'Villacruz',
  'Las Manzanas',
  'Angasmarca',
  'Tambo Pampamarca Alta',
  'Psicochaca',
  'Santa Clara de Tulpo',
  'La Yeguada',
  'Mollebamba',
  'Cochamarca',
  'Orocullay',
];

export const LOCATION_PROVINCES = ['Trujillo', 'Santiago de Chuco'];

const LOCATION_CATALOG = {
  Trujillo: [
    { label: 'Trujillo', aliases: ['Trujillo'] },
  ],
  'Santiago de Chuco': [
    { label: 'Shorey', aliases: ['Shorey'] },
    { label: 'Huaycatan', aliases: ['Huaycatan', 'Huayatan'] },
    { label: 'Santiago de Chuco', aliases: ['Santiago de Chuco'] },
    { label: 'Chacomas', aliases: ['Chacomas'] },
    { label: 'Cachicadan', aliases: ['Cachicadan'] },
    { label: 'Santa Cruz', aliases: ['Santa Cruz', 'Santa Cruz de Chuca'] },
    { label: 'Cochapampa', aliases: ['Cochapampa'] },
    { label: 'Ugallama', aliases: ['Ugallama', 'Algallama'] },
    { label: 'Villacruz', aliases: ['Villacruz'] },
    { label: 'Las Manzanas', aliases: ['Las Manzanas'] },
    { label: 'Angasmarca', aliases: ['Angasmarca'] },
    { label: 'Tambo Pampamarca Alta', aliases: ['Tambo Pampamarca Alta'] },
    { label: 'Psicochaca', aliases: ['Psicochaca'] },
    { label: 'Santa Clara de Tulpo', aliases: ['Santa Clara de Tulpo'] },
    { label: 'La Yeguada', aliases: ['La Yeguada'] },
    { label: 'Mollebamba', aliases: ['Mollebamba'] },
    { label: 'Cochamarca', aliases: ['Cochamarca'] },
    { label: 'Orocullay', aliases: ['Orocullay'] },
  ],
};

function normalizeLocation(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function getProvinceForLocation(location) {
  const normalizedLocation = normalizeLocation(location);

  for (const province of LOCATION_PROVINCES) {
    const match = LOCATION_CATALOG[province].some((entry) =>
      entry.aliases.some((alias) => normalizeLocation(alias) === normalizedLocation),
    );
    if (match) return province;
  }

  return 'Santiago de Chuco';
}

export function getLocationOptionsByProvince(locationNames, province) {
  const availableNames = locationNames?.length ? locationNames : DEFAULT_LOCATION_NAMES;
  const availableByNormalizedName = new Map(
    availableNames.map((name) => [normalizeLocation(name), name]),
  );
  const catalog = LOCATION_CATALOG[province] || [];
  const options = catalog.flatMap((entry) => {
    const value = entry.aliases
      .map((alias) => availableByNormalizedName.get(normalizeLocation(alias)))
      .find(Boolean);
    return value ? [{ label: entry.label, value }] : [];
  });

  if (province === 'Santiago de Chuco') {
    const knownNames = new Set(
      LOCATION_PROVINCES.flatMap((provinceName) =>
        LOCATION_CATALOG[provinceName].flatMap((entry) =>
          entry.aliases.map(normalizeLocation),
        ),
      ),
    );
    availableNames.forEach((name) => {
      if (!knownNames.has(normalizeLocation(name))) {
        options.push({ label: name, value: name });
      }
    });
  }

  return options;
}
