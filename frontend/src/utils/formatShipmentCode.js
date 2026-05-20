const dayLetters = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
  7: 'D',
};

const dayNumbers = Object.fromEntries(
  Object.entries(dayLetters).map(([number, letter]) => [letter, number]),
);

export function formatShipmentCode(code) {
  const value = String(code || '');
  if (/^[1-7]\d{9}$/.test(value)) {
    return `${dayLetters[value[0]]}${value.slice(1)}`;
  }
  return value;
}

export function parseShipmentCode(code) {
  const value = String(code || '').trim().toUpperCase();
  if (/^[LMXJVSD]\d{9}$/.test(value)) {
    return `${dayNumbers[value[0]]}${value.slice(1)}`;
  }
  return value;
}
