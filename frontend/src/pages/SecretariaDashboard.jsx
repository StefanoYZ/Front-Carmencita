import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Calculator, CreditCard, Eye, FileText, LayoutDashboard, ListChecks, Loader2, LogOut, PackageCheck, QrCode, ScanLine, Search, Trash2 } from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataTable from '../components/tables/DataTable.jsx';
import Pagination from '../components/tables/Pagination.jsx';
import EncomiendaDetalleModal from '../components/encomiendas/EncomiendaDetalleModal.jsx';
import PaymentConfirmationStep from '../components/public/PaymentConfirmationStep.jsx';
import ShipmentFormStep from '../components/public/ShipmentFormStep.jsx';
import PackageBaseSelector from '../components/common/PackageBaseSelector.jsx';
import FieldAlertBell from '../components/asistente/FieldAlertBell.jsx';
import useCoherenceWarnings from '../hooks/useCoherenceWarnings.js';
import { useAuth } from '../context/AuthContext.jsx';
import { RegistroExitosoContent } from './public/RegistroExitosoPage.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { getClienteByDni } from '../services/clientes.service.js';
import { calcularCotizacion } from '../services/cotizacionesService.js';
import { getDestinos } from '../services/destinosService.js';
import {
  confirmarPreRegistro,
  createEncomienda,
  eliminarPreRegistroVencido,
  entregarEncomienda,
  getEncomiendas,
  updateEncomienda,
} from '../services/encomiendasService.js';
import { iniciarEntregaServicio } from '../services/measurementLogsService.js';
import {
  descargarPdfMock,
  emitirBoletaDesdeEncomienda,
  generarPdfBetaDesdeEncomienda,
} from '../services/sunatService.js';
import { consultarDni } from '../services/reniecService.js';
import { extractNombreFromReniecResponse, normalizeLocalClient } from '../utils/reniec.js';
import { sanitizeShipmentField, validatePackageBaseOrientation } from '../utils/shipmentValidation.js';
import { DEFAULT_LOCATION_NAMES } from '../utils/locationHierarchy.js';
import {
  buildPublicShipmentPayload,
  emptyPublicShipmentForm,
  quoteEstimateFromForm,
  validatePublicShipmentForm,
} from '../utils/publicShipment.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';
import { formatDateTime } from '../utils/formatDate.js';
import { sortEncomiendasByRecent } from '../utils/encomiendas.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const tabs = [
  { id: 'registro', label: 'Registro presencial', icon: Calculator },
  { id: 'cobro', label: 'Cobro en agencia', icon: CreditCard },
  { id: 'entrega', label: 'Entrega', icon: PackageCheck },
  { id: 'lista', label: 'Encomiendas registradas', icon: ListChecks },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'DOCUMENTOS', label: 'Documentos / sobres' },
  { value: 'ROPA', label: 'Ropa' },
  { value: 'ELECTRONICOS', label: 'Electronicos' },
  { value: 'ELECTRODOMESTICOS', label: 'Electrodomesticos' },
  { value: 'ALIMENTOS', label: 'Alimentos' },
  { value: 'OTROS', label: 'Otros' },
];


function getInitials(user) {
  const name = user?.full_name || user?.username || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function SecretariaDashboard() {
  const [activeTab, setActiveTab] = useState('registro');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_120%_at_0%_0%,#FFFFFF_0%,#F8F9FA_45%,#EFF3ED_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1f4d2f] via-brand-dark to-[#16331f] p-6 text-white shadow-[0_20px_50px_-20px_rgba(33,37,41,0.5)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-green/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-1/3 h-44 w-44 rounded-full bg-brand-lime/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <LayoutDashboard size={24} className="text-brand-lime" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-lime">Carmencita Express Cargo</p>
                <h1 className="mt-1 text-2xl font-black">Panel de secretaria</h1>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-lime/30 text-xs font-black text-white ring-1 ring-white/20">
                    {getInitials(user)}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-black leading-tight">{user.full_name || user.username}</p>
                    <p className="text-xs font-semibold leading-tight text-brand-lime/90">SECRETARIA</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Cerrar sesión"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/70 backdrop-blur transition hover:bg-red-500/80 hover:text-white hover:border-red-400/50"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </header>

        <nav
          className="flex flex-wrap gap-1.5 rounded-2xl border border-gray-200/70 bg-white p-1.5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_12px_28px_-18px_rgba(33,37,41,0.22)]"
          role="tablist"
          aria-label="Secciones del panel de secretaria"
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={selected}
                aria-controls="panel-secretaria"
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition duration-150 ${
                  selected
                    ? 'bg-gradient-to-b from-brand-green to-[#1f8f3a] text-white shadow-[0_8px_18px_-6px_rgba(40,167,69,0.5)]'
                    : 'text-brand-gray hover:bg-brand-surface hover:text-brand-dark'
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <main id="panel-secretaria" role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={-1}>
          {activeTab === 'registro' && <RegistroPresencial />}
          {activeTab === 'cobro' && <CobroAgencia />}
          {activeTab === 'entrega' && <EntregaEncomienda />}
          {activeTab === 'lista' && <ListaEncomiendasRegistradas />}
        </main>
      </div>
    </div>
  );
}

function RegistroPresencial() {
  const { user } = useAuth();
  const [flowStep, setFlowStep] = useState('form');
  const [form, setForm] = useState({ ...emptyPublicShipmentForm, origen: 'Trujillo' });
  const [errors, setErrors] = useState({});
  const [reniecStatus, setReniecStatus] = useState({ remitente: null, destinatario: null });
  const [locationOptions, setLocationOptions] = useState([]);
  const [created, setCreated] = useState(null);
  const [successPayment, setSuccessPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    loadDestinations(setLocationOptions);
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: sanitizeShipmentField(name, value, current) };
      if (name === 'tipo_contenido' && value === 'DOCUMENTOS') {
        next.largo_cm = '';
        next.ancho_cm = '';
        next.alto_cm = '';
        next.fragilidad = 'BAJA';
        next.orientacion_base = '';
      }
      return next;
    });
    setErrors((current) => {
      if (!current[name] && !current.general) return current;
      const next = { ...current };
      delete next[name];
      delete next.general;
      return next;
    });
    setApiError('');
    setPaymentNotice('');
  };

  const handleContinue = async (event) => {
    event.preventDefault();
    const validationErrors = validatePublicShipmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors, general: 'Revisa los campos marcados antes de continuar.' });
      return;
    }

    try {
      setLoading(true);
      setApiError('');
      const payload = buildPublicShipmentPayload(form);
      const shipment = await createEncomienda(payload);
      await calcularCotizacion({ encomienda_id: shipment.id });
      setCreated(shipment);
      setFlowStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'No se pudo crear el registro formal.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalApproved = (method, paymentResult) => {
    setSuccessPayment({ method, status: 'approved', response: paymentResult });
    setFlowStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (flowStep === 'success' && created) {
    return (
      <RegistroExitosoContent
        result={created}
        summary={form}
        payment={successPayment}
        homeLabel="Volver"
        onHome={() => {
          setFlowStep('form');
          setCreated(null);
          setSuccessPayment(null);
          setForm({ ...emptyPublicShipmentForm, origen: 'Trujillo' });
          setErrors({});
          setApiError('');
        }}
      />
    );
  }

  if (flowStep === 'payment' && created) {
    return (
      <PaymentConfirmationStep
        form={form}
        loading={loading}
        error={apiError}
        paymentMethod={paymentMethod}
        paymentNotice={paymentNotice}
        allowedPaymentMethods={['yape', 'card']}
        encomiendaId={created.id}
        usuario={user?.username || ''}
        onBack={() => setFlowStep('form')}
        onEdit={() => setFlowStep('form')}
        onSelectPayment={(value) => {
          setPaymentMethod(value);
          setPaymentNotice('');
          setApiError('');
        }}
        onDigitalApproved={handleDigitalApproved}
        onDigitalPending={(method) => setPaymentNotice(`Pago con ${method === 'yape' ? 'Yape' : 'tarjeta'} pendiente.`)}
        onDigitalError={(method, error) => setApiError(error?.message || `No se pudo procesar el pago con ${method === 'yape' ? 'Yape' : 'tarjeta'}.`)}
      />
    );
  }

  return (
    <section className="space-y-5">
      {apiError && <Alert tone="error">{apiError}</Alert>}
      <ShipmentFormStep
        form={form}
        errors={errors}
        reniecStatus={reniecStatus}
        locationOptions={locationOptions}
        alertMode="popover"
        onChange={updateField}
        onReniecLookup={(role) => handleReniecLookup(role, form, setForm, setErrors, setReniecStatus)}
        onSubmit={handleContinue}
        onCancel={() => {
          setForm({ ...emptyPublicShipmentForm, origen: 'Trujillo' });
          setErrors({});
          setApiError('');
        }}
      />
      {loading && <div className="rounded-md border border-[#A3CF84] bg-[#E4ECE2] p-3 text-sm font-bold text-[#3C5940]">Registrando...</div>}
    </section>
  );
}

const PRE_REGISTRO_EXPIRY_DAYS = 3;

function esPreRegistroVencido(row) {
  if (!row?.fecha_creacion) return false;
  const created = new Date(row.fecha_creacion);
  const diffMs = Date.now() - created.getTime();
  return diffMs > PRE_REGISTRO_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

function CobroAgencia() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [successPayment, setSuccessPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    try {
      setLoading('lista');
      setError('');
      const data = await getEncomiendas();
      setRows(data.filter((item) => item.estado === 'PRE_REGISTRADA'));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudieron listar pre-registros.'));
    } finally {
      setLoading('');
    }
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => [
      row.codigo_encomienda,
      row.remitente_numero_documento,
      row.remitente_nombre,
      row.destinatario_numero_documento,
      row.destinatario_nombre,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
  }, [rows, search]);

  const handleSelect = async (row) => {
    setSelected(row);
    setSelectedForm(mapShipmentToPublicForm(row));
    setSuccessPayment(null);
    setPaymentMethod('qr');
    setPaymentNotice('');
    setError('');
    try {
      await calcularCotizacion({ encomienda_id: row.id });
    } catch {
      // El panel de pago conserva el calculo del flujo publico si el backend no responde.
    }
  };

  const handleSimulatedPaymentApproved = async (method) => {
    if (!selected) return;

    const formForConfirmation = selectedForm || mapShipmentToPublicForm(selected);
    const contentType = String(formForConfirmation.tipo_contenido || '').trim().toUpperCase();
    if (!contentType) {
      setError('Selecciona el tipo de contenido antes de confirmar el cobro.');
      return;
    }
    if (!String(formForConfirmation.descripcion || '').trim()) {
      setError('Ingresa la descripción del contenido antes de confirmar el cobro.');
      return;
    }
    const isEnvelope = contentType === 'DOCUMENTOS';
    if (!isEnvelope && !formForConfirmation.orientacion_base) {
      setError('Falta seleccionar la cara/base del paquete antes de confirmar el pre-registro.');
      return;
    }

    const orientationError = isEnvelope ? '' : validatePackageBaseOrientation({
      contentType: formForConfirmation.tipo_contenido,
      description: formForConfirmation.descripcion,
      fragility: formForConfirmation.fragilidad,
      baseOrientation: formForConfirmation.orientacion_base,
      lengthCm: formForConfirmation.largo_cm,
      widthCm: formForConfirmation.ancho_cm,
      heightCm: formForConfirmation.alto_cm,
    });
    if (orientationError) {
      setError(orientationError);
      return;
    }

    try {
      setLoading('confirmar');
      setError('');
      setPaymentNotice('');
      const selectedContentType = String(selected.tipo_contenido || '').trim().toUpperCase();
      const descriptionChanged =
        String(formForConfirmation.descripcion || '').trim() !== String(selected.descripcion || '').trim();
      const shouldUpdateShipment =
        contentType !== selectedContentType
        || descriptionChanged
        || (!isEnvelope && formForConfirmation.orientacion_base !== selected.orientacion_base);
      if (shouldUpdateShipment) {
        await updateEncomienda(selected.id, buildPublicShipmentPayload(formForConfirmation));
      }
      const confirmed = await confirmarPreRegistro(selected.id);
      const summary = mapShipmentToPublicForm(confirmed);
      setSelected(confirmed);
      setRows((current) => current.filter((item) => item.id !== selected.id));
      setSuccessPayment({
        method,
        status: 'approved',
        response: { simulated: true, channel: method === 'qr' ? 'QR Yape/Plin' : 'POS tarjeta' },
        result: confirmed,
        summary,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'El cobro fue simulado, pero no se pudo confirmar el registro.'));
    } finally {
      setLoading('');
    }
  };

  const handleEliminarVencido = async (id) => {
    try {
      setLoading('eliminar');
      setError('');
      await eliminarPreRegistroVencido(id);
      setRows((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'No se pudo eliminar el pre-registro.'));
    } finally {
      setLoading('');
      setConfirmDeleteId(null);
    }
  };

  if (successPayment?.result) {
    return (
      <RegistroExitosoContent
        result={successPayment.result}
        summary={successPayment.summary}
        payment={successPayment}
        homeLabel="Volver"
        onHome={() => {
          setSuccessPayment(null);
          setSelected(null);
          setSelectedForm(null);
          loadPending();
        }}
      />
    );
  }

  if (selectedForm) {
    return (
      <section className="space-y-5">
        <div className="rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-[#28A745]">Pre-registro seleccionado</p>
              <h2 className="mt-1 break-words text-2xl font-black text-[#212529]">{formatShipmentCode(selected?.codigo_encomienda)}</h2>
              <p className="mt-1 text-sm font-semibold text-[#6C757D]">
                {selected?.remitente_nombre || '-'} / {selected?.destinatario_nombre || '-'}
              </p>
              <p className="mt-1 text-sm font-black text-[#3C5940]">
                {selected?.origen || '-'} - {selected?.destino || '-'}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSelected(null);
                setSelectedForm(null);
                setError('');
                setPaymentNotice('');
              }}
            >
              Volver
            </Button>
          </div>
        </div>
        <AgencyCollectionStep
          form={selectedForm}
          loading={loading === 'confirmar'}
          error={error}
          paymentNotice={paymentNotice}
          paymentMethod={paymentMethod}
          onSelectPayment={(value) => {
            setPaymentMethod(value);
            setPaymentNotice('');
            setError('');
          }}
          onBaseChange={(orientation) => {
            setSelectedForm((current) => ({ ...current, orientacion_base: orientation }));
            setError('');
          }}
          onFieldChange={(name, value) => {
            setSelectedForm((current) => {
              const next = { ...current, [name]: sanitizeShipmentField(name, value, current) };
              if (name === 'tipo_contenido' && value === 'DOCUMENTOS') {
                next.largo_cm = '';
                next.ancho_cm = '';
                next.alto_cm = '';
                next.fragilidad = 'BAJA';
                next.orientacion_base = '';
              }
              return next;
            });
            setError('');
          }}
          onBack={() => {
            setSelected(null);
            setSelectedForm(null);
          }}
          onConfirm={() => handleSimulatedPaymentApproved(paymentMethod)}
        />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {/* Modal de confirmación de eliminación */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-black text-[#212529]">¿Eliminar pre-registro?</h3>
            <p className="mt-2 text-sm font-semibold text-[#6C757D]">
              Este pre-registro lleva más de {PRE_REGISTRO_EXPIRY_DAYS} días sin confirmarse.
              Al eliminarlo quedará anulado y no podrá recuperarse.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-black text-[#6C757D] transition hover:bg-gray-50"
                onClick={() => setConfirmDeleteId(null)}
                disabled={loading === 'eliminar'}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60"
                onClick={() => handleEliminarVencido(confirmDeleteId)}
                disabled={loading === 'eliminar'}
              >
                {loading === 'eliminar' ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="block lg:flex-1">
            <span className="mb-1.5 block text-sm font-black text-[#3C5940]">Buscar pre-registro</span>
            <input
              className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Codigo, DNI, remitente o destinatario"
            />
          </label>
          <Button type="button" variant="secondary" className="lg:w-44" onClick={loadPending} disabled={loading === 'lista'}>
            {loading === 'lista' ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
        {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => {
            const vencido = esPreRegistroVencido(row);
            return (
              <div
                key={row.id}
                className={`relative min-h-[150px] rounded-lg border p-4 transition ${
                  vencido
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-[#A3CF84]/60 bg-[#F8F9FA] hover:border-[#28A745] hover:bg-[#E4ECE2]'
                }`}
              >
                {vencido && (
                  <span className="mb-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-orange-700 ring-1 ring-orange-300">
                    Vencido (+{PRE_REGISTRO_EXPIRY_DAYS} días)
                  </span>
                )}
                <button
                  type="button"
                  className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#28A745] focus-visible:ring-offset-2"
                  onClick={() => handleSelect(row)}
                >
                  <p className="font-black text-[#212529]">{formatShipmentCode(row.codigo_encomienda)}</p>
                  <p className="mt-1 text-sm font-semibold text-[#6C757D]">{row.remitente_nombre} / {row.destinatario_nombre}</p>
                  <p className="mt-1 text-xs font-black text-[#3C5940]">{row.origen} - {row.destino}</p>
                  {!vencido && (
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#28A745]">Pendiente de pago en agencia</p>
                  )}
                </button>
                {vencido && (
                  <button
                    type="button"
                    title="Eliminar pre-registro vencido"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition hover:bg-red-600 hover:text-white"
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(row.id); }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
          {!filteredRows.length && (
            <p className="rounded-md bg-[#F8F9FA] p-4 text-sm font-semibold text-[#6C757D] md:col-span-2 xl:col-span-3">
              No hay pre-registros pendientes.
            </p>
          )}
        </div>
      </section>

      <section className="flex items-center justify-center rounded-2xl border border-[#A3CF84]/70 bg-white p-8 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)]">
        <div className="text-center">
          <p className="text-base font-black text-[#3C5940]">Selecciona un pre-registro</p>
          <p className="mt-2 text-sm font-semibold text-[#6C757D]">Elige uno de la lista para confirmar el cobro y procesar el pago.</p>
        </div>
      </section>
    </section>
  );
}

function AgencyCollectionStep({
  form,
  loading,
  error,
  paymentNotice,
  paymentMethod,
  onSelectPayment,
  onBaseChange,
  onFieldChange,
  onBack,
  onConfirm,
}) {
  const quote = quoteEstimateFromForm(form);
  const contentType = String(form.tipo_contenido || '').trim().toUpperCase();
  const isEnvelope = contentType === 'DOCUMENTOS';
  const coherenceWarnings = useCoherenceWarnings({
    tipoContenido: form.tipo_contenido,
    descripcion: form.descripcion,
    pesoKg: form.peso_kg,
    largoCm: form.largo_cm,
    anchoCm: form.ancho_cm,
    altoCm: form.alto_cm,
    fragilidad: form.fragilidad,
    orientacionBase: form.orientacion_base,
  });
  const orientationError = isEnvelope ? '' : validatePackageBaseOrientation({
    contentType: form.tipo_contenido,
    description: form.descripcion,
    fragility: form.fragilidad,
    baseOrientation: form.orientacion_base,
    lengthCm: form.largo_cm,
    widthCm: form.ancho_cm,
    heightCm: form.alto_cm,
  });
  const missingContentType = !contentType;
  const missingDescription = !String(form.descripcion || '').trim();
  const missingBase = !isEnvelope && !form.orientacion_base;
  const canConfirm = !loading && !missingContentType && !missingDescription && !missingBase && !orientationError;

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)]">
        <h3 className="text-lg font-black text-[#212529]">Validacion del paquete</h3>
        <div className="mt-4 grid gap-3 rounded-xl bg-[#F8F9FA] p-4 text-sm font-semibold text-[#3C5940] sm:grid-cols-2">
          <div className="relative">
            <DetailLine label="Peso" value={`${form.peso_kg || '-'} kg`} />
            <FieldAlertBell warning={coherenceWarnings.peso_kg} label="Peso" mode="popover" />
          </div>
          <div className="relative">
            <DetailLine
              label="Dimensiones"
              value={isEnvelope ? 'No aplica' : `${form.largo_cm || '-'} x ${form.ancho_cm || '-'} x ${form.alto_cm || '-'} cm`}
            />
            {!isEnvelope && (
              <FieldAlertBell
                warning={coherenceWarnings.largo_cm || coherenceWarnings.ancho_cm || coherenceWarnings.alto_cm}
                label="Dimensiones"
                mode="popover"
              />
            )}
          </div>
        </div>

        <label className="mt-4 grid gap-1.5">
          <span className="text-sm font-black text-[#3C5940]">Tipo de contenido</span>
          <div className="relative">
            <select
              className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
              value={form.tipo_contenido || ''}
              onChange={(event) => onFieldChange('tipo_contenido', event.target.value)}
            >
              <option value="">Seleccionar</option>
              {CONTENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <FieldAlertBell warning={coherenceWarnings.tipo_contenido} label="Tipo de contenido" mode="popover" />
          </div>
        </label>

        <label className="mt-4 grid gap-1.5">
          <span className="text-sm font-black text-[#3C5940]">Descripcion del contenido</span>
          <div className="relative">
            <textarea
              className="min-h-24 w-full resize-y rounded-md border border-[#A3CF84] bg-white px-3 py-2 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
              value={form.descripcion || ''}
              onChange={(event) => onFieldChange('descripcion', event.target.value)}
              placeholder="Describe brevemente el contenido de la encomienda"
            />
            <FieldAlertBell warning={coherenceWarnings.descripcion} label="Descripción" mode="popover" />
          </div>
          {missingDescription && (
            <span className="text-xs font-bold text-red-600">La descripción del contenido es obligatoria.</span>
          )}
        </label>

        {missingContentType && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-black text-amber-800">
            Falta seleccionar el tipo de contenido antes de completar el cobro.
          </div>
        )}

        {!isEnvelope && (
          <>
            {missingBase && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-black text-amber-800">
                Falta seleccionar la cara/base del paquete antes de completar el cobro en agencia.
              </div>
            )}
            <div className="relative">
              <PackageBaseSelector
                length={form.largo_cm}
                width={form.ancho_cm}
                height={form.alto_cm}
                value={form.orientacion_base}
                error={orientationError}
                onChange={onBaseChange}
              />
              <FieldAlertBell warning={coherenceWarnings.orientacion_base} label="Cara del paquete" mode="popover" />
            </div>
          </>
        )}
      </section>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-[#E4ECE2] bg-white p-5 shadow-[0_14px_32px_rgba(33,37,41,0.07)]">
          <h3 className="text-lg font-black text-[#212529]">Cobro en agencia</h3>
          <div className="mt-4 rounded-xl bg-[#3C5940] p-4 text-white">
            <p className="text-sm font-bold text-[#E4ECE2]">Total a pagar</p>
            <p className="mt-1 text-3xl font-black">{formatCurrency(quote.total)}</p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => onSelectPayment('qr')}
              className={`rounded-xl border p-4 text-left transition ${
                paymentMethod === 'qr'
                  ? 'border-[#28A745] bg-[#E4ECE2] ring-2 ring-[#A3CF84]'
                  : 'border-[#E4ECE2] bg-white hover:border-[#A3CF84]'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-black text-[#212529]">
                <QrCode size={18} /> QR Yape / Plin
              </span>
              <span className="mt-1 block text-xs font-semibold text-[#6C757D]">
                Muestra un QR para que el cliente pague desde su app.
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPayment('pos')}
              className={`rounded-xl border p-4 text-left transition ${
                paymentMethod === 'pos'
                  ? 'border-[#28A745] bg-[#E4ECE2] ring-2 ring-[#A3CF84]'
                  : 'border-[#E4ECE2] bg-white hover:border-[#A3CF84]'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-black text-[#212529]">
                <ScanLine size={18} /> POS / Tap tarjeta
              </span>
              <span className="mt-1 block text-xs font-semibold text-[#6C757D]">
                El cliente acerca su tarjeta al POS. No se ingresan datos en el sistema.
              </span>
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E4ECE2] bg-white p-5 shadow-[0_14px_32px_rgba(33,37,41,0.07)]">
          {paymentMethod === 'qr' ? (
            <div className="text-center">
              <SimulatedQr code={`${form.destino || 'CARMENCITA'}-${quote.total}`} />
              <p className="mt-3 text-sm font-black text-[#212529]">QR de pago simulado</p>
              <p className="mt-1 text-xs font-semibold text-[#6C757D]">
                Cuando el cliente muestre el pago aprobado en su app, confirma el cobro.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#A3CF84]/70 bg-[#E4ECE2] p-5 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#3C5940] shadow-sm">
                <ScanLine size={34} />
              </div>
              <p className="mt-4 text-sm font-black text-[#212529]">POS listo para tap</p>
              <p className="mt-1 text-xs font-semibold text-[#6C757D]">
                Simula que el POS aprobo la tarjeta del cliente.
              </p>
            </div>
          )}

          {paymentNotice && <div className="mt-4"><Alert tone="success">{paymentNotice}</Alert></div>}
          {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="secondary" onClick={onBack} disabled={loading}>
              Volver
            </Button>
            <Button type="button" onClick={onConfirm} disabled={!canConfirm}>
              {loading ? 'Confirmando...' : paymentMethod === 'qr' ? 'Confirmar pago QR' : 'Confirmar POS aprobado'}
            </Button>
          </div>
        </section>
      </aside>
    </div>
  );
}

function SimulatedQr({ code }) {
  const seed = String(code || 'CARMENCITA');
  const cells = Array.from({ length: 81 }, (_, index) => {
    const char = seed.charCodeAt(index % seed.length) || 67;
    return (char + index * 7) % 5 !== 0;
  });

  return (
    <div className="mx-auto grid h-44 w-44 grid-cols-9 gap-1 rounded-xl border border-[#A3CF84] bg-white p-3 shadow-inner">
      {cells.map((active, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={`rounded-[2px] ${active ? 'bg-[#212529]' : 'bg-transparent'}`}
        />
      ))}
    </div>
  );
}

function EntregaEncomienda() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [receiverDocument, setReceiverDocument] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const canDeliver = shipment && shipment.estado === 'EN_DESTINO';

  const handleSearch = async (event) => {
    event.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    try {
      setLoading('buscar');
      setError('');
      setMessage('');
      setShipment(null);
      const data = await getEncomiendas();
      // Solo paquetes que ya llegaron a destino pueden entregarse.
      const enDestino = data.filter((item) => item.estado === 'EN_DESTINO');
      const matches = enDestino.filter((item) => [
        item.codigo_encomienda,
        item.remitente_nombre,
        item.remitente_numero_documento,
        item.destinatario_nombre,
        item.destinatario_numero_documento,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
      setResults(matches);
      setSearched(true);
    } catch (searchError) {
      setResults([]);
      setError(getApiErrorMessage(searchError, 'No se pudo buscar la encomienda.'));
    } finally {
      setLoading('');
    }
  };

  const handleSelect = async (row) => {
    setShipment(row);
    setReceiverDocument(row.destinatario_numero_documento || '');
    setMessage('');
    setError('');
    try {
      await iniciarEntregaServicio({ encomienda_id: row.id, usuario_correo: user?.username });
    } catch {
      // El log de inicio de entrega es opcional; no debe bloquear la entrega.
    }
  };

  const handleDeliver = async () => {
    if (!shipment) return;
    try {
      setLoading('entregar');
      setError('');
      const result = await entregarEncomienda(shipment.id, { dni_receptor: receiverDocument });
      setShipment((current) => ({ ...current, estado: result.estado, fecha_entrega: result.fecha_entrega }));
      setResults((current) => current.filter((item) => item.id !== shipment.id));
      setMessage('Encomienda entregada correctamente.');
    } catch (deliverError) {
      setError(getApiErrorMessage(deliverError, 'No se pudo registrar la entrega.'));
    } finally {
      setLoading('');
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)]">
        <form className="space-y-4" onSubmit={handleSearch}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-[#3C5940]">Buscar paquete en destino</span>
            <input
              className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Código, DNI o nombre (remitente/destinatario)"
            />
          </label>
          <Button type="submit" className="gap-2" disabled={loading === 'buscar'}>
            <Search className="h-4 w-4" />
            {loading === 'buscar' ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>
        {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
        {message && <div className="mt-4"><Alert tone="success">{message}</Alert></div>}

        {searched && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-black uppercase tracking-wide text-[#3C5940]">
              Resultados en destino ({results.length})
            </p>
            {results.length === 0 && (
              <p className="rounded-md bg-[#F8F9FA] p-3 text-sm font-semibold text-[#6C757D]">
                No hay paquetes en destino que coincidan con la búsqueda.
              </p>
            )}
            {results.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => handleSelect(row)}
                className={`block w-full rounded-lg border p-3 text-left transition ${
                  shipment?.id === row.id
                    ? 'border-[#28A745] bg-[#E4ECE2]'
                    : 'border-[#A3CF84]/60 bg-[#F8F9FA] hover:border-[#28A745] hover:bg-[#E4ECE2]'
                }`}
              >
                <p className="font-black text-[#212529]">{formatShipmentCode(row.codigo_encomienda)}</p>
                <p className="mt-0.5 text-sm font-semibold text-[#6C757D]">
                  {row.remitente_nombre} → {row.destinatario_nombre}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#6C757D]">
                  Dest. DNI: {row.destinatario_numero_documento || '—'}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#A3CF84]/70 bg-[#E4ECE2] p-5 shadow-[0_18px_42px_-18px_rgba(60,89,64,0.3)]">
        <h2 className="text-lg font-black text-[#212529]">Estado del paquete</h2>
        {shipment ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DetailLine label="Codigo" value={formatShipmentCode(shipment.codigo_encomienda)} />
            <DetailLine label="Estado actual" value={shipment.estado} />
            <DetailLine label="Remitente" value={shipment.remitente_nombre} />
            <DetailLine label="Destinatario" value={shipment.destinatario_nombre} />
            <DetailLine label="Ruta" value={`${shipment.origen} - ${shipment.destino}`} />
            <DetailLine label="Contenido" value={`${shipment.descripcion} / ${shipment.peso_kg} kg`} />
            {!canDeliver && <div className="lg:col-span-2"><Alert tone="success">Encomienda entregada.</Alert></div>}
            {canDeliver && (
              <div className="space-y-3 lg:col-span-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-black text-[#3C5940]">DNI receptor entrega</span>
                  <input
                    className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
                    value={receiverDocument}
                    onChange={(event) => setReceiverDocument(event.target.value)}
                    maxLength={8}
                  />
                </label>
                <Button type="button" onClick={handleDeliver} disabled={loading === 'entregar'}>
                  {loading === 'entregar' ? 'Registrando...' : 'Entregado'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-[#6C757D]">Busca un paquete en destino y selecciónalo para registrar la entrega.</p>
        )}
      </section>
    </section>
  );
}

const SECRETARIA_PAGE_SIZE = 35;

function SecretariaIconAction({ icon: Icon, label, onClick, disabled = false, loading = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-brand-dark transition hover:border-brand-green hover:bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
    </button>
  );
}

function ListaEncomiendasRegistradas() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [emittingId, setEmittingId] = useState(null);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      setLoading(true);
      setError('');
      const data = await getEncomiendas();
      setRows(data.filter((item) => item.estado !== 'PRE_REGISTRADA'));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'No se pudo cargar la lista de encomiendas.'));
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = query
      ? rows.filter((row) => [
        row.codigo_encomienda,
        row.remitente_nombre,
        row.remitente_numero_documento,
        row.destinatario_nombre,
        row.destinatario_numero_documento,
        row.origen,
        row.destino,
        row.descripcion,
        row.estado,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)))
      : rows;
    return sortEncomiendasByRecent(base);
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / SECRETARIA_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRows = filteredRows.slice((currentPage - 1) * SECRETARIA_PAGE_SIZE, currentPage * SECRETARIA_PAGE_SIZE);
  const firstShown = filteredRows.length ? (currentPage - 1) * SECRETARIA_PAGE_SIZE + 1 : 0;
  const lastShown = Math.min(currentPage * SECRETARIA_PAGE_SIZE, filteredRows.length);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleEmitir = async (row) => {
    try {
      setEmittingId(row.id);
      setError('');
      setMessage('');
      const receipt = await emitirBoletaDesdeEncomienda({ encomienda_id: row.id, confirmar_pago: true });
      await downloadReceiptPdf(receipt, row.id, row.codigo_encomienda);
      setMessage(`Boleta emitida e impresa/descargada para ${formatShipmentCode(row.codigo_encomienda)}.`);
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'No se pudo emitir la boleta.'));
    } finally {
      setEmittingId(null);
    }
  };

  const columns = [
    {
      header: 'Codigo',
      accessor: 'codigo_encomienda',
      cell: (row) => <span className="font-black text-[#212529]">{formatShipmentCode(row.codigo_encomienda)}</span>,
    },
    {
      header: 'Remitente / Destinatario',
      accessor: 'remitente_nombre',
      cell: (row) => (
        <div className="leading-tight">
          <p className="font-semibold text-[#212529]">{row.remitente_nombre || '-'}</p>
          <p className="mt-0.5 text-xs text-[#6C757D]">
            <span aria-hidden="true">&rarr; </span>{row.destinatario_nombre || '-'}
          </p>
        </div>
      ),
    },
    { header: 'Destino', accessor: 'destino', cell: (row) => <span className="font-medium text-[#212529]">{row.destino || '-'}</span> },
    {
      header: 'Descripcion',
      accessor: 'descripcion',
      wrap: true,
      className: 'max-w-[220px]',
      cell: (row) => (
        <p className="line-clamp-2 text-sm text-[#6C757D]" title={row.descripcion || ''}>
          {row.descripcion || '-'}
        </p>
      ),
    },
    { header: 'Estado', accessor: 'estado', cell: (row) => <StatusBadge value={row.estado} /> },
    {
      header: 'Fecha',
      accessor: 'fecha_creacion',
      cell: (row) => {
        const value = row.fecha_creacion || row.created_at;
        return <span className="text-sm text-[#6C757D]">{value ? formatDateTime(value) : '-'}</span>;
      },
    },
    {
      header: 'Acciones',
      accessor: 'acciones',
      align: 'right',
      cell: (row) => (
        <div className="flex flex-nowrap items-center justify-end gap-1.5">
          <SecretariaIconAction icon={Eye} label="Ver detalle" onClick={() => setSelected(row)} />
          <SecretariaIconAction
            icon={FileText}
            label="Emitir boleta"
            loading={emittingId === row.id}
            disabled={row.estado === 'ANULADA' || emittingId === row.id}
            onClick={() => handleEmitir(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <section className="rounded-2xl border border-[#A3CF84]/70 bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block flex-1">
          <span className="mb-1.5 block text-sm font-black text-[#3C5940]">Buscar encomienda registrada</span>
          <input
            className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
            value={search}
            onChange={handleSearch}
            placeholder="Codigo, DNI, remitente, destinatario, destino o estado"
          />
        </label>
        <Button type="button" variant="secondary" onClick={loadRows} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {message && <div className="mt-4"><Alert tone="success">{message}</Alert></div>}
      {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}

      <div className="mt-5">
        {loading ? (
          <Loader label="Cargando encomiendas..." />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagedRows}
              caption="Encomiendas registradas"
              emptyMessage="No hay encomiendas registradas para mostrar."
            />
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs font-semibold text-[#6C757D]">
                {filteredRows.length > 0 ? `Mostrando ${firstShown}–${lastShown} de ${filteredRows.length}` : 'Sin resultados'}
              </p>
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} label="Paginacion de encomiendas" />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <EncomiendaDetalleModal
            encomienda={selected}
            onClose={() => setSelected(null)}
            actions={
              <>
                <Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button>
                <Button
                  onClick={() => handleEmitir(selected)}
                  disabled={selected.estado === 'ANULADA' || emittingId === selected.id}
                >
                  {emittingId === selected.id ? 'Emitiendo...' : 'Emitir boleta SUNAT'}
                </Button>
              </>
            }
          />
        )}
      </AnimatePresence>
    </section>
  );
}

async function loadDestinations(setLocationOptions) {
  try {
    const destinos = await getDestinos();
    setLocationOptions(destinos.map((destino) => destino.nombre || destino.name).filter(Boolean));
  } catch {
    setLocationOptions(DEFAULT_LOCATION_NAMES);
  }
}

async function handleReniecLookup(role, form, setForm, setErrors, setReniecStatus) {
  const typeField = `${role}_tipo_documento`;
  const documentField = `${role}_numero_documento`;
  const dni = String(form[documentField] || '').trim();

  if (form[typeField] !== 'DNI' || !/^\d{8}$/.test(dni)) {
    return;
  }

  const updatePerson = (client) => {
    setForm((current) => ({
      ...current,
      [`${role}_nombre`]: client.nombre || current[`${role}_nombre`],
      [`${role}_telefono`]: client.telefono || current[`${role}_telefono`],
      [`${role}_correo`]: client.correo || current[`${role}_correo`],
      [`${role}_direccion`]: client.direccion || current[`${role}_direccion`],
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next[`${role}_nombre`];
      delete next[`${role}_telefono`];
      delete next[`${role}_correo`];
      delete next[`${role}_direccion`];
      return next;
    });
  };

  try {
    setReniecStatus((current) => ({ ...current, [role]: { tone: 'info', message: 'Buscando cliente...' } }));
    try {
      const localClient = normalizeLocalClient(await getClienteByDni(dni));
      if (localClient.nombre || localClient.telefono || localClient.correo || localClient.direccion) {
        updatePerson(localClient);
        setReniecStatus((current) => ({ ...current, [role]: { tone: 'success', message: 'Datos autocompletados desde clientes.' } }));
        return;
      }
    } catch (clientError) {
      if (clientError?.response?.status !== 404) throw clientError;
    }

    setReniecStatus((current) => ({ ...current, [role]: { tone: 'info', message: 'Consultando RENIEC...' } }));
    const data = await consultarDni(dni);
    const nombre = extractNombreFromReniecResponse(data);
    if (!nombre) {
      setReniecStatus((current) => ({ ...current, [role]: { tone: 'error', message: 'No se encontro informacion para este DNI.' } }));
      return;
    }
    updatePerson({ nombre });
    setReniecStatus((current) => ({ ...current, [role]: { tone: 'success', message: 'Nombre autocompletado.' } }));
  } catch {
    setReniecStatus((current) => ({ ...current, [role]: { tone: 'error', message: 'No se pudo consultar RENIEC.' } }));
  }
}

function mapShipmentToPublicForm(shipment) {
  return {
    ...emptyPublicShipmentForm,
    remitente_tipo_documento: shipment.remitente_tipo_documento || 'DNI',
    remitente_numero_documento: shipment.remitente_numero_documento || '',
    remitente_nombre: shipment.remitente_nombre || '',
    remitente_direccion: shipment.remitente_direccion || '',
    remitente_telefono: shipment.remitente_telefono || '',
    destinatario_tipo_documento: shipment.destinatario_tipo_documento || 'DNI',
    destinatario_numero_documento: shipment.destinatario_numero_documento || '',
    destinatario_nombre: shipment.destinatario_nombre || '',
    destinatario_direccion: shipment.destinatario_direccion || '',
    destinatario_telefono: shipment.destinatario_telefono || '',
    origen: shipment.origen || '',
    destino: shipment.destino || '',
    descripcion: shipment.descripcion || '',
    tipo_contenido: shipment.tipo_contenido || '',
    peso_kg: shipment.peso_kg || '',
    largo_cm: shipment.tipo_contenido === 'DOCUMENTOS' ? '' : shipment.largo_cm || '',
    ancho_cm: shipment.tipo_contenido === 'DOCUMENTOS' ? '' : shipment.ancho_cm || '',
    alto_cm: shipment.tipo_contenido === 'DOCUMENTOS' ? '' : shipment.alto_cm || '',
    fragilidad: normalizeFragilityForForm(shipment.fragilidad),
    orientacion_base: shipment.orientacion_base || '',
  };
}

function normalizeFragilityForForm(value) {
  const fragility = String(value || '').trim().toUpperCase();
  return ['BAJA', 'MEDIA', 'ALTA'].includes(fragility) ? fragility : 'BAJA';
}

async function downloadReceiptPdf(receipt, shipmentId, shipmentCode) {
  const formattedCode = formatShipmentCode(receipt?.codigo_encomienda || shipmentCode || shipmentId);
  if (receipt?.pdf_url) {
    const pdf = await descargarPdfMock(receipt.pdf_url, receipt.serie, receipt.numero);
    downloadBlob(pdf, `boleta_${receipt.serie}_${receipt.numero}_${formattedCode}.pdf`);
    return;
  }
  const pdf = await generarPdfBetaDesdeEncomienda({ encomienda_id: shipmentId, confirmar_pago: true });
  downloadBlob(pdf, `boleta_${formattedCode}.pdf`);
}

function DetailLine({ label, value }) {
  return (
    <div className="rounded-md bg-white p-3 shadow-sm">
      <p className="text-xs font-black uppercase text-[#6C757D]">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-[#212529]">{value || '-'}</p>
    </div>
  );
}

export default SecretariaDashboard;
