import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

function NotFound() {
  return (
    <Card className="max-w-xl">
      <p className="text-sm font-medium text-brand-green">404</p>
      <h2 className="mt-2 text-2xl font-semibold text-brand-black">Pagina no encontrada</h2>
      <p className="mt-2 text-sm text-gray-600">La ruta solicitada no existe en la maqueta actual.</p>
      <Link to="/" className="mt-5 inline-flex">
        <Button>Volver al dashboard</Button>
      </Link>
    </Card>
  );
}

export default NotFound;
