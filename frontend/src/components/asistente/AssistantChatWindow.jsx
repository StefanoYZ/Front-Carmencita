import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

export default function AssistantChatWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [botState, setBotState] = useState('idle');
  const [showQuickActions, setShowQuickActions] = useState(true);

  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [...prev, { id: nextId(), role, text }]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || isThinking) return;
    setInput('');
    setShowQuickActions(false);
    addMessage('user', msg);
    setIsThinking(true);
    setBotState('thinking');

    try {
      const response = await sendChatMessage({
        session_id: sessionId,
        mensaje: msg,
        canal: 'externo',
      });
      setSessionId(response.session_id);
      addMessage('bot', response.respuesta);
      setBotState('success');
      setTimeout(() => setBotState('idle'), 2000);
    } catch {
      addMessage('bot', 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.');
      setBotState('warning');
      setTimeout(() => setBotState('idle'), 2000);
    } finally {
      setIsThinking(false);
    }
  }, [input, isThinking, sessionId, addMessage]);

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
          className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[340px] flex-col overflow-hidden rounded-2xl border border-[#A3CF84] bg-white shadow-2xl sm:right-6"
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
            <AssistantQuickActions onAction={handleQuickAction} disabled={isThinking} />
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
