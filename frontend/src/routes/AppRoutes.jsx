import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import Clientes from '../pages/Clientes.jsx';
import Cotizacion from '../pages/Cotizacion.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Encomiendas from '../pages/Encomiendas.jsx';
import NotFound from '../pages/NotFound.jsx';
import OptimizacionCarga from '../pages/OptimizacionCarga.jsx';
import ReniecConsulta from '../pages/ReniecConsulta.jsx';
import SunatBoletas from '../pages/SunatBoletas.jsx';
import Tracking from '../pages/Tracking.jsx';

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/encomiendas" element={<Encomiendas />} />
        <Route path="/cotizacion" element={<Cotizacion />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/sunat-boletas" element={<SunatBoletas />} />
        <Route path="/reniec" element={<ReniecConsulta />} />
        <Route path="/optimizacion-carga" element={<OptimizacionCarga />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default AppRoutes;
