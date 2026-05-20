const dayLetters = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
  7: 'D',
};

export function formatShipmentCode(code) {
  const value = String(code || '');
  if (/^[1-7]\d{9}$/.test(value)) {
    return `${dayLetters[value[0]]}${value.slice(1)}`;
  }
  return value;
}

export function parseShipmentCode(code) {
  return String(code || '').trim().toUpperCase().replace(/\s+/g, '');
}
