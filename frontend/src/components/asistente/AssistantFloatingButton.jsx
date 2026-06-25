import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CarmiBotAvatar from './CarmiBotAvatar.jsx';
import AssistantChatWindow from './AssistantChatWindow.jsx';

export default function AssistantFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AssistantChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

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
          className="flex items-center gap-2 rounded-full bg-[#3C5940] px-4 py-2.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(60,89,64,0.4)] transition hover:bg-[#28A745]"
          aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente Carmencita'}
          aria-expanded={isOpen}
        >
          <CarmiBotAvatar state={isOpen ? 'greeting' : 'idle'} size={32} />
          <span className="hidden sm:block">Asistente Carmencita</span>
        </motion.button>
      </motion.div>
    </>
  );
}
