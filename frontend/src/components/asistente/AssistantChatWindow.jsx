import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Maximize2, Minimize2, X } from 'lucide-react';
import CarmiBotAvatar from './CarmiBotAvatar.jsx';
import AssistantMessageList from './AssistantMessageList.jsx';
import AssistantQuickActions from './AssistantQuickActions.jsx';
import AssistantInput from './AssistantInput.jsx';
import { sendChatMessage } from '../../services/assistantService.js';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  text: '¡Hola! Soy CarmiBot, el asistente virtual de Carmencita Express. ¿En qué te puedo ayudar hoy?',
};

let _msgCounter = 1;
function nextId() {
  return `msg-${Date.now()}-${_msgCounter++}`;
}

export default function AssistantChatWindow({ isOpen, onClose, incomingAlert }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [botState, setBotState] = useState('idle');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  // datos_acumulados persiste el estado del wizard entre turnos
  const [datosAcumulados, setDatosAcumulados] = useState(null);
  const lastAlertIdRef = useRef(null);
  const latestWarningsRef = useRef([]);
  const lastPostedKeyRef = useRef('');

  const addMessage = useCallback((role, text, type = null) => {
    setMessages((prev) => [...prev, { id: nextId(), role, text, type }]);
  }, []);

  // Publica un aviso de coherencia. El mensaje nuevo se resalta con un color más
  // intenso ('warning-new'); los avisos previos bajan a su color regular ('warning').
  // Tras unos segundos, el mensaje nuevo también baja a su color regular.
  const postWarnings = useCallback((warnings) => {
    if (!warnings?.length) {
      lastPostedKeyRef.current = '';
      return;
    }
    const key = warnings.join('|');
    if (key === lastPostedKeyRef.current) return;
    lastPostedKeyRef.current = key;

    const id = nextId();
    const cuerpo = warnings.map((w) => `• ${w}`).join('\n');
    const text = 'Revisé los datos de tu paquete y noto algo que podría ser un error:\n\n'
      + `${cuerpo}\n\n`
      + 'Si fue intencional puedes continuar, pero te recomiendo revisarlo antes de seguir. 😊';

    setShowQuickActions(false);
    setMessages((prev) => {
      const downgraded = prev.map((m) => (m.type === 'warning-new' ? { ...m, type: 'warning' } : m));
      return [...downgraded, { id, role: 'bot', text, type: 'warning-new' }];
    });
    setBotState('warning');

    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === id && m.type === 'warning-new' ? { ...m, type: 'warning' } : m)));
      setBotState('idle');
    }, 4000);
  }, []);

  // Mantiene la última lista de advertencias y, si el chat está abierto, actualiza
  // el mensaje en tiempo real cuando el cliente corrige y aparece un nuevo error.
  useEffect(() => {
    const handler = (event) => {
      const warnings = event.detail?.warnings || [];
      latestWarningsRef.current = warnings;
      if (!warnings.length) lastPostedKeyRef.current = '';
      if (isOpen && warnings.length) postWarnings(warnings);
    };
    window.addEventListener('carmencita:coherence-update', handler);
    return () => window.removeEventListener('carmencita:coherence-update', handler);
  }, [isOpen, postWarnings]);

  // Apertura desde la campanita: muestra las advertencias vigentes del paquete.
  useEffect(() => {
    if (!incomingAlert?.id || incomingAlert.id === lastAlertIdRef.current) return;
    lastAlertIdRef.current = incomingAlert.id;
    const warnings = latestWarningsRef.current.length
      ? latestWarningsRef.current
      : (incomingAlert.warnings || []);
    postWarnings(warnings);
  }, [incomingAlert, postWarnings]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || isThinking) return;
    setInput('');
    setShowQuickActions(false);
    addMessage('user', msg);
    setIsThinking(true);
    setBotState('thinking');

    try {
      const historial = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-12)
        .map((m) => ({ rol: m.role === 'user' ? 'usuario' : 'asistente', texto: m.text }));

      const response = await sendChatMessage({
        session_id: sessionId,
        mensaje: msg,
        canal: 'externo',
        contexto_actual: { historial, datos_acumulados: datosAcumulados },
      });
      setSessionId(response.session_id);

      // Actualizar datos acumulados del wizard
      if (
        response.accion_sugerida === 'preregistro_creado'
        || response.accion_sugerida === 'preregistro_cancelado'
        || response.accion_sugerida === 'pagar_online'
      ) {
        setDatosAcumulados(null);
      } else if (response.datos_extraidos) {
        setDatosAcumulados(response.datos_extraidos);
      }

      const esExito = ['preregistro_creado', 'pagar_online', 'elegir_metodo_pago'].includes(
        response.accion_sugerida,
      );
      addMessage('bot', response.respuesta, esExito ? 'success' : null);
      setBotState('success');
      setTimeout(() => setBotState('idle'), 2000);

      // Pago en línea: llevar al cliente a la vista de confirmación y pago.
      if (response.accion_sugerida === 'pagar_online') {
        const d = response.datos_extraidos || {};
        const result = {
          id: d.encomienda_id,
          codigo_encomienda: d.codigo_encomienda,
          estado: 'PRE_REGISTRADA',
        };
        const summary = {
          remitente_tipo_documento: 'DNI',
          remitente_numero_documento: d.remitente_dni || '',
          remitente_nombre: d.remitente_nombre || '',
          remitente_telefono: d.remitente_telefono || '',
          remitente_correo: d.remitente_correo || '',
          destinatario_tipo_documento: d.destinatario_dni ? 'DNI' : '',
          destinatario_numero_documento: d.destinatario_dni || '',
          destinatario_nombre: d.destinatario_nombre || '',
          destinatario_telefono: d.destinatario_telefono || '',
          destinatario_correo: d.destinatario_correo || '',
          origen: d.origen || 'Trujillo',
          destino: d.destino || '',
          tipo_contenido: d.tipo_contenido || '',
          descripcion: d.descripcion || '',
          peso_kg: d.peso_kg ?? '',
          largo_cm: d.largo_cm ?? '',
          ancho_cm: d.ancho_cm ?? '',
          alto_cm: d.alto_cm ?? '',
          fragilidad: d.fragilidad || 'BAJA',
        };
        onClose();
        navigate('/pre-registro-exitoso', { state: { result, summary, autoPay: true } });
      }
    } catch {
      addMessage('bot', 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.');
      setBotState('warning');
      setTimeout(() => setBotState('idle'), 2000);
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, sessionId, addMessage, datosAcumulados, messages, navigate, onClose]);

  const handleQuickAction = useCallback((message) => {
    sendMessage(message);
  }, [sendMessage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`fixed bottom-24 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-[#A3CF84] bg-white shadow-2xl sm:right-6 ${
            isExpanded
              ? 'h-[min(720px,calc(100vh-7rem))] w-[min(720px,calc(100vw-2rem))]'
              : 'h-[520px] w-[340px] max-w-[calc(100vw-2rem)]'
          }`}
          role="dialog"
          aria-label="Asistente Virtual CarmiBot"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#1f4d2f] to-[#3C5940] px-4 py-3">
            <CarmiBotAvatar state={botState} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">CarmiBot</p>
              <p className="text-xs font-semibold text-[#A3CF84]">Asistente Virtual Carmencita Express</p>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickActions((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white"
              aria-label={showQuickActions ? 'Ocultar consultas rápidas' : 'Mostrar consultas rápidas'}
              title={showQuickActions ? 'Ocultar consultas rápidas' : 'Mostrar consultas rápidas'}
            >
              <ListChecks size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white"
              aria-label={isExpanded ? 'Reducir chat' : 'Ampliar chat'}
              title={isExpanded ? 'Reducir chat' : 'Ampliar chat'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white"
              aria-label="Cerrar asistente"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <AssistantMessageList messages={messages} isThinking={isThinking} />

          {/* Quick actions (only on first load) */}
          {showQuickActions && (
            <AssistantQuickActions onAction={handleQuickAction} disabled={isThinking} compact={isExpanded} />
          )}

          {/* Input */}
          <AssistantInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage()}
            disabled={isThinking}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
