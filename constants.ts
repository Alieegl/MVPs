import { DocStatus, DocType, Document, Project, User, UserRole } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Carlos Director', role: UserRole.DIRECTOR, avatar: 'https://picsum.photos/id/1005/50/50' },
  { id: 'u2', name: 'Ana Coordinadora', role: UserRole.COORDINATOR, avatar: 'https://picsum.photos/id/1011/50/50' },
  { id: 'u3', name: 'Luis Jurídica', role: UserRole.EXTERNAL, area: 'Jurídica', avatar: 'https://picsum.photos/id/1025/50/50' },
];

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Construcción Bloque H', description: 'Expansión de aulas ingeniería', status: 'Activo', progress: 65 },
  { id: 'p2', name: 'Investigación Rural 2024', description: 'Proyecto social en el oriente', status: 'Activo', progress: 30 },
  { id: 'p3', name: 'Dotación Laboratorios', description: 'Compra de equipos biomédicos', status: 'Pausado', progress: 10 },
];

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    projectId: 'p1',
    title: 'Contrato Civil de Obra 001',
    type: DocType.CONTRACT,
    status: DocStatus.PENDING_SIG,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: '2024-05-20',
    dueDate: '2024-05-25',
    assignedTo: 'u1', // Waiting for Director
    url: '#',
    comments: [],
    history: [{ action: 'Creado', date: '2024-05-20', user: 'Ana Coordinadora' }]
  },
  {
    id: 'd2',
    projectId: 'p1',
    title: 'Acta de Inicio',
    type: DocType.ACT,
    status: DocStatus.SIGNED,
    version: 2,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: '2024-05-15',
    dueDate: '2024-05-18',
    url: '#',
    comments: [],
    history: [
      { action: 'Creado', date: '2024-05-15', user: 'Ana Coordinadora' },
      { action: 'Firmado', date: '2024-05-16', user: 'Carlos Director' }
    ]
  },
  {
    id: 'd3',
    projectId: 'p2',
    title: 'Informe Avance Mayo',
    type: DocType.REPORT,
    status: DocStatus.DRAFT,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: '2024-05-21',
    dueDate: '2024-05-30',
    url: '#',
    comments: [],
    history: [{ action: 'Borrador creado', date: '2024-05-21', user: 'Ana Coordinadora' }]
  },
  {
    id: 'd4',
    projectId: 'p3',
    title: 'Cotización Equipos',
    type: DocType.FINANCE,
    status: DocStatus.PENDING_SIG,
    version: 1,
    uploadedBy: 'Ana Coordinadora',
    uploadDate: '2024-05-10',
    dueDate: '2024-05-12', // Overdue
    assignedTo: 'u3', // Juridica/External
    url: '#',
    comments: [{ id: 'c1', userId: 'u1', userName: 'Carlos Director', text: 'Revisar montos antes de firmar.', date: '2024-05-11' }],
    history: [{ action: 'Enviado a Jurídica', date: '2024-05-10', user: 'Carlos Director' }]
  }
];