import React from 'react';
import { useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import { reniecService } from '../services/reniec.service.js';

function ReniecConsulta() {
  const [dni, setDni] = useState('');
  const [ciudadano, setCiudadano] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCiudadano(await reniecService.consultarDni(dni));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">RENIEC</h2>
        <p className="page-subtitle">Consulta simulada de ciudadano por DNI.</p>
      </div>

      <Card>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          <div className="flex-1">
            <Input label="DNI" value={dni} onChange={(event) => setDni(event.target.value)} maxLength="8" placeholder="74185296" required />
          </div>
          <Button type="submit">Consultar</Button>
        </form>
      </Card>

      {ciudadano && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-brand-black">
              {ciudadano.nombres} {ciudadano.apellidos}
            </h3>
            <Badge tone="green">{ciudadano.estado}</Badge>
          </div>
          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-gray-500">DNI</dt>
              <dd className="font-medium text-brand-black">{ciudadano.dni}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Ubigeo</dt>
              <dd className="font-medium text-brand-black">{ciudadano.ubigeo}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Origen</dt>
              <dd className="font-medium text-brand-black">Datos simulados</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

export default ReniecConsulta;
