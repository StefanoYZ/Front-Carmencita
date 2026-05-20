function compactName(parts) {
  return parts.filter(Boolean).map((part) => String(part).trim()).filter(Boolean).join(' ');
}

function findDirectName(data) {
  return (
    data?.nombre_completo ||
    data?.full_name ||
    data?.razon_social ||
    data?.nombre ||
    data?.nombres
  );
}

function findSplitName(data) {
  return compactName([
    data?.nombres,
    data?.apellido_paterno,
    data?.apellido_materno,
    data?.apellidoPaterno,
    data?.apellidoMaterno,
    data?.primer_apellido,
    data?.segundo_apellido,
  ]);
}

export function extractNombreFromReniecResponse(data) {
  const sources = [data, data?.data, data?.result, data?.persona];

  for (const source of sources) {
    const splitName = findSplitName(source);
    if (splitName) return splitName;

    const directName = findDirectName(source);
    if (directName) return String(directName).trim();
  }

  return '';
}
