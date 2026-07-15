import React from 'react';
import { RegistroPresencial } from './SecretariaDashboard.jsx';

// El registro de encomiendas del admin usa el MISMO flujo de registro + pago que
// la secretaria (formulario -> metodo de pago -> comprobante), en lugar de crear
// la encomienda directamente. Se reutiliza el componente RegistroPresencial.
function EncomiendaNueva() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Nueva encomienda</h2>
        <p className="page-subtitle">Registra la encomienda y procesa el pago. El codigo se genera automaticamente.</p>
      </div>
      <RegistroPresencial />
    </div>
  );
}

export default EncomiendaNueva;
