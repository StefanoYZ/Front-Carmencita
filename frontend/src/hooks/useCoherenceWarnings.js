import { useEffect, useRef, useState } from 'react';
import { validarCoherenciaPaquete } from '../services/assistantService.js';
import { COHERENCE_UPDATE_EVENT } from '../components/asistente/FieldAlertBell.jsx';

function emitirActualizacion(mapa) {
  // Lista ordenada de mensajes para que el chat la muestre/actualice en vivo.
  const warnings = Object.values(mapa);
  window.dispatchEvent(new CustomEvent(COHERENCE_UPDATE_EVENT, { detail: { warnings } }));
}

/**
 * Valida (con debounce) la coherencia de los datos del paquete en el backend y
 * devuelve un mapa { nombreCampo: mensaje } para ubicar la campanita junto al
 * dato sospechoso. La API key del LLM nunca llega al navegador: todo se evalúa
 * en el backend.
 */
export default function useCoherenceWarnings({
  tipoContenido,
  descripcion,
  pesoKg,
  largoCm,
  anchoCm,
  altoCm,
  fragilidad,
  orientacionBase,
}) {
  const [warningsByField, setWarningsByField] = useState({});
  const lastKeyRef = useRef('');

  useEffect(() => {
    const desc = String(descripcion || '').trim();
    const hayNumeros = [pesoKg, largoCm, anchoCm, altoCm].some(
      (v) => String(v ?? '').trim() !== '',
    );
    if (!desc && !hayNumeros) {
      setWarningsByField({});
      lastKeyRef.current = '';
      emitirActualizacion({});
      return undefined;
    }

    const key = JSON.stringify({
      tipoContenido, desc, pesoKg, largoCm, anchoCm, altoCm, fragilidad, orientacionBase,
    });
    if (key === lastKeyRef.current) return undefined;

    const timer = setTimeout(async () => {
      try {
        const data = await validarCoherenciaPaquete({
          tipo_contenido: tipoContenido || null,
          descripcion: desc || null,
          peso_kg: pesoKg || null,
          largo_cm: largoCm || null,
          ancho_cm: anchoCm || null,
          alto_cm: altoCm || null,
          fragilidad: fragilidad || null,
          orientacion_base: orientacionBase || null,
        });
        lastKeyRef.current = key;
        const mapa = {};
        for (const adv of data?.advertencias || []) {
          if (adv?.campo && !mapa[adv.campo]) mapa[adv.campo] = adv.mensaje;
        }
        setWarningsByField(mapa);
        emitirActualizacion(mapa);
      } catch {
        // La validación es una ayuda, no debe bloquear ni romper el formulario.
        setWarningsByField({});
        emitirActualizacion({});
      }
    }, 1500);  // Espera a que el cliente termine de escribir (pausa de ~1.5s).

    return () => clearTimeout(timer);
  }, [tipoContenido, descripcion, pesoKg, largoCm, anchoCm, altoCm, fragilidad, orientacionBase]);

  return warningsByField;
}
