import {
  Building2,
  ChevronLeft,
  ClipboardList,
  Code2,
  LayoutDashboard,
  MapPin,
  Package,
  UserCog,
  UsersRound,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { getAgencyNavigation, getAllowedNavigation, hasRole } from '../../auth/accessControl.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { userRoleLabels } from '../../utils/roleLabels.js';
import logo from '../../assets/external/logo.png';
import { useRef } from 'react';

const navIcons = {
  Dashboard: LayoutDashboard,
  Agencias: Building2,
  'Mi agencia': Building2,
  Clientes: UsersRound,
  Reclamos: ClipboardList,
  Encomiendas: Package,
  Lugares: MapPin,
  'Usuarios internos': UserCog,
  'Vista Developer': Code2,
};

function NavigationIcon({ label }) {
  const Icon = navIcons[label] || LayoutDashboard;
  return <Icon size={18} strokeWidth={2.25} className="text-current" aria-hidden="true" />;
}

function getInitials(user) {
  const name = user?.full_name || user?.username || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function hasDesktopViewport() {
  return window.matchMedia?.('(min-width: 1024px)').matches ?? window.innerWidth >= 1024;
}

function Sidebar({ collapsed, mobileOpen, onExpand, onCollapse, onCloseMobile }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const sidebarRef = useRef(null);
  const keyboardNavigation = useRef(false);
  const agencyId = pathname.match(/^\/admin\/agencias\/(\d+)(?:\/|$)/)?.[1];
  const inAgency = Boolean(agencyId);
  const links = inAgency ? getAgencyNavigation(user, agencyId) : getAllowedNavigation(user);

  return (
    <aside
      ref={sidebarRef}
      id="main-navigation-sidebar"
      data-sidebar="true"
      onMouseEnter={() => { if (hasDesktopViewport()) onExpand(); }}
      onMouseDownCapture={() => { keyboardNavigation.current = false; }}
      onKeyDownCapture={(event) => { if (event.key === 'Tab') keyboardNavigation.current = true; }}
      onMouseLeave={() => { if (hasDesktopViewport() && !keyboardNavigation.current) onCollapse(); }}
      onFocusCapture={onExpand}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onCollapse(); }}
      className={`fixed inset-y-0 left-0 z-20 overflow-hidden bg-gradient-to-b from-[#1f4d2f] via-brand-dark to-[#16331f] py-5 shadow-[10px_0_40px_rgba(33,37,41,0.22)] transition-[width,padding,transform] duration-200 ${mobileOpen ? 'flex w-72 translate-x-0 px-4' : 'hidden -translate-x-full'} lg:flex lg:translate-x-0 lg:flex-col ${collapsed ? 'lg:w-20 lg:px-2' : 'lg:w-72 lg:px-4'}`}
    >
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-green/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-lime/10 blur-3xl" />

      <div className="relative flex items-center justify-between px-1 py-1">
        {collapsed && !mobileOpen ? <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-lg font-black text-white" aria-label="Carmencita Express">CE</span> : <img
          src={logo}
          alt="Carmencita Smart System"
          className="h-20 w-full object-contain brightness-0 invert drop-shadow-[0_8px_18px_rgba(0,0,0,0.25)]"
        />}
      </div>

      <p className={`relative mt-5 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-brand-lime/90 ${collapsed && !mobileOpen ? 'sr-only' : ''}`}>
        Gestion interna
      </p>

      <nav className="relative mt-3 space-y-1" aria-label={inAgency ? 'Navegación de agencia' : 'Navegación principal'}>
        {inAgency && hasRole(user, ['ADMIN_GENERAL']) && (
          <NavLink to="/admin/agencias" onClick={onCloseMobile} title="Volver a administración general" className={`mb-3 flex min-h-11 items-center gap-2 rounded-xl bg-brand-lime/20 px-3 text-sm font-bold text-white hover:bg-brand-lime/30 ${collapsed && !mobileOpen ? 'justify-center' : ''}`}>
            <ChevronLeft size={20} aria-hidden="true" />{(!collapsed || mobileOpen) && 'Administración general'}
          </NavLink>
        )}
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onCloseMobile}
            end={inAgency && link.label === 'Dashboard'}
            title={link.label}
            className={({ isActive }) =>
              `group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${collapsed && !mobileOpen ? 'justify-center' : ''} ${
                isActive
                  ? 'active bg-white text-brand-black shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {/* Indicador activo */}
            <span className="absolute left-0 top-1/2 hidden h-6 w-1 -translate-x-1 -translate-y-1/2 rounded-full bg-brand-green group-[.active]:block" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition group-[.active]:bg-brand-lime/40" aria-hidden="true">
              <NavigationIcon label={link.label} />
            </span>
            {(!collapsed || mobileOpen) && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className={`relative mt-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-sm backdrop-blur ${collapsed && !mobileOpen ? 'justify-center' : ''}`} title={`${user.full_name || user.username} · ${userRoleLabels(user)}`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-lime/30 text-sm font-black text-white ring-1 ring-white/20">
            {getInitials(user)}
          </span>
          {(!collapsed || mobileOpen) && <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user.full_name || user.username}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-brand-lime/90">
              {userRoleLabels(user)}
            </p>
          </div>}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
