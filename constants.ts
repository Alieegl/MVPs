import { DocStatus, DocType, Document, Project, User, UserRole } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Carlos Director', role: UserRole.DIRECTOR, department: 'Dirección', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' },
  { id: 'u2', name: 'Ana Coordinadora', role: UserRole.COORDINATOR, department: 'Proyectos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
  { id: 'u3', name: 'Luis Jurídico', role: UserRole.REVIEWER, department: 'Jurídica', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis' },
  { id: 'u4', name: 'Marta Compras', role: UserRole.REVIEWER, department: 'Compras', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marta' },
  { id: 'u5', name: 'Pedro GH', role: UserRole.REVIEWER, department: 'Gestión Humana', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro' },
];

export const PROJECTS: Project[] = [
  { 
    id: 'p1', 
    code: 'INF-24-01', 
    name: 'Consultorio Sustentable', 
    description: 'Adecuación de espacios para consultoría ambiental y sostenibilidad.', 
    status: 'Activo', 
    progress: 65, 
    departmentOwner: 'Proyectos',
    powerBiUrl: 'https://app.powerbi.com/view?r=eyJrIjoiEXAMPLE' 
  },
  { 
    id: 'p2', 
    code: 'SOC-24-05', 
    name: 'Investigación Rural 2024', 
    description: 'Impacto social en el oriente antioqueño.', 
    status: 'Activo', 
    progress: 30, 
    departmentOwner: 'Proyectos' 
  },
  { 
    id: 'p3', 
    code: 'DOT-24-12', 
    name: 'Dotación Laboratorios', 
    description: 'Compra de equipos biomédicos importados.', 
    status: 'Pausado', 
    progress: 10, 
    departmentOwner: 'Compras' 
  },
];

// Generador de fechas relativas para simular retrasos
const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);
const twoWeeksAgo = new Date(today); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

const fmt = (d: Date) => d.toISOString().split('T')[0];

export const INITIAL_DOCUMENTS: Document[] = [
  // --- DIRECTOR PENDIENTES (Retrasados y Al día) ---
  {
    id: 'd1',
    projectId: 'p1',
    title: 'Aprobación Final Fase 1',
    type: DocType.ACT,
    folder: 'EJECUCION',
    status: DocStatus.PENDING_SIG,
    version: 2,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: fmt(lastWeek),
    dueDate: fmt(yesterday), // VENCIDO
    assignedToDepartment: 'Dirección', 
    url: '#',
    comments: [],
    history: [{ action: 'Revisado', date: fmt(lastWeek), user: 'Ana Coordinadora' }]
  },
  {
    id: 'd2',
    projectId: 'p2',
    title: 'Acta de Inicio - Rural',
    type: DocType.ACT,
    folder: 'CONTRACTUAL - INICIO',
    status: DocStatus.PENDING_SIG,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: fmt(today),
    dueDate: fmt(tomorrow), // A TIEMPO
    assignedToDepartment: 'Dirección',
    url: '#',
    comments: [],
    history: [{ action: 'Cargado', date: fmt(today), user: 'Ana Coordinadora' }]
  },

  // --- JURIDICA PENDIENTES ---
  {
    id: 'd3',
    projectId: 'p1',
    title: 'Contrato Obra Civil No. 004',
    type: DocType.CONTRACT,
    folder: 'CONTRACTUAL - INICIO',
    status: DocStatus.IN_REVIEW_LEGAL,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: fmt(twoWeeksAgo),
    dueDate: fmt(lastWeek), // MUY VENCIDO
    assignedToDepartment: 'Jurídica',
    url: '#',
    comments: [],
    history: [{ action: 'Envío a Jurídica', date: fmt(twoWeeksAgo), user: 'Ana Coordinadora' }]
  },
  {
    id: 'd4',
    projectId: 'p3',
    title: 'Convenio Marco Proveedores',
    type: DocType.CONTRACT,
    folder: 'PLANEACION',
    status: DocStatus.IN_REVIEW_LEGAL,
    version: 3,
    uploadedBy: 'Marta Compras',
    uploadDate: fmt(yesterday),
    dueDate: fmt(tomorrow),
    assignedToDepartment: 'Jurídica',
    url: '#',
    comments: [],
    history: [{ action: 'Ajustes realizados', date: fmt(yesterday), user: 'Marta Compras' }]
  },

  // --- COMPRAS PENDIENTES ---
  {
    id: 'd5',
    projectId: 'p3',
    title: 'Oferta Económica Equipos',
    type: DocType.OFFER,
    folder: 'PLANEACION',
    status: DocStatus.IN_REVIEW_FINANCE,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: fmt(lastWeek),
    dueDate: fmt(yesterday), // VENCIDO
    assignedToDepartment: 'Compras',
    url: '#',
    comments: [],
    history: [{ action: 'Solicitud Evaluación', date: fmt(lastWeek), user: 'Ana Coordinadora' }]
  },

  // --- GESTIÓN HUMANA PENDIENTES ---
  {
    id: 'd6',
    projectId: 'p2',
    title: 'Contratación Auxiliares Campo',
    type: DocType.REQ,
    folder: 'CONTRACTUAL - INICIO',
    status: DocStatus.IN_REVIEW_HR,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: fmt(today),
    dueDate: fmt(tomorrow),
    assignedToDepartment: 'Gestión Humana',
    url: '#',
    comments: [],
    history: [{ action: 'Requerimiento Personal', date: fmt(today), user: 'Ana Coordinadora' }]
  },

  // --- ARCHIVADOS / FIRMADOS ---
  {
    id: 'd7',
    projectId: 'p1',
    title: 'Estudios Previos Aprobados',
    type: DocType.REPORT,
    folder: 'PLANEACION',
    status: DocStatus.SIGNED,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: '2024-01-15',
    dueDate: '2024-01-20',
    url: '#',
    comments: [],
    history: [{ action: 'Firmado', date: '2024-01-18', user: 'Carlos Director' }]
  }
];