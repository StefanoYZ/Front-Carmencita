import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CarmiBotAvatar from './CarmiBotAvatar.jsx';
import AssistantChatWindow from './AssistantChatWindow.jsx';
import { ASSISTANT_ALERT_EVENT } from './FieldAlertBell.jsx';

export default function AssistantFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState(null);

  useEffect(() => {
    const handleAlert = (event) => {
      const warnings = event.detail?.warnings || [];
      if (!warnings.length) return;
      setIncomingAlert({ id: Date.now(), warnings });
      setIsOpen(true);
    };
    window.addEventListener(ASSISTANT_ALERT_EVENT, handleAlert);
    return () => window.removeEventListener(ASSISTANT_ALERT_EVENT, handleAlert);
  }, []);

  return (
    <>
      <AssistantChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        incomingAlert={incomingAlert}
      />

      <motion.div
        className="fixed bottom-5 right-4 z-50 sm:right-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="relative flex items-center gap-2 rounded-full border border-[#A3CF84]/80 bg-[#28A745] px-4 py-2.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(60,89,64,0.42),0_4px_12px_rgba(33,37,41,0.18)] ring-4 ring-[#A3CF84]/25 transition hover:bg-[#2f4633] hover:shadow-[0_18px_42px_rgba(60,89,64,0.5),0_6px_16px_rgba(33,37,41,0.22)] focus:outline-none focus:ring-4 focus:ring-[#A3CF84]/50"
          aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente Carmencita'}
          aria-expanded={isOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-inner">
            <CarmiBotAvatar state={isOpen ? 'greeting' : 'idle'} size={30} />
          </span>
          <span className="hidden sm:block">Asistente Carmencita</span>
        </motion.button>
      </motion.div>
    </>
  );
}
