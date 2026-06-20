import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getRoleHomePath } from '../auth/accessControl.js';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/external/logo.png';
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
  const sessionMessage = location.state?.sessionMessage;

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
    <main className="min-h-screen bg-brand-surface text-brand-black">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_480px]">
        <section
          className="relative hidden overflow-hidden bg-brand-black bg-cover bg-[center_right_34%] lg:block"
          style={{
            backgroundImage:
              `linear-gradient(90deg, rgba(33,37,41,0.82) 0%, rgba(33,37,41,0.72) 38%, rgba(33,37,41,0.42) 72%, rgba(33,37,41,0.16) 100%), linear-gradient(180deg, rgba(33,37,41,0.03) 0%, rgba(33,37,41,0.16) 72%, rgba(33,37,41,0.34) 100%), url('${truckImage}')`,
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#212529]/35 to-transparent" />
          <div className="relative z-10 flex h-full max-w-3xl flex-col justify-between p-12 text-white">
            <Link to="/" className="inline-flex w-fit items-center gap-3">
              <img
                src={logo}
                alt="Carmencita Express"
                className="h-16 w-auto brightness-0 invert drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
              />
            </Link>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-lime">Sistema interno</p>
              <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight">
                Acceso operativo para el equipo de Carmencita Express.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-brand-surface">
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
              <Link to="/" className="text-sm font-black text-brand-green hover:text-brand-dark">
                Inicio
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-[0_18px_46px_rgba(31,41,55,0.12)] sm:p-8">
              <div>
                <p className="text-sm font-black uppercase text-brand-green">Inicio de sesion</p>
                <h2 className="mt-2 text-3xl font-black text-brand-black">Carmencita Smart System</h2>
                <p className="mt-3 text-sm leading-6 text-brand-gray">
                  Ingresa con tu usuario interno. El sistema abrira los modulos que correspondan a tu rol.
                </p>
              </div>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                {sessionMessage && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                    {sessionMessage}
                  </div>
                )}
                <label className="block">
                  <span className="text-sm font-black text-brand-black">Usuario</span>
                  <span className="mt-2 flex min-h-12 items-center rounded-md border border-gray-200 bg-white px-3 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-lime/50">
                    <img src={userIcon} alt="" className="h-5 w-5 opacity-70" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm font-semibold text-brand-black outline-none"
                      name="username"
                      value={form.username}
                      onChange={updateField}
                      autoComplete="username"
                      placeholder="admin"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-black text-brand-black">Contrasena</span>
                  <span className="mt-2 flex min-h-12 items-center rounded-md border border-gray-200 bg-white px-3 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-lime/50">
                    <img src={lockIcon} alt="" className="h-5 w-5 opacity-70" />
                    <input
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm font-semibold text-brand-black outline-none"
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
                  <div className="rounded-md border border-brand-dark/40 bg-white p-3 text-sm font-semibold text-brand-black">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="min-h-12 w-full rounded-md bg-brand-green px-5 text-sm font-black text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Validando acceso...' : 'Ingresar'}
                </button>
              </form>

              <div className="mt-6 rounded-md bg-brand-lime/25 p-3 text-sm font-semibold text-brand-dark">
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
