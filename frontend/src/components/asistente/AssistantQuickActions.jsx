import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, MapPin, Package, PackageCheck, RotateCcw, Search } from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'cotizar', label: 'Cotizar envío', icon: Calculator, message: 'Quiero cotizar un envío' },
  { id: 'tracking', label: 'Consultar paquete', icon: Search, message: 'Quiero consultar el estado de mi paquete' },
  { id: 'horarios', label: 'Horarios y sedes', icon: MapPin, message: '¿Cuáles son los horarios de atención y dónde están las sedes?' },
  { id: 'contenido', label: 'Qué puedo enviar', icon: Package, message: '¿Qué tipo de contenido puedo enviar con Carmencita Express?' },
  { id: 'recojo', label: 'Recojo externo', icon: RotateCcw, message: 'Quiero solicitar un recojo externo de encomienda' },
  { id: 'preregistro', label: 'Hacer pre-registro', icon: PackageCheck, message: 'Quiero hacer un pre-registro de mi envío' },
];

export default function AssistantQuickActions({ onAction, disabled = false }) {
  return (
    <div className="px-3 pb-2">
      <p className="mb-2 text-xs font-black uppercase text-[#3C5940]">Acciones rápidas</p>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onAction(action.message)}
              disabled={disabled}
              className="flex items-center gap-2 rounded-lg border border-[#A3CF84] bg-white px-3 py-2 text-left text-xs font-semibold text-[#3C5940] transition hover:bg-[#E4ECE2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon size={13} className="shrink-0 text-[#28A745]" />
              <span className="leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
