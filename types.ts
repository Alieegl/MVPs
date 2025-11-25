export enum UserRole {
  DIRECTOR = 'DIRECTOR',
  COORDINATOR = 'COORDINATOR',
  EXTERNAL = 'EXTERNAL' // Compras, Jurídica, GH
}

export enum DocStatus {
  DRAFT = 'Borrador',
  PENDING_SIG = 'Pendiente Firma',
  SIGNED = 'Firmado',
  REJECTED = 'Rechazado',
  ARCHIVED = 'Archivado'
}

export enum DocType {
  CONTRACT = 'Contrato',
  REPORT = 'Informe',
  REQ = 'Requerimiento',
  ACT = 'Acta',
  FINANCE = 'Soporte Financiero'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  area?: string;
  avatar: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: DocType;
  status: DocStatus;
  version: number;
  uploadedBy: string;
  uploadDate: string;
  dueDate: string; // YYYY-MM-DD
  assignedTo?: string; // ID of user who needs to sign
  url: string; // Mock URL
  comments: Comment[];
  history: { action: string; date: string; user: string }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Activo' | 'Cerrado' | 'Pausado';
  progress: number;
}