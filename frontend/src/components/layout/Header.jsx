import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const roles = user?.roles?.join(', ') || 'Sin rol';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-green">Carmencita Express Cargo</p>
          <h1 className="text-lg font-semibold text-brand-black">Carmencita Smart System</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {user && (
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-brand-black">{user.full_name || user.username}</p>
              <p className="text-xs font-medium text-gray-500">{roles}</p>
            </div>
          )}
          <button
            type="button"
            className="min-h-10 rounded-md border border-gray-200 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            onClick={handleLogout}
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
