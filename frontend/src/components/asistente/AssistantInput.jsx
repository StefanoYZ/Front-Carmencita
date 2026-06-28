import React, { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

export default function AssistantInput({ value, onChange, onSend, disabled = false }) {
  const textareaRef = useRef(null);
  const wasDisabledRef = useRef(disabled);

  // Devuelve el foco al input cuando CarmiBot termina de responder, para que el
  // cliente pueda seguir escribiendo sin volver a hacer clic en la caja.
  useEffect(() => {
    if (wasDisabledRef.current && !disabled) {
      textareaRef.current?.focus();
    }
    wasDisabledRef.current = disabled;
  }, [disabled]);

  // Enfoca al montar el input (al abrir el chat).
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-[#E4ECE2] px-3 py-2">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // Auto-resize
          e.target.style.height = 'auto';
          e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Escribe tu mensaje para CarmiBot"
        placeholder="Escribe tu mensaje... (Enter para enviar)"
        className="flex-1 resize-none overflow-y-auto rounded-lg border border-[#A3CF84] bg-white px-3 py-2 text-sm font-semibold text-[#212529] outline-none transition placeholder:text-[#6C757D]/60 focus:border-[#28A745] focus:ring-2 focus:ring-[#A3CF84] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ maxHeight: '100px', minHeight: '38px' }}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensaje"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3C5940] text-white transition hover:bg-[#28A745] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
