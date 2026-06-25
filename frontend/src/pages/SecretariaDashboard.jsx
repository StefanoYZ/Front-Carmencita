import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, CreditCard, FileText, ListChecks, PackageCheck, Search } from 'lucide-react';
import Alert from '../components/common/Alert.jsx';
import Button from '../components/common/Button.jsx';
import PaymentConfirmationStep from '../components/public/PaymentConfirmationStep.jsx';
import ShipmentFormStep from '../components/public/ShipmentFormStep.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { RegistroExitosoContent } from './public/RegistroExitosoPage.jsx';
import { getApiErrorMessage } from '../services/apiClient.js';
import { getClienteByDni } from '../services/clientes.service.js';
import { calcularCotizacion } from '../services/cotizacionesService.js';
import { getDestinos } from '../services/destinosService.js';
import {
  confirmarPreRegistro,
  createEncomienda,
  entregarEncomienda,
  getEncomiendaByCodigo,
  getEncomiendas,
} from '../services/encomiendasService.js';
import { iniciarEntregaServicio } from '../services/measurementLogsService.js';
import {
  descargarPdfMock,
  emitirBoletaDesdeEncomienda,
  generarPdfBetaDesdeEncomienda,
} from '../services/sunatService.js';
import { consultarDni } from '../services/reniecService.js';
import { extractNombreFromReniecResponse, normalizeLocalClient } from '../utils/reniec.js';
import { sanitizeShipmentField } from '../utils/shipmentValidation.js';
import { DEFAULT_LOCATION_NAMES } from '../utils/locationHierarchy.js';
import {
  buildPublicShipmentPayload,
  emptyPublicShipmentForm,
  validatePublicShipmentForm,
} from '../utils/publicShipment.js';
import { downloadBlob } from '../utils/downloadBlob.js';
import { formatShipmentCode } from '../utils/formatShipmentCode.js';

const tabs = [
  { id: 'registro', label: 'Registro presencial', icon: Calculator },
  { id: 'cobro', label: 'Cobro en agencia', icon: CreditCard },
  { id: 'entrega', label: 'Entrega', icon: PackageCheck },
  { id: 'boletas', label: 'Boletas', icon: FileText },
  { id: 'lista', label: 'Encomiendas registradas', icon: ListChecks },
];

const availableForDelivery = new Set(['EN_DESTINO', 'BOLETA_EMITIDA', 'PAGO_CONFIRMADO', 'REGISTRADA', 'COTIZADA']);

function SecretariaDashboard() {
  const [activeTab, setActiveTab] = useState('registro');

  return (
    <div className="min-h-screen bg-[#F8F9FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-lg bg-[#212529] p-5 text-white shadow-[0_18px_40px_rgba(33,37,41,0.18)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#A3CF84]">Carmencita Express Cargo</p>
            <h1 className="mt-1 text-2xl font-black">Panel de secretaria</h1>
          </div>
        </header>

        <nav className="grid gap-2 md:grid-cols-5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`flex min-h-12 items-center justify-center gap-2 rounded-md border px-4 text-sm font-black transition ${
                activeTab === id
                  ? 'border-[#28A745] bg-[#28A745] text-white shadow-[0_10px_20px_rgba(40,167,69,0.22)]'
                  : 'border-[#A3CF84]/70 bg-white text-[#3C5940] hover:border-[#28A745] hover:bg-[#E4ECE2]'
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        {activeTab === 'registro' && <RegistroPresencial />}
        {activeTab === 'cobro' && <CobroAgencia />}
        {activeTab === 'entrega' && <EntregaEncomienda />}
        {activeTab === 'boletas' && <BoletaPorEncomienda />}
        {activeTab === 'lista' && <ListaEncomiendasRegistradas />}
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

function CobroAgencia() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [successPayment, setSuccessPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

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
      row.destinatario_nombre,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
  }, [rows, search]);

  const handleSelect = async (row) => {
    setSelected(row);
    setSelectedForm(mapShipmentToPublicForm(row));
    setSuccessPayment(null);
    setPaymentNotice('');
    setError('');
    try {
      await calcularCotizacion({ encomienda_id: row.id });
    } catch {
      // El panel de pago conserva el calculo del flujo publico si el backend no responde.
    }
  };

  const handleDigitalApproved = async (method, paymentResult) => {
    if (!selected) return;
    try {
      setLoading('confirmar');
      const confirmed = await confirmarPreRegistro(selected.id);
      const summary = selectedForm || mapShipmentToPublicForm(confirmed);
      setSelected(confirmed);
      setRows((current) => current.filter((item) => item.id !== selected.id));
      setSuccessPayment({ method, status: 'approved', response: paymentResult, result: confirmed, summary });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'El pago fue aprobado, pero no se pudo confirmar el registro.'));
    } finally {
      setLoading('');
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
      <section className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-[#A3CF84]/70 bg-white px-5 py-3 shadow-sm">
          <span className="text-sm font-black text-[#3C5940]">Pre-registro seleccionado:</span>
          <span className="text-sm font-semibold text-[#212529]">{formatShipmentCode(selected?.codigo_encomienda)}</span>
          <span className="text-sm text-[#6C757D]">— {selected?.remitente_nombre} / {selected?.destinatario_nombre}</span>
        </div>
        <PaymentConfirmationStep
          form={selectedForm}
          loading={loading === 'confirmar'}
          error={error}
          paymentMethod={paymentMethod}
          paymentNotice={paymentNotice}
          allowedPaymentMethods={['yape', 'card']}
          encomiendaId={selected.id}
          usuario={user?.username || ''}
          onBack={() => setSelectedForm(null)}
          onEdit={() => setSelectedForm(null)}
          onSelectPayment={(value) => {
            setPaymentMethod(value);
            setPaymentNotice('');
            setError('');
          }}
          onDigitalApproved={handleDigitalApproved}
          onDigitalPending={(method) => setPaymentNotice(`Pago con ${method === 'yape' ? 'Yape' : 'tarjeta'} pendiente.`)}
          onDigitalError={(method, paymentError) => setError(paymentError?.message || `No se pudo procesar el pago con ${method === 'yape' ? 'Yape' : 'tarjeta'}.`)}
        />
      </section>
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[400px_minmax(0,1fr)]">
      <section className="rounded-lg border border-[#A3CF84]/70 bg-white p-5 shadow-[0_16px_34px_rgba(33,37,41,0.09)]">
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-[#3C5940]">Buscar pre-registro</span>
            <input
              className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Codigo, DNI, remitente o destinatario"
            />
          </label>
          <Button type="button" variant="secondary" onClick={loadPending} disabled={loading === 'lista'}>
            {loading === 'lista' ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
        {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
        <div className="mt-5 grid gap-3">
          {filteredRows.map((row) => (
            <button
              key={row.id}
              type="button"
              className="rounded-lg border border-[#A3CF84]/60 bg-[#F8F9FA] p-4 text-left transition hover:border-[#28A745] hover:bg-[#E4ECE2]"
              onClick={() => handleSelect(row)}
            >
              <p className="font-black text-[#212529]">{formatShipmentCode(row.codigo_encomienda)}</p>
              <p className="mt-1 text-sm font-semibold text-[#6C757D]">{row.remitente_nombre} / {row.destinatario_nombre}</p>
              <p className="mt-1 text-xs font-black text-[#3C5940]">{row.origen} - {row.destino}</p>
            </button>
          ))}
          {!filteredRows.length && <p className="rounded-md bg-[#F8F9FA] p-4 text-sm font-semibold text-[#6C757D]">No hay pre-registros pendientes.</p>}
        </div>
      </section>

      <section className="flex items-center justify-center rounded-lg border border-[#A3CF84]/70 bg-white p-8 shadow-[0_16px_34px_rgba(33,37,41,0.09)]">
        <div className="text-center">
          <p className="text-base font-black text-[#3C5940]">Selecciona un pre-registro</p>
          <p className="mt-2 text-sm font-semibold text-[#6C757D]">Elige uno de la lista para confirmar el cobro y procesar el pago.</p>
        </div>
      </section>
    </section>
  );
}

function EntregaEncomienda() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [shipment, setShipment] = useState(null);
  const [receiverDocument, setReceiverDocument] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const canDeliver = shipment && availableForDelivery.has(shipment.estado);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    try {
      setLoading('buscar');
      setError('');
      setMessage('');
      const result = await getEncomiendaByCodigo(code.trim());
      setShipment(result);
      setReceiverDocument(result.destinatario_numero_documento || '');
      await iniciarEntregaServicio({ encomienda_id: result.id, usuario_correo: user?.username });
    } catch (searchError) {
      setShipment(null);
      setError(getApiErrorMessage(searchError, 'No se pudo buscar la encomienda.'));
    } finally {
      setLoading('');
    }
  };

  const handleDeliver = async () => {
    if (!shipment) return;
    try {
      setLoading('entregar');
      setError('');
      const result = await entregarEncomienda(shipment.id, { dni_receptor: receiverDocument });
      setShipment((current) => ({ ...current, estado: result.estado, fecha_entrega: result.fecha_entrega }));
      setMessage('Encomienda entregada correctamente.');
    } catch (deliverError) {
      setError(getApiErrorMessage(deliverError, 'No se pudo registrar la entrega.'));
    } finally {
      setLoading('');
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-lg border border-[#A3CF84]/70 bg-white p-5 shadow-[0_16px_34px_rgba(33,37,41,0.09)]">
        <form className="space-y-4" onSubmit={handleSearch}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-black text-[#3C5940]">Codigo de encomienda</span>
            <input
              className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold uppercase text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="L000000001"
            />
          </label>
          <Button type="submit" className="gap-2" disabled={loading === 'buscar'}>
            <Search className="h-4 w-4" />
            {loading === 'buscar' ? 'Buscando...' : 'Buscar / verificar estado'}
          </Button>
        </form>
        {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
        {message && <div className="mt-4"><Alert tone="success">{message}</Alert></div>}
      </section>

      <section className="rounded-lg border border-[#A3CF84]/70 bg-[#E4ECE2] p-5 shadow-[0_18px_42px_rgba(60,89,64,0.16)]">
        <h2 className="text-lg font-black text-[#212529]">Estado del paquete</h2>
        {shipment ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DetailLine label="Codigo" value={formatShipmentCode(shipment.codigo_encomienda)} />
            <DetailLine label="Estado actual" value={shipment.estado} />
            <DetailLine label="Remitente" value={shipment.remitente_nombre} />
            <DetailLine label="Destinatario" value={shipment.destinatario_nombre} />
            <DetailLine label="Ruta" value={`${shipment.origen} - ${shipment.destino}`} />
            <DetailLine label="Contenido" value={`${shipment.descripcion} / ${shipment.peso_kg} kg`} />
            {!canDeliver && <div className="lg:col-span-2"><Alert tone="warning">La encomienda aun no esta disponible para entrega.</Alert></div>}
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
          <p className="mt-4 text-sm font-semibold text-[#6C757D]">Busca una encomienda para verificar disponibilidad.</p>
        )}
      </section>
    </section>
  );
}

function BoletaPorEncomienda() {
  const [shipmentId, setShipmentId] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handlePrint = async (event) => {
    event.preventDefault();
    try {
      setLoading('boleta');
      setError('');
      const receipt = await emitirBoletaDesdeEncomienda({ encomienda_id: Number(shipmentId), confirmar_pago: true });
      await downloadReceiptPdf(receipt, Number(shipmentId), receipt.codigo_encomienda);
      setMessage('Boleta emitida e impresa/descargada correctamente.');
    } catch (actionError) {
      setError(getApiErrorMessage(actionError, 'No se pudo imprimir la boleta.'));
    } finally {
      setLoading('');
    }
  };

  return (
    <section className="rounded-lg border border-[#A3CF84]/70 bg-white p-5 shadow-[0_16px_34px_rgba(33,37,41,0.09)]">
      <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={handlePrint}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-black text-[#3C5940]">ID de encomienda</span>
          <input
            className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
            type="number"
            min="1"
            value={shipmentId}
            onChange={(event) => setShipmentId(event.target.value)}
            required
          />
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={loading === 'boleta'}>
            {loading === 'boleta' ? 'Imprimiendo...' : 'Emitir / imprimir'}
          </Button>
        </div>
      </form>
      {message && <div className="mt-4"><Alert tone="success">{message}</Alert></div>}
      {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
    </section>
  );
}

function ListaEncomiendasRegistradas() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!query) return rows;
    return rows.filter((row) => [
      row.codigo_encomienda,
      row.remitente_nombre,
      row.destinatario_nombre,
      row.origen,
      row.destino,
      row.estado,
    ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
  }, [rows, search]);

  return (
    <section className="rounded-lg border border-[#A3CF84]/70 bg-white p-5 shadow-[0_16px_34px_rgba(33,37,41,0.09)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block flex-1">
          <span className="mb-1.5 block text-sm font-black text-[#3C5940]">Buscar encomienda registrada</span>
          <input
            className="min-h-11 w-full rounded-md border border-[#A3CF84] bg-white px-3 text-sm font-semibold text-[#212529] outline-none focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84]"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Codigo, remitente, destino o estado"
          />
        </label>
        <Button type="button" variant="secondary" onClick={loadRows} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>
      {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
      <div className="mt-5 grid gap-3">
        {filteredRows.map((row) => (
          <div key={row.id} className="grid gap-3 rounded-lg border border-[#A3CF84]/55 bg-[#F8F9FA] p-4 shadow-sm md:grid-cols-[160px_1fr_1fr_130px] md:items-center">
            <p className="font-black text-[#212529]">{formatShipmentCode(row.codigo_encomienda)}</p>
            <p className="text-sm font-semibold text-[#6C757D]">{row.remitente_nombre} / {row.destinatario_nombre}</p>
            <p className="text-sm font-semibold text-[#6C757D]">{row.origen} - {row.destino}</p>
            <span className="rounded-full bg-[#E4ECE2] px-3 py-1 text-center text-xs font-black text-[#3C5940]">{row.estado}</span>
          </div>
        ))}
        {!filteredRows.length && <p className="rounded-md bg-[#F8F9FA] p-4 text-sm font-semibold text-[#6C757D]">No hay encomiendas registradas para mostrar.</p>}
      </div>
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
