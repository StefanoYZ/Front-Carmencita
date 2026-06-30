import React from 'react';
import editIcon from '../../assets/icons/lapiz.svg';
import fragilIcon from '../../assets/icons/fragil.svg';
import locationIcon from '../../assets/icons/marcador-de-posicion.svg';
import packageIcon from '../../assets/icons/paquete.svg';
import pesoIcon from '../../assets/icons/peso.svg';
import taskIcon from '../../assets/icons/tarea.svg';

function SummaryRow({ label, value }) {
  return (
    <div className="min-w-0 rounded-md bg-[#F8F9FA] px-3 py-2 ring-1 ring-[#E4ECE2]">
      <p className="text-xs font-black uppercase text-[#3C5940]/70">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#212529]">{value || '-'}</p>
    </div>
  );
}

function itemValue(items, label) {
  return items.find((item) => item.label === label)?.value || '-';
}

function SummaryIcon({ src, className = '' }) {
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E4ECE2] ring-1 ring-[#A3CF84]/50 ${className}`}>
      <img src={src} alt="" className="h-5 w-5" />
    </span>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-[#F8F9FA] p-3 ring-1 ring-[#E4ECE2]">
      <SummaryIcon src={icon} />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-[#6C757D]">{label}</p>
        <p className="mt-0.5 break-words font-semibold text-[#212529]">{value || '-'}</p>
      </div>
    </div>
  );
}

function ShipmentDetailSummary({ items }) {
  const sideItems = [
    { icon: pesoIcon, label: 'Peso', value: itemValue(items, 'Peso') },
    { icon: packageIcon, label: 'Dimensiones (L x A x H)', value: itemValue(items, 'Dimensiones') },
    { icon: fragilIcon, label: 'Fragilidad', value: itemValue(items, 'Fragilidad') },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-start">
      <div className="grid gap-3">
        <DetailItem icon={locationIcon} label="Origen" value={itemValue(items, 'Origen')} />
        <DetailItem icon={locationIcon} label="Destino" value={itemValue(items, 'Destino')} />
        <DetailItem icon={taskIcon} label="Descripcion" value={itemValue(items, 'Descripcion')} />
      </div>

      <div className="rounded-xl border border-[#E4ECE2] bg-white p-4 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_12px_24px_-14px_rgba(33,37,41,0.22)]">
        {sideItems.map((item, index) => (
          <div key={item.label} className={`flex items-center gap-3 py-3 ${index > 0 ? 'border-t border-[#E4ECE2]' : ''}`}>
            <SummaryIcon src={item.icon} />
            <span className="min-w-0 flex-1 font-semibold text-[#212529]">{item.label}</span>
            <strong className="break-words text-right text-[#212529]">{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShipmentSummaryCard({ title, items, onEdit }) {
  const isShipmentDetail = title === 'Datos de la encomienda';

  return (
    <section className={`h-fit min-w-0 self-start rounded-2xl border border-[#E4ECE2] bg-white p-5 shadow-[0_1px_2px_rgba(33,37,41,0.04),0_16px_38px_-18px_rgba(33,37,41,0.22)] ${isShipmentDetail ? 'border-t-4 border-t-[#28A745]' : ''}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {isShipmentDetail && <SummaryIcon src={packageIcon} className="bg-white" />}
          <h3 className={`text-lg font-black ${isShipmentDetail ? 'text-[#3C5940]' : 'text-[#212529]'}`}>{title}</h3>
        </div>
        {onEdit && (
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#A3CF84]/60 bg-white transition hover:bg-[#E4ECE2]"
            onClick={onEdit}
            aria-label={`Editar ${title}`}
            title={`Editar ${title}`}
          >
            <img src={editIcon} alt="" className="h-4 w-4" />
          </button>
        )}
      </div>
      {isShipmentDetail ? (
        <ShipmentDetailSummary items={items} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <SummaryRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ShipmentSummaryCard;
