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

// Letras validas de codigo (una por dia de la semana, ver SHIPMENT_CODE_WEEKDAY
// en el backend). Un codigo real es una de estas letras seguida de 9 digitos.
export const TRACKING_DAY_LETTERS = 'LMXJVSD';

// Sanea la entrada de rastreo: fuerza mayusculas, exige que el primer caracter
// sea una letra valida y descarta cualquier simbolo/letra extra; luego admite
// solo digitos hasta completar 9 (total: 1 letra + 9 digitos).
export function sanitizeTrackingCode(raw) {
  const upper = String(raw || '').toUpperCase();
  let out = '';
  for (const ch of upper) {
    if (out.length === 0) {
      if (TRACKING_DAY_LETTERS.includes(ch)) out += ch;
    } else if (/\d/.test(ch) && out.length < 10) {
      out += ch;
    }
  }
  return out;
}

export function isCompleteTrackingCode(code) {
  return new RegExp(`^[${TRACKING_DAY_LETTERS}]\\d{9}$`).test(String(code || ''));
}
