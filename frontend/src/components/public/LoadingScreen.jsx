import React from 'react';
import { PackageCheck, Truck } from 'lucide-react';
import logo from '../../assets/external/logo.png';

function LoadingScreen({ leaving = false }) {
  return (
    <div
      className={`public-loader ${leaving ? 'public-loader--leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando Carmencita Express"
    >
      <div className="public-loader__content">
        <img src={logo} alt="Carmencita Express Cargo" className="public-loader__logo" />
        <div className="public-loader__route" aria-hidden="true">
          <span className="public-loader__line" />
          <Truck className="public-loader__truck" size={34} strokeWidth={2.2} />
          <PackageCheck className="public-loader__package" size={25} strokeWidth={2.2} />
        </div>
        <p className="public-loader__text">Preparando tu ruta</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
