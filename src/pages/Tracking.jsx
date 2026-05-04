import React from 'react';  
import { useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';

function Tracking() {
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setEstado({
      codigo: codigo || 'ENC-001',
      ubicacion: 'Centro de distribucion Lima',
      estado: 'En transito',
      avance: 'Despacho confirmado hacia destino',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">Tracking</h2>
        <p className="page-subtitle">Consulta simulada del estado de una encomienda.</p>
      </div>

      <Card>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          <div className="flex-1">
            <Input label="Codigo de encomienda" value={codigo} onChange={(event) => setCodigo(event.target.value)} placeholder="ENC-001" />
          </div>
          <Button type="submit">Consultar</Button>
        </form>
      </Card>

      {estado && (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">{estado.codigo}</p>
              <h3 className="text-xl font-semibold text-brand-black">{estado.ubicacion}</h3>
            </div>
            <Badge tone="amber">{estado.estado}</Badge>
          </div>
          <p className="mt-4 text-sm text-gray-600">{estado.avance}</p>
        </Card>
      )}
    </div>
  );
}

export default Tracking;
