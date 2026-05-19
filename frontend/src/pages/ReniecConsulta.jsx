import React, { useState } from 'react';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import { reniecService } from '../services/reniec.service.js';

function ReniecConsulta() {
  const [dni, setDni] = useState('');
  const [ciudadano, setCiudadano] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setCiudadano(null);

    if (dni.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }

    const data = await reniecService.consultarDni(dni);

    if (data.error) {
      setError(data.error);
      return;
    }

    setCiudadano(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-title">RENIEC</h2>
        <p className="page-subtitle">Consulta real de ciudadano por DNI.</p>
      </div>

      <Card>
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
          <div className="flex-1">
            <Input
              label="DNI"
              value={dni}
              onChange={(event) => setDni(event.target.value)}
              maxLength="8"
              placeholder="Ingrese DNI"
              required
            />
          </div>

          <Button type="submit">Consultar</Button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </Card>

      {ciudadano && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-brand-black">
              {ciudadano.nombres} {ciudadano.apellido_paterno} {ciudadano.apellido_materno}
            </h3>

            <Badge tone="green">Encontrado</Badge>
          </div>

          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-gray-500">DNI</dt>
              <dd className="font-medium text-brand-black">{ciudadano.dni}</dd>
            </div>

            <div>
              <dt className="text-gray-500">Nombres</dt>
              <dd className="font-medium text-brand-black">{ciudadano.nombres}</dd>
            </div>

            <div>
              <dt className="text-gray-500">Apellido paterno</dt>
              <dd className="font-medium text-brand-black">{ciudadano.apellido_paterno}</dd>
            </div>

            <div>
              <dt className="text-gray-500">Apellido materno</dt>
              <dd className="font-medium text-brand-black">{ciudadano.apellido_materno}</dd>
            </div>

            <div>
              <dt className="text-gray-500">Origen</dt>
              <dd className="font-medium text-brand-black">ApiPeru / FastAPI</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

export default ReniecConsulta;