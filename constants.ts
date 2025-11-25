import { DocStatus, DocType, Document, Project, User, UserRole } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Carlos Director', role: UserRole.DIRECTOR, department: 'Dirección', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' },
  { id: 'u2', name: 'Ana Coordinadora', role: UserRole.COORDINATOR, department: 'Proyectos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
  { id: 'u3', name: 'Luis Jurídico', role: UserRole.REVIEWER, department: 'Jurídica', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis' },
  { id: 'u4', name: 'Marta Compras', role: UserRole.REVIEWER, department: 'Compras', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marta' },
  { id: 'u5', name: 'Pedro GH', role: UserRole.REVIEWER, department: 'Gestión Humana', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro' },
];

// --- GENERADOR DE DATOS MASIVOS ---

const DEPARTMENTS = ['Proyectos', 'Jurídica', 'Compras', 'Gestión Humana', 'Dirección'];
const FOLDERS = ['PLANEACION', 'CONTRACTUAL - INICIO', 'EJECUCION', 'CIERRE'];
const DOC_TYPES = Object.values(DocType);

const generateProjects = (count: number): Project[] => {
  return Array.from({ length: count }).map((_, i) => {
    const id = `p${i + 1}`;
    const code = `UCO-24-${(i + 1).toString().padStart(3, '0')}`;
    const depts = ['Infraestructura', 'Académico', 'Tecnología', 'Bienestar', 'Investigación'];
    const type = depts[i % depts.length];
    
    return {
      id,
      code,
      name: `${type}: Proyecto ${i + 1} de Mejoramiento`,
      description: `Ejecución de actividades relacionadas con el plan maestro de ${type.toLowerCase()} para el periodo 2024-2025.`,
      status: Math.random() > 0.8 ? 'Cerrado' : 'Activo',
      progress: Math.floor(Math.random() * 100),
      departmentOwner: 'Proyectos',
      powerBiUrl: i % 3 === 0 ? 'https://app.powerbi.com/view?r=mock' : undefined
    };
  });
};

const generateDocuments = (projects: Project[]): Document[] => {
  let docs: Document[] = [];
  let docIdCounter = 1;

  projects.forEach(p => {
    // 3 a 5 documentos por proyecto
    const numDocs = Math.floor(Math.random() * 3) + 3; 

    for (let j = 0; j < numDocs; j++) {
      const isLate = Math.random() > 0.7;
      const type = DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)];
      const folder = FOLDERS[Math.floor(Math.random() * FOLDERS.length)] as any;
      
      // Determinar estado y asignación
      let status = DocStatus.DRAFT;
      let assignedTo: any = 'Proyectos';
      const rand = Math.random();

      if (rand < 0.2) { status = DocStatus.PENDING_SIG; assignedTo = 'Dirección'; }
      else if (rand < 0.4) { status = DocStatus.SIGNED; assignedTo = 'Proyectos'; }
      else if (rand < 0.5) { status = DocStatus.IN_REVIEW_LEGAL; assignedTo = 'Jurídica'; }
      else if (rand < 0.6) { status = DocStatus.IN_REVIEW_FINANCE; assignedTo = 'Compras'; }
      else if (rand < 0.7) { status = DocStatus.IN_REVIEW_HR; assignedTo = 'Gestión Humana'; }
      else if (rand < 0.8) { status = DocStatus.REJECTED; assignedTo = 'Proyectos'; }
      
      // Fechas
      const today = new Date();
      const uploadDate = new Date(today);
      uploadDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      const dueDate = new Date(uploadDate);
      dueDate.setDate(dueDate.getDate() + 5); // 5 días para firmar
      
      // Si queremos que esté vencido y no está firmado
      if (isLate && status !== DocStatus.SIGNED && status !== DocStatus.REJECTED) {
         dueDate.setDate(today.getDate() - 2); 
      } else {
         dueDate.setDate(today.getDate() + 10);
      }

      docs.push({
        id: `d${docIdCounter++}`,
        projectId: p.id,
        title: `${type} - ${p.code} - Fase ${j+1}`,
        type: type as DocType,
        folder,
        status,
        version: status === DocStatus.REJECTED ? 2 : 1,
        uploadedBy: 'Ana Coordinadora',
        uploadDate: uploadDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        assignedToDepartment: assignedTo,
        url: '#',
        comments: [],
        history: [
          { action: 'Cargado', date: uploadDate.toISOString().split('T')[0], user: 'Ana Coordinadora' },
          ...(status === DocStatus.REJECTED ? [{ action: 'Devuelto', date: today.toISOString().split('T')[0], user: 'Carlos Director', detail: 'Falta firma del interventor en la página 3.' }] : []),
          ...(status === DocStatus.SIGNED ? [{ action: 'Firmado', date: today.toISOString().split('T')[0], user: 'Carlos Director' }] : [])
        ]
      });
    }
  });
  return docs;
};

export const PROJECTS: Project[] = generateProjects(20);
export const INITIAL_DOCUMENTS: Document[] = generateDocuments(PROJECTS);