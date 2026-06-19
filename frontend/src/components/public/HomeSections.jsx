import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Clock3,
  Headphones,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Reveal from './Reveal.jsx';

const services = [
  {
    icon: PackageCheck,
    title: 'Envíos de encomiendas',
    description: 'Registramos y trasladamos paquetes con información clara desde la recepción hasta la entrega.',
  },
  {
    icon: Route,
    title: 'Seguimiento del envío',
    description: 'Consulta el estado de tu encomienda con su código y mantén visible cada etapa del recorrido.',
  },
  {
    icon: ShieldCheck,
    title: 'Transporte responsable',
    description: 'Aplicamos controles operativos para proteger la carga y organizar cada despacho de forma segura.',
  },
  {
    icon: Headphones,
    title: 'Atención personalizada',
    description: 'Nuestro equipo te orienta durante el registro, la cotización y la recepción de tu encomienda.',
  },
];

const destinations = [
  'Trujillo',
  'Shorey',
  'Huaycatan',
  'Santiago de Chuco',
  'Chacomas',
  'Cachicadan',
  'Santa Cruz',
  'Cochapamba',
  'Ugallama',
  'Villacruz',
  'Las Manzanas',
  'Angasmarca',
  'Tambo Pampamarca Alta',
  'Psicochaca',
  'Santa Clara de Tulpo',
  'La Yeguada',
  'Mollebamba',
  'Cochamarca',
  'Orocullay',
];

const stats = [
  { value: '19', label: 'destinos conectados' },
  { value: '12–24 h', label: 'tiempo estimado' },
  { value: '100%', label: 'seguimiento disponible' },
];

function SectionHeading({ eyebrow, title, description, centered = false }) {
  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#28A745]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight text-[#212529] sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base font-medium leading-7 text-[#6C757D] sm:text-lg">{description}</p>
    </div>
  );
}

function ServicesSection() {
  return (
    <section id="servicios" className="scroll-mt-28 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Servicios"
            title="Soluciones para mover tus encomiendas con confianza"
            description="Una experiencia sencilla para cotizar, registrar y consultar tus envíos desde cualquier dispositivo."
            centered
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} delay={index * 90}>
                <article className="public-service-card group h-full border-t-4 border-[#28A745] bg-[#F8F9FA] p-6 shadow-[0_12px_32px_rgba(33,37,41,0.07)] transition duration-300 hover:-translate-y-1 hover:bg-[#E4ECE2] hover:shadow-[0_18px_38px_rgba(60,89,64,0.14)]">
                  <span className="public-service-icon flex h-12 w-12 items-center justify-center rounded-md bg-[#3C5940] text-white transition group-hover:bg-[#28A745]">
                    <Icon size={25} strokeWidth={2.2} />
                  </span>
                  <h3 className="mt-5 text-lg font-black text-[#212529]">{service.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#6C757D]">{service.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DestinationsSection() {
  return (
    <section id="destinos" className="scroll-mt-28 bg-[#E4ECE2] py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Destinos"
            title="Conectamos Trujillo con las localidades de la ruta"
            description="Selecciona el origen y destino disponible al cotizar. La operación mantiene cada ruta centralizada para brindarte información consistente."
          />
          <Link
            to="/registrar-envio"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#28A745] px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(40,167,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#3C5940]"
          >
            Registrar un envío
            <ArrowRight size={18} />
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative overflow-hidden bg-white p-6 shadow-[0_18px_44px_rgba(60,89,64,0.13)] sm:p-8">
            <div className="absolute left-8 top-0 h-full w-px bg-[#A3CF84]/60" aria-hidden="true" />
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {destinations.map((destination, index) => (
                <div
                  key={destination}
                  className="group relative flex min-h-12 items-center gap-3 border-b border-[#E4ECE2] bg-white py-3 pl-8 text-sm font-bold text-[#3C5940]"
                >
                  <span className="public-destination-marker absolute left-[1px] flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-[#28A745] text-white shadow-sm transition group-hover:scale-110">
                    <MapPin size={14} fill="currentColor" />
                  </span>
                  <span className="text-xs font-black text-[#6C757D]">{String(index + 1).padStart(2, '0')}</span>
                  <span>{destination}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="nosotros" className="scroll-mt-28 bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal className="order-2 lg:order-1">
          <div className="relative min-h-[390px] overflow-hidden bg-[#3C5940] shadow-[0_22px_48px_rgba(33,37,41,0.18)]">
            <img
              src="/images/hero-camion.png"
              alt="Camión de Carmencita Express Cargo"
              className="public-about-image absolute inset-0 h-full w-full object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#212529]/80 via-[#3C5940]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-px bg-white/15 p-4 backdrop-blur-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="px-2 py-3 text-center text-white">
                  <p className="text-xl font-black sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-bold leading-4 text-white/80 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2" delay={100}>
          <SectionHeading
            eyebrow="Nosotros"
            title="Experiencia local respaldada por una operación más inteligente"
            description="Carmencita Express Cargo integra atención cercana y herramientas digitales para organizar el transporte, mejorar la trazabilidad y hacer más simple cada envío."
          />
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 border-l-4 border-[#28A745] bg-[#F8F9FA] p-4">
              <Clock3 className="mt-0.5 shrink-0 text-[#28A745]" size={23} />
              <div>
                <p className="font-black text-[#212529]">Respuesta ágil</p>
                <p className="mt-1 text-sm leading-6 text-[#6C757D]">Procesos claros para registrar y consultar sin pasos innecesarios.</p>
              </div>
            </div>
            <div className="flex gap-3 border-l-4 border-[#A3CF84] bg-[#F8F9FA] p-4">
              <Sparkles className="mt-0.5 shrink-0 text-[#3C5940]" size={23} />
              <div>
                <p className="font-black text-[#212529]">Mejora continua</p>
                <p className="mt-1 text-sm leading-6 text-[#6C757D]">Tecnología aplicada a la operación diaria y al cuidado de la carga.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contacto" className="scroll-mt-28 bg-[#212529] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="overflow-hidden border border-white/10 bg-[#3C5940] shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
            <div className="grid items-center gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#A3CF84]">Contacto</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                  ¿Necesitas ayuda con tu encomienda?
                </h2>
                <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/75">
                  Comunícate con nuestro equipo para resolver consultas sobre rutas, registro, recepción o seguimiento.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href="tel:044222222"
                  className="public-contact-action inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#28A745] px-6 font-black text-white transition hover:-translate-y-0.5 hover:bg-[#A3CF84] hover:text-[#212529]"
                >
                  <Phone size={20} />
                  (044) 222222
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Av.%20Am%C3%A9rica%20Sur%20257%2C%20Trujillo%2013006"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/20 px-6 font-bold text-white/90 transition hover:border-[#A3CF84] hover:bg-white/10"
                >
                  <Navigation size={20} className="text-[#A3CF84]" />
                  Cómo llegar
                </a>
              </div>
            </div>

            <div className="grid border-t border-white/10 lg:grid-cols-[0.72fr_1.28fr]">
              <div className="flex flex-col justify-center bg-[#E4ECE2] p-7 text-[#212529] sm:p-9">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[#28A745] text-white shadow-lg shadow-[#28A745]/20">
                  <Building2 size={24} />
                </span>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#28A745]">Sede principal</p>
                <h3 className="mt-2 text-2xl font-black text-[#212529]">Carmencita Express Cargo</h3>
                <div className="mt-4 flex items-start gap-3 text-sm font-bold leading-6 text-[#3C5940]">
                  <MapPin size={21} className="mt-0.5 shrink-0 text-[#28A745]" />
                  <address className="not-italic">Av. América Sur 257, Trujillo 13006</address>
                </div>
                <p className="mt-4 text-sm font-medium leading-6 text-[#6C757D]">
                  Atención para registro, recepción y consulta de encomiendas.
                </p>
              </div>

              <div className="relative min-h-[330px] bg-[#F8F9FA]">
                <iframe
                  title="Mapa de la sede principal de Carmencita Express Cargo"
                  src="https://www.google.com/maps?q=Av.%20Am%C3%A9rica%20Sur%20257%2C%20Trujillo%2013006&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HomeSections() {
  return (
    <>
      <ServicesSection />
      <DestinationsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}

export default HomeSections;
