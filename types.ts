export enum UserRole {
  DIRECTOR = 'DIRECTOR',
  COORDINATOR = 'COORDINATOR',
  REVIEWER = 'REVIEWER' // Nuevo rol general para áreas transversales
}

export type Department = 'Dirección' | 'Proyectos' | 'Jurídica' | 'Compras' | 'Gestión Humana' | 'Financiera';

export type DocFolder = 'PLANEACION' | 'CONTRACTUAL - INICIO' | 'EJECUCION' | 'CIERRE';

export enum DocStatus {
  DRAFT = 'Borrador',
  IN_REVIEW_LEGAL = 'En Rev. Jurídica',
  IN_REVIEW_FINANCE = 'En Rev. Compras',
  IN_REVIEW_HR = 'En Rev. GH',
  PENDING_SIG = 'Pendiente Firma', // Listo para el Director
  SIGNED = 'Firmado',
  REJECTED = 'Devuelto',
  ARCHIVED = 'Archivado'
}

export enum DocType {
  CONTRACT = 'Contrato',
  REPORT = 'Informe',
  REQ = 'Requerimiento',
  ACT = 'Acta',
  FINANCE = 'Soporte Financiero',
  OFFER = 'Oferta Proveedor'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: Department;
  avatar: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
  roleBadge?: string; // Para mostrar "Jurídica" al lado del comentario
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: DocType;
  folder: DocFolder; // Carpeta a la que pertenece
  status: DocStatus;
  version: number;
  uploadedBy: string;
  uploadDate: string;
  dueDate: string; // YYYY-MM-DD
  assignedToDepartment?: Department; // A qué área le toca la pelota
  currentAssigneeId?: string; // ID específico si se sabe
  url: string; // Mock URL
  comments: Comment[];
  history: { action: string; date: string; user: string; detail?: string }[];
}

export interface Project {
  id: string;
  code: string; // UCO-INF-001
  name: string;
  description: string;
  status: 'Activo' | 'Cerrado' | 'Pausado';
  progress: number;
  departmentOwner: Department;
  powerBiUrl?: string; // Link al tablero público
}