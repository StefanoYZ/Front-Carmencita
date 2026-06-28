import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CarmiBotAvatar from './CarmiBotAvatar.jsx';

function BotText({ text }) {
  // Renderiza **negrita** y saltos de línea sin dependencias externas
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-black text-[#212529]">{part.slice(2, -2)}</strong>;
        }
        return part.split('\n').map((line, j) => (
          <span key={`${i}-${j}`}>{j > 0 && <br />}{line}</span>
        ));
      })}
    </span>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-[#A3CF84]"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function AssistantMessageList({ messages, isThinking }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'bot' && (
              <div className="shrink-0">
                <CarmiBotAvatar state="idle" size={32} />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-[#3C5940] text-white'
                  : msg.type === 'success'
                    ? 'rounded-bl-sm border border-[#28A745]/30 bg-[#d4edda] text-[#155724]'
                    : msg.type === 'warning-new'
                      ? 'rounded-bl-sm border-2 border-amber-500 bg-amber-200 text-[#6b3d02] shadow-md ring-2 ring-amber-300 transition-colors duration-500'
                      : msg.type === 'warning'
                        ? 'rounded-bl-sm border border-amber-300 bg-amber-50 text-[#7c4a03] transition-colors duration-500'
                        : 'rounded-bl-sm bg-[#E4ECE2] text-[#212529]'
              }`}
            >
              <BotText text={msg.text} />
            </div>
          </motion.div>
        ))}

        {isThinking && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-end gap-2"
          >
            <div className="shrink-0">
              <CarmiBotAvatar state="thinking" size={32} />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-[#E4ECE2] px-3 py-2">
              <ThinkingDots />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
