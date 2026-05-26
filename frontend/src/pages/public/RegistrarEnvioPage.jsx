import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PaymentConfirmationStep from '../../components/public/PaymentConfirmationStep.jsx';
import ShipmentFormStep from '../../components/public/ShipmentFormStep.jsx';
import StepIndicator from '../../components/public/StepIndicator.jsx';
import { getApiErrorMessage } from '../../services/apiClient.js';
import { getClienteByDni } from '../../services/clientes.service.js';
import { crearEncomienda, crearPreRegistro } from '../../services/encomiendasService.js';
import { consultarDni } from '../../services/reniecService.js';
import { extractNombreFromReniecResponse, normalizeLocalClient } from '../../utils/reniec.js';
import { sanitizeShipmentField } from '../../utils/shipmentValidation.js';
import {
  PUBLIC_QUOTE_STORAGE_KEY,
  PUBLIC_SHIPMENT_STORAGE_KEY,
  PUBLIC_SUCCESS_STORAGE_KEY,
  buildPublicShipmentPayload,
  clearSessionKey,
  emptyPublicShipmentForm,
  mapQuoteToShipmentForm,
  readSessionJSON,
  validatePublicShipmentForm,
  writeSessionJSON,
} from '../../utils/publicShipment.js';

function getInitialForm(routeQuote) {
  if (routeQuote) {
    return { ...emptyPublicShipmentForm, ...mapQuoteToShipmentForm(routeQuote) };
  }

  const storedForm = readSessionJSON(PUBLIC_SHIPMENT_STORAGE_KEY, null);
  if (storedForm) {
    return { ...emptyPublicShipmentForm, ...storedForm };
  }

  const storedQuote = readSessionJSON(PUBLIC_QUOTE_STORAGE_KEY, null);
  return { ...emptyPublicShipmentForm, ...mapQuoteToShipmentForm(storedQuote) };
}

function RegistrarEnvioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => getInitialForm(location.state?.quote));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('agency');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [reniecStatus, setReniecStatus] = useState({
    remitente: null,
    destinatario: null,
  });

  const hasPrefilledQuote = useMemo(
    () => Boolean(location.state?.quote || readSessionJSON(PUBLIC_QUOTE_STORAGE_KEY, null)),
    [location.state],
  );

  useEffect(() => {
    writeSessionJSON(PUBLIC_SHIPMENT_STORAGE_KEY, form);
  }, [form]);

  useEffect(() => {
    return () => {
      clearSessionKey(PUBLIC_SHIPMENT_STORAGE_KEY);
      clearSessionKey(PUBLIC_QUOTE_STORAGE_KEY);
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: sanitizeShipmentField(name, value, current) };

      if (name.endsWith('_tipo_documento') && value === 'DNI') {
        const prefix = name.replace('_tipo_documento', '');
        const documentField = `${prefix}_numero_documento`;
        next[documentField] = sanitizeShipmentField(documentField, next[documentField], next);
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

  const updateNameFromReniec = (role, value) => {
    setForm((current) => ({ ...current, [`${role}_nombre`]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[`${role}_nombre`];
      return next;
    });
  };

  const updatePersonFromLocalClient = (role, client) => {
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

  const handleReniecLookup = async (role) => {
    const typeField = `${role}_tipo_documento`;
    const documentField = `${role}_numero_documento`;
    const dni = String(form[documentField] || '').trim();

    if (form[typeField] !== 'DNI' || !/^\d{8}$/.test(dni)) {
      return;
    }

    try {
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'info', message: 'Buscando cliente...' },
      }));
      try {
        const localClient = normalizeLocalClient(await getClienteByDni(dni));
        if (localClient.nombre || localClient.telefono || localClient.correo || localClient.direccion) {
          updatePersonFromLocalClient(role, localClient);
          setReniecStatus((current) => ({
            ...current,
            [role]: { tone: 'success', message: 'Datos autocompletados desde clientes.' },
          }));
          return;
        }
      } catch (clientError) {
        if (clientError?.response?.status !== 404) {
          throw clientError;
        }
      }

      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'info', message: 'Consultando RENIEC...' },
      }));
      const data = await consultarDni(dni);
      const nombre = extractNombreFromReniecResponse(data);

      if (!nombre) {
        setReniecStatus((current) => ({
          ...current,
          [role]: { tone: 'error', message: 'No se pudo consultar RENIEC, ingrese el nombre manualmente.' },
        }));
        return;
      }

      updateNameFromReniec(role, nombre);
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'success', message: 'Nombre autocompletado.' },
      }));
    } catch (error) {
      setReniecStatus((current) => ({
        ...current,
        [role]: { tone: 'error', message: 'No se pudo consultar RENIEC, ingrese el nombre manualmente.' },
      }));
    }
  };

  const handleContinue = (event) => {
    event.preventDefault();
    const validationErrors = validatePublicShipmentForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors, general: 'Revisa los campos marcados antes de continuar.' });
      return;
    }

    setErrors({});
    setApiError('');
    setPaymentNotice('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatePreRegistration = async () => {
    const validationErrors = validatePublicShipmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors, general: 'Revisa los campos marcados antes de continuar.' });
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setApiError('');
      setPaymentNotice('');
      const payload = buildPublicShipmentPayload(form);
      const result = await crearPreRegistro(payload);
      writeSessionJSON(PUBLIC_SUCCESS_STORAGE_KEY, { result, summary: form });
      clearSessionKey(PUBLIC_SHIPMENT_STORAGE_KEY);
      navigate('/pre-registro-exitoso', { state: { result, summary: form } });
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'No se pudo crear el pre-registro.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDigitalPending = (method) => {
    const message =
      method === 'yape'
        ? 'Pago con Yape pendiente de validacion o no aprobado. No se creo registro formal.'
        : 'Pago con tarjeta pendiente de validacion o no aprobado. No se creo registro formal.';
    setPaymentNotice(message);
    setApiError('');
  };

  const handleDigitalError = (method, error) => {
    const methodLabel = method === 'yape' ? 'Yape' : 'tarjeta';
    const message = error?.message || `No se pudo cargar o procesar el pago con ${methodLabel}.`;
    setPaymentNotice('');
    setApiError(message);
  };

  const handleDigitalApproved = async (method, paymentResult) => {
    const validationErrors = validatePublicShipmentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors({ ...validationErrors, general: 'Revisa los campos marcados antes de continuar.' });
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setApiError('');
      setPaymentNotice('');
      const payload = buildPublicShipmentPayload(form);
      const result = await crearEncomienda(payload);
      writeSessionJSON(PUBLIC_SUCCESS_STORAGE_KEY, {
        result,
        summary: form,
        payment: {
          method,
          status: 'approved',
          response: paymentResult,
        },
      });
      clearSessionKey(PUBLIC_SHIPMENT_STORAGE_KEY);
      navigate('/registro-exitoso', {
        state: {
          result,
          summary: form,
          payment: {
            method,
            status: 'approved',
            response: paymentResult,
          },
        },
      });
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'El pago fue aprobado, pero no se pudo crear el registro formal.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#F5F5F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to="/" className="text-sm font-black text-[#31934F] hover:text-[#3F6845]">
              Volver
            </Link>
            <h1 className="mt-3 text-3xl font-black text-[#1F2937] sm:text-4xl">Registro de envio</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-gray-600">
              Completa tus datos para completar tu encomienda.
            </p>
            {hasPrefilledQuote && (
              <p className="mt-2 rounded-md bg-[#E3EAE1] px-3 py-2 text-sm font-semibold text-[#3F6845]">
                Datos de cotizacion precargados desde el cotizador.
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <StepIndicator currentStep={step} />
        </div>

        {step === 1 ? (
          <ShipmentFormStep
            form={form}
            errors={errors}
            reniecStatus={reniecStatus}
            onChange={updateField}
            onReniecLookup={handleReniecLookup}
            onSubmit={handleContinue}
            onCancel={() => navigate('/')}
          />
        ) : (
          <PaymentConfirmationStep
            form={form}
            loading={loading}
            error={apiError}
            paymentMethod={paymentMethod}
            paymentNotice={paymentNotice}
            onBack={() => setStep(1)}
            onConfirmAgency={handleCreatePreRegistration}
            onEdit={() => setStep(1)}
            onSelectPayment={(value) => {
              setPaymentMethod(value);
              setPaymentNotice('');
              setApiError('');
            }}
            onDigitalApproved={handleDigitalApproved}
            onDigitalError={handleDigitalError}
            onDigitalPending={handleDigitalPending}
          />
        )}
      </div>
    </section>
  );
}

export default RegistrarEnvioPage;
