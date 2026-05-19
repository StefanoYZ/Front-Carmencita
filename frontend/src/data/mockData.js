export const dashboardStats = [
  { label: 'Encomiendas registradas', value: 128, trend: '+12%' },
  { label: 'Boletas emitidas', value: 84, trend: '+8%' },
  { label: 'Clientes registrados', value: 46, trend: '+5%' },
  { label: 'Eficiencia de carga', value: '87%', trend: '+3%' },
];

export const clientesMock = [
  { id: 1, nombre: 'Mariana Torres', documento: '42891322', telefono: '987 321 654', ciudad: 'Lima' },
  { id: 2, nombre: 'Distribuciones Alto Sur', documento: '20601823491', telefono: '945 110 332', ciudad: 'Arequipa' },
  { id: 3, nombre: 'Javier Rojas', documento: '73194502', telefono: '956 782 441', ciudad: 'Cusco' },
];

export const encomiendasMock = [
  { id: 'ENC-001', remitente: 'Mariana Torres', destinatario: 'Luis Vera', destino: 'Cusco', peso: 12, estado: 'En transito' },
  { id: 'ENC-002', remitente: 'Carlos Meza', destinatario: 'Ana Ruiz', destino: 'Arequipa', peso: 6.5, estado: 'Registrada' },
  { id: 'ENC-003', remitente: 'Textiles Misti', destinatario: 'Rosa Paredes', destino: 'Puno', peso: 22, estado: 'Entregada' },
];

export const paquetesMock = [
  { id: 'PK-101', descripcion: 'Caja repuestos', peso: 14, volumen: '0.12 m3', prioridad: 'Alta' },
  { id: 'PK-102', descripcion: 'Documentos', peso: 1.2, volumen: '0.01 m3', prioridad: 'Media' },
  { id: 'PK-103', descripcion: 'Equipo electronico', peso: 8, volumen: '0.08 m3', prioridad: 'Alta' },
  { id: 'PK-104', descripcion: 'Mercaderia surtida', peso: 31, volumen: '0.25 m3', prioridad: 'Normal' },
];

// export const ciudadanoMock = {
//   dni: '74185296',
//   nombres: 'Lucia Andrea',
//   apellidos: 'Quispe Salazar',
//   ubigeo: '150101',
//   estado: 'Activo',
// };
