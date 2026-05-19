import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getRoleHomePath } from '../auth/accessControl.js';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/icons/logo.svg';
import lockIcon from '../assets/icons/bloquear.svg';
import userIcon from '../assets/icons/cuenta.svg';
import { getApiErrorMessage } from '../services/apiClient.js';

const truckImage = '/images/hero-camion.png';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(user)} replace />;
  }

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Ingresa usuario y contrasena.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const session = await login(form);
      const fallbackPath = getRoleHomePath(session.user);
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath?.startsWith('/admin') ? requestedPath : fallbackPath, { replace: true });
    } catch (authError) {
      setError(getApiErrorMessage(authError, 'Usuario o contrasena incorrectos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5] text-[#1F2937]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="relative hidden overflow-hidden bg-[#1F2937] lg:block">
          <img src={truckImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F2937]/95 via-[#1F2937]/75 to-[#1F2937]/25" />
          <div className="relative z-10 flex h-full max-w-3xl flex-col justify-between p-12 text-white">
            <Link to="/" className="inline-flex w-fit items-center gap-3">
              <img src={logo} alt="Carmencita Express" className="h-16 w-auto brightness-0 invert" />
            </Link>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E5E84C]">Sistema interno</p>
              <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight">
                Acceso operativo para el equipo de Carmencita Express.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-[#E3EAE1]">
                Cada usuario ingresa a los modulos habilitados segun sus roles y permisos.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <Link to="/" className="inline-flex items-center">
                <img src={logo} alt="Carmencita Express" className="h-14 w-auto" />
              </Link>
              <Link to="/" className="text-sm font-black text-[#31934F] hover:text-[#3F6845]">
                Inicio
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-[0_18px_46px_rgba(31,41,55,0.12)] sm:p-8">
              <div>
                <p className="text-sm font-black uppercase text-[#31934F]">Inicio de sesion</p>
                <h2 className="mt-2 text-3xl font-black text-[#1F2937]">Carmencita Smart System</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Ingresa con tu usuario interno. El sistema abrira los modulos que correspondan a tu rol.
                </p>
              </div>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-black text-gray-700">Usuario o correo</span>
                  <span className="mt-2 flex min-h-12 items-center rounded-md border border-gray-200 bg-white px-3 focus-within:border-[#31934F] focus-within:ring-2 focus-within:ring-green-100">
                    <img src={userIcon} alt="" className="h-5 w-5 opacity-70" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm font-semibold text-gray-900 outline-none"
                      name="username"
                      value={form.username}
                      onChange={updateField}
                      autoComplete="username"
                      placeholder="admin"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-gray-700">Contrasena</span>
                  <span className="mt-2 flex min-h-12 items-center rounded-md border border-gray-200 bg-white px-3 focus-within:border-[#31934F] focus-within:ring-2 focus-within:ring-green-100">
                    <img src={lockIcon} alt="" className="h-5 w-5 opacity-70" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm font-semibold text-gray-900 outline-none"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={updateField}
                      autoComplete="current-password"
                      placeholder="Ingresa tu contrasena"
                    />
                  </span>
                </label>

                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="min-h-12 w-full rounded-md bg-[#31934F] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#3F6845] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Validando acceso...' : 'Ingresar'}
                </button>
              </form>

              <div className="mt-6 rounded-md bg-[#E3EAE1] p-3 text-sm font-semibold text-[#3F6845]">
                Roles base: Administrador, Secretaria y Estiba.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
