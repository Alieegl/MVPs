import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Bell, 
  Search, 
  Menu, 
  Plus, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  AlertTriangle,
  FileSignature,
  Bot,
  X,
  User as UserIcon,
  UploadCloud,
  File,
  Briefcase,
  Scale,
  ShoppingCart,
  Users,
  Folder,
  BarChart2,
  ExternalLink,
  ChevronLeft,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertOctagon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

import { USERS, PROJECTS, INITIAL_DOCUMENTS } from './constants';
import { User, Project, Document, UserRole, DocStatus, DocType, Department, DocFolder } from './types';

// --- UTILS ---

const getStatusColor = (status: DocStatus) => {
  switch (status) {
    case DocStatus.SIGNED: return 'bg-green-100 text-green-800 border-green-200';
    case DocStatus.PENDING_SIG: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; 
    case DocStatus.IN_REVIEW_LEGAL: return 'bg-purple-100 text-purple-800 border-purple-200';
    case DocStatus.IN_REVIEW_FINANCE: return 'bg-blue-100 text-blue-800 border-blue-200';
    case DocStatus.IN_REVIEW_HR: return 'bg-pink-100 text-pink-800 border-pink-200';
    case DocStatus.REJECTED: return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDepartmentIcon = (dept: Department) => {
  switch (dept) {
    case 'Jurídica': return <Scale size={16} />;
    case 'Compras': return <ShoppingCart size={16} />;
    case 'Gestión Humana': return <Users size={16} />;
    case 'Dirección': return <Briefcase size={16} />;
    default: return <FolderOpen size={16} />;
  }
};

const getDaysLate = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  // Reset hours to compare only dates
  today.setHours(0,0,0,0);
  due.setHours(0,0,0,0);
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays > 0 ? diffDays : 0;
};

// --- COMPONENTS ---

const ToastContainer = ({ toasts, removeToast }: { toasts: {id: number, msg: string, type: 'success' | 'error' | 'info'}[], removeToast: (id: number) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`
          min-w-[300px] p-4 rounded shadow-lg flex items-center justify-between animate-fade-in-down border-l-4
          ${t.type === 'success' ? 'bg-white border-uco-green text-uco-green' : 
            t.type === 'error' ? 'bg-white border-red-600 text-red-800' : 'bg-white border-uco-blue text-uco-blue'}
        `}>
          <span className="font-brand font-medium text-sm">{t.msg}</span>
          <button onClick={() => removeToast(t.id)} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
        </div>
      ))}
    </div>
  );
};

// Document Viewer Modal
const DocumentViewerModal = ({ isOpen, onClose, doc, project, onSign }: any) => {
  if (!isOpen || !doc) return null;

  const daysLate = getDaysLate(doc.dueDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-uco-blue text-white p-4 rounded-t-lg flex justify-between items-center shadow-md">
           <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded">
               <FileText size={24} />
             </div>
             <div>
               <h3 className="font-brand font-bold text-lg leading-tight">{doc.title}</h3>
               <p className="text-xs text-blue-200 font-mono">{project?.code} • {doc.version > 1 ? `Versión ${doc.version}` : 'Versión Original'}</p>
             </div>
           </div>
           <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition"><X size={24}/></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
           {/* Mock PDF Viewer */}
           <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center">
              <div className="bg-white shadow-lg w-full max-w-2xl min-h-[800px] p-12 border border-gray-200 relative">
                 {/* Watermark */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Escudo_UCO.png/480px-Escudo_UCO.png" alt="Watermark" className="w-96 grayscale"/> 
                 </div>
                 
                 {/* Content Simulation */}
                 <div className="space-y-6">
                    <div className="flex justify-between items-end border-b-2 border-uco-green pb-4 mb-8">
                       <h1 className="text-3xl font-brand font-black text-gray-800 uppercase tracking-tight">Universidad Católica<br/><span className="text-uco-green">de Oriente</span></h1>
                       <div className="text-right text-xs text-gray-500">
                          <p>Fecha: {doc.uploadDate}</p>
                          <p>Radicado: {doc.id.toUpperCase()}</p>
                       </div>
                    </div>

                    <h2 className="text-center font-bold text-xl uppercase mt-10 mb-6">{doc.type}</h2>
                    
                    <p className="text-justify text-gray-700 leading-loose">
                       Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                       Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p className="text-justify text-gray-700 leading-loose">
                       Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                       Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    
                    {/* Signatures Simulation */}
                    <div className="mt-20 pt-10 grid grid-cols-2 gap-20">
                       <div className="border-t border-gray-400 pt-2 text-center">
                          <p className="font-bold text-gray-800">{doc.uploadedBy}</p>
                          <p className="text-xs text-gray-500 uppercase">Solicitante</p>
                       </div>
                       {doc.status === 'Firmado' && (
                          <div className="border-t border-gray-400 pt-2 text-center relative">
                             <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-uco-green opacity-80 rotate-[-15deg] border-4 border-uco-green px-4 py-1 rounded font-black text-xl">FIRMADO</div>
                             <p className="font-bold text-gray-800">Carlos Director</p>
                             <p className="text-xs text-gray-500 uppercase">Director de Proyectos</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Sidebar Actions */}
           <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b">
                 <h4 className="font-bold text-gray-700 mb-2">Estado Actual</h4>
                 <div className={`inline-block px-3 py-1 rounded text-sm font-bold border ${getStatusColor(doc.status)}`}>{doc.status}</div>
                 
                 <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Vencimiento:</span>
                       <span className={`font-medium ${daysLate > 0 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>{doc.dueDate}</span>
                    </div>
                    {daysLate > 0 && (
                      <div className="bg-red-50 border border-red-100 text-red-600 p-2 rounded text-xs font-bold text-center">
                         ¡{daysLate} días de retraso!
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Carpeta:</span>
                       <span className="font-medium text-gray-800">{doc.folder}</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                 <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Clock size={16}/> Historial</h4>
                 <div className="space-y-4 relative pl-2 border-l-2 border-gray-100 ml-1">
                    {doc.history.map((h: any, i: number) => (
                       <div key={i} className="relative pl-4">
                          <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gray-200 border-2 border-white"></div>
                          <p className="text-sm font-bold text-gray-800">{h.action}</p>
                          <p className="text-xs text-gray-500">{h.date} • {h.user}</p>
                          {h.detail && <p className="text-xs bg-yellow-50 p-2 mt-1 rounded text-gray-600 italic border border-yellow-100">"{h.detail}"</p>}
                       </div>
                    ))}
                 </div>
              </div>

              <div className="p-4 border-t bg-gray-50">
                 {onSign && (
                   <div className="space-y-2">
                      <button onClick={onSign} className="w-full bg-uco-green text-white py-3 rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center justify-center gap-2">
                         <FileSignature size={20}/> 
                         {doc.status === DocStatus.PENDING_SIG ? 'Firmar Digitalmente' : 'Aprobar Revisión'}
                      </button>
                      <button className="w-full bg-white text-red-600 border border-red-200 py-2 rounded-lg font-bold hover:bg-red-50 transition">
                         Rechazar / Devolver
                      </button>
                   </div>
                 )}
                 {!onSign && (
                   <button className="w-full bg-uco-blue text-white py-2 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2">
                      <ExternalLink size={18}/> Descargar Original
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Power BI Modal
const PowerBIModal = ({ isOpen, onClose, url }: { isOpen: boolean, onClose: () => void, url: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col relative animate-scale-up">
        <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-uco-yellow flex items-center gap-2">
          <span className="text-sm font-bold">Cerrar</span> <XCircle size={32}/>
        </button>
        <div className="bg-uco-green text-white p-4 rounded-t-lg flex justify-between items-center">
           <h3 className="font-brand font-bold text-lg flex items-center gap-2">
             <BarChart2 /> Tablero de Control de Proyecto
           </h3>
           <div className="bg-white/20 px-3 py-1 rounded text-xs">Vista de Solo Lectura</div>
        </div>
        <div className="flex-1 bg-gray-100 flex items-center justify-center relative overflow-hidden">
           {/* Placeholder for iframe */}
           <div className="text-center p-10">
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart2 size={40} />
              </div>
              <h4 className="font-bold text-uco-blue text-xl mb-2">Simulación de Power BI</h4>
              <p className="text-gray-500 max-w-md mx-auto">
                 Aquí se cargaría el iframe del reporte público de Power BI.
                 <br/><br/>
                 URL configurada: <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{url}</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

// Upload Modal
const UploadModal = ({ isOpen, onClose, projects, currentUser, onUpload }: any) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [folder, setFolder] = useState<DocFolder>('EJECUCION');
  const [type, setType] = useState<DocType>(DocType.REPORT);
  const [dueDate, setDueDate] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title || !projectId || !dueDate || !selectedFile) return;
    
    // Auto-assign Logic
    let assignedDept: Department = 'Dirección';
    let initialStatus = DocStatus.PENDING_SIG;
    
    if (type === DocType.CONTRACT) {
      initialStatus = DocStatus.IN_REVIEW_LEGAL;
      assignedDept = 'Jurídica';
    } else if (type === DocType.OFFER) {
      initialStatus = DocStatus.IN_REVIEW_FINANCE;
      assignedDept = 'Compras';
    }

    onUpload({
      title,
      projectId,
      type,
      folder,
      dueDate,
      status: initialStatus,
      assignedToDepartment: assignedDept,
      uploadedBy: currentUser.name,
      url: '#'
    });
    
    setTitle('');
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up border-t-4 border-uco-green">
        <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
          <h3 className="font-brand font-bold text-lg text-uco-green flex items-center gap-2">
            <UploadCloud size={20}/> Radicar Documento
          </h3>
          <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded text-gray-600"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* File Zone */}
          <div className={`border-2 border-dashed rounded p-8 text-center transition-colors cursor-pointer ${selectedFile ? 'bg-green-50 border-uco-green' : 'border-gray-300 hover:border-uco-green'}`}
            onClick={() => !selectedFile && document.getElementById('fileInput')?.click()}
          >
            <input id="fileInput" type="file" className="hidden" onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFile(e.target.files[0]);
                if(!title) setTitle(e.target.files[0].name.split('.')[0]);
              }
            }} />
            {selectedFile ? (
              <div className="text-uco-green">
                <CheckCircle size={32} className="mx-auto mb-2" />
                <p className="font-bold">{selectedFile.name}</p>
                <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-red-600 text-xs mt-2 hover:underline">Cambiar archivo</button>
              </div>
            ) : (
              <div className="text-gray-500">
                <UploadCloud size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="font-medium">Clic para seleccionar archivo</p>
                <p className="text-xs">PDF, DOCX, XLSX (Max 25MB)</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none" placeholder="Ej: Contrato de Obra No. 123" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proyecto</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none bg-white">
                {projects.map((p:any) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Carpeta</label>
              <select value={folder} onChange={(e) => setFolder(e.target.value as DocFolder)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none bg-white">
                <option value="PLANEACION">PLANEACION</option>
                <option value="CONTRACTUAL - INICIO">CONTRACTUAL - INICIO</option>
                <option value="EJECUCION">EJECUCION</option>
                <option value="CIERRE">CIERRE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as DocType)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none bg-white">
                {Object.values(DocType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vencimiento</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
          <button onClick={handleSubmit} disabled={!selectedFile || !title} className="bg-uco-green text-white px-6 py-2 rounded font-bold hover:bg-green-800 disabled:opacity-50 transition">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar
const Sidebar = ({ currentView, setCurrentView, currentUser, isOpen, onClose }: any) => {
  const menuItems = [
    { id: 'DASHBOARD', icon: <LayoutDashboard size={20} />, label: 'Inicio' },
    { id: 'PROJECTS', icon: <FolderOpen size={20} />, label: 'Proyectos' },
    { id: 'DOCUMENTS', icon: <FileText size={20} />, label: 'Repositorio' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose}></div>}
      <div className={`fixed left-0 top-0 h-screen bg-uco-green text-white w-64 shadow-2xl z-30 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-green-700 bg-green-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-uco-green rounded flex items-center justify-center font-brand font-black text-xl shadow-lg">UCO</div>
            <div>
              <h1 className="font-brand font-bold text-sm leading-tight text-white">Gestión<br/>Documental</h1>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-white"><X size={24}/></button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentView(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === item.id || (item.id === 'PROJECTS' && currentView === 'PROJECT_DETAIL') ? 'bg-uco-yellow text-uco-blue font-bold shadow-lg transform translate-x-1' : 'hover:bg-white/10 text-white/90'}`}
            >
              {item.icon} <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-black/10">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white/40" />
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate text-white">{currentUser.name}</p>
              <div className="flex items-center gap-1 text-xs text-green-100">
                 {getDepartmentIcon(currentUser.department)}
                 <span className="truncate">{currentUser.department}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- MAIN APP ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  
  // Selection State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DocFolder | null>(null);
  
  // Viewer State
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  
  // UI State
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isPowerBIOpen, setPowerBIOpen] = useState(false);
  const [isMonitorOpen, setMonitorOpen] = useState(false); // Monitor de otras áreas
  const [toasts, setToasts] = useState<any[]>([]);

  // Helpers
  const addToast = (msg: string, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type: type as any }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const hasAccessToDoc = (doc: Document) => {
    if (currentUser.role === UserRole.DIRECTOR || currentUser.role === UserRole.COORDINATOR) return true;
    return doc.assignedToDepartment === currentUser.department;
  };

  const isPendingForMe = (doc: Document) => {
     if (currentUser.role === UserRole.DIRECTOR) return doc.status === DocStatus.PENDING_SIG;
     return doc.assignedToDepartment === currentUser.department && doc.status.includes('En Rev');
  };

  // Actions
  const handleSign = () => {
     if(!viewingDoc) return;
     const newStatus = viewingDoc.status === DocStatus.PENDING_SIG ? DocStatus.SIGNED : DocStatus.PENDING_SIG;
     
     setDocuments(prev => prev.map(d => d.id === viewingDoc.id ? {
        ...d,
        status: newStatus,
        history: [...d.history, { action: 'Firmado/Aprobado', date: new Date().toISOString().split('T')[0], user: currentUser.name }]
     } : d));
     
     addToast(viewingDoc.status === DocStatus.PENDING_SIG ? 'Documento Firmado Exitosamente' : 'Documento Aprobado y Enviado', 'success');
     setViewingDoc(null);
  };

  // Renderers
  const renderDashboard = () => {
    const myQueue = documents.filter(d => isPendingForMe(d));
    const pendingCount = myQueue.length;
    
    // Stats for other areas (Director/Coordinator view)
    const areaStats = {
       Juridica: documents.filter(d => d.status === DocStatus.IN_REVIEW_LEGAL),
       Compras: documents.filter(d => d.status === DocStatus.IN_REVIEW_FINANCE),
       GH: documents.filter(d => d.status === DocStatus.IN_REVIEW_HR)
    };

    return (
      <div className="space-y-6 animate-fade-in pb-20">
         <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 pb-6">
            <div>
               <h2 className="text-2xl md:text-3xl font-brand font-bold text-uco-blue">Hola, {currentUser.name.split(' ')[0]}</h2>
               <p className="text-gray-500 text-sm">
                  {currentUser.role === UserRole.DIRECTOR ? 'Este es el resumen ejecutivo de tu gestión.' : 'Panel de control operativo.'}
               </p>
            </div>
            {currentUser.role === UserRole.COORDINATOR && (
              <button onClick={() => setUploadOpen(true)} className="bg-uco-green text-white px-5 py-2.5 rounded shadow hover:bg-green-700 transition flex items-center gap-2 font-bold text-sm">
                 <Plus size={18}/> Nuevo Documento
              </button>
            )}
         </header>

         {/* Monitoring Section (Visible for Director/Coord) - EXPANDABLE */}
         {(currentUser.role === UserRole.DIRECTOR || currentUser.role === UserRole.COORDINATOR) && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
               <button onClick={() => setMonitorOpen(!isMonitorOpen)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex items-center gap-2 text-uco-blue font-bold">
                     <AlertOctagon size={20}/> Monitor de Procesos Externos
                  </div>
                  {isMonitorOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
               </button>
               
               {isMonitorOpen && (
                 <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200">
                     <div className="bg-purple-50 p-4 rounded border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                           <div className="text-purple-600 font-bold flex items-center gap-2"><Scale size={18}/> Jurídica</div>
                           <span className="bg-white text-purple-800 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">{areaStats.Juridica.length}</span>
                        </div>
                        <p className="text-xs text-gray-500">Documentos esperando revisión legal.</p>
                     </div>
                     
                     <div className="bg-blue-50 p-4 rounded border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                           <div className="text-blue-600 font-bold flex items-center gap-2"><ShoppingCart size={18}/> Compras</div>
                           <span className="bg-white text-blue-800 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">{areaStats.Compras.length}</span>
                        </div>
                        <p className="text-xs text-gray-500">Documentos en validación financiera.</p>
                     </div>

                     <div className="bg-pink-50 p-4 rounded border border-pink-100">
                        <div className="flex items-center justify-between mb-2">
                           <div className="text-pink-600 font-bold flex items-center gap-2"><Users size={18}/> G. Humana</div>
                           <span className="bg-white text-pink-800 px-2 py-0.5 rounded text-xs font-bold border border-pink-200">{areaStats.GH.length}</span>
                        </div>
                        <p className="text-xs text-gray-500">Contratos en gestión de personal.</p>
                     </div>
                 </div>
               )}
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task List - NOW CARDS */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="font-brand font-bold text-uco-green text-lg flex items-center gap-2">
                     <AlertTriangle size={20}/> {currentUser.role === UserRole.DIRECTOR ? 'Mis Firmas Pendientes' : 'Mis Revisiones Pendientes'} ({pendingCount})
                  </h3>
               </div>
               
               {myQueue.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                     {myQueue.map(doc => {
                        const daysLate = getDaysLate(doc.dueDate);
                        return (
                           <div key={doc.id} onClick={() => setViewingDoc(doc)} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-l-uco-yellow border border-gray-100 hover:shadow-md hover:translate-x-1 transition cursor-pointer group relative">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h4 className="font-brand font-bold text-gray-800 text-lg group-hover:text-uco-blue">{doc.title}</h4>
                                    <p className="text-sm text-gray-500 mb-1">{PROJECTS.find(p => p.id === doc.projectId)?.name} • {doc.folder}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                       <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${getStatusColor(doc.status)}`}>
                                          {doc.status}
                                       </span>
                                       <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                          <Clock size={14}/> Vencimiento: {doc.dueDate}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    {daysLate > 0 ? (
                                       <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-xs flex items-center gap-1 border border-red-200 animate-pulse">
                                          <AlertOctagon size={14}/> {daysLate} días retraso
                                       </div>
                                    ) : (
                                       <div className="bg-green-50 text-green-700 px-3 py-1 rounded font-bold text-xs border border-green-200">
                                          En tiempo
                                       </div>
                                    )}
                                    <div className="mt-4 p-2 bg-gray-100 rounded-full inline-flex text-gray-400 group-hover:bg-uco-yellow group-hover:text-uco-blue transition">
                                       <FileSignature size={20}/>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <div className="bg-white p-12 rounded border border-gray-200 text-center">
                     <div className="w-16 h-16 bg-green-50 text-uco-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32}/>
                     </div>
                     <h4 className="font-bold text-gray-700">¡Todo al día!</h4>
                     <p className="text-sm text-gray-500">No tienes documentos pendientes de firma o revisión.</p>
                  </div>
               )}
            </div>

            {/* Quick Stats Column */}
            <div className="space-y-6">
                <div className="bg-white rounded shadow-sm border border-gray-100 p-6">
                  <h3 className="font-brand font-bold text-uco-blue mb-2">Resumen</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                          <span className="text-gray-600 text-sm">Total Documentos</span>
                          <span className="font-bold text-lg">{documents.length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                          <span className="text-green-600 text-sm font-bold">Firmados</span>
                          <span className="font-bold text-lg text-green-700">{documents.filter(d => d.status === DocStatus.SIGNED).length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-red-600 text-sm font-bold">Devueltos</span>
                          <span className="font-bold text-lg text-red-700">{documents.filter(d => d.status === DocStatus.REJECTED).length}</span>
                      </div>
                  </div>
                </div>
            </div>
         </div>
      </div>
    );
  };

  const renderProjectDetail = () => {
    const project = PROJECTS.find(p => p.id === selectedProjectId);
    const allProjDocs = documents.filter(d => d.projectId === selectedProjectId);
    // Para revisores, solo mostramos SUS documentos, para Director/Coord mostramos todos.
    const accessibleDocs = currentUser.role === UserRole.REVIEWER 
        ? allProjDocs.filter(d => d.assignedToDepartment === currentUser.department)
        : allProjDocs;

    const folders: DocFolder[] = ['PLANEACION', 'CONTRACTUAL - INICIO', 'EJECUCION', 'CIERRE'];
    const isReviewer = currentUser.role === UserRole.REVIEWER;

    return (
       <div className="animate-fade-in space-y-6 pb-20">
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <button onClick={() => { setSelectedFolder(null); setCurrentView('PROJECTS'); }} className="hover:text-uco-green flex items-center gap-1">Proyectos</button>
             <ChevronRight size={14}/>
             <span className="font-bold text-uco-blue">{project?.name}</span>
             {selectedFolder && (
               <>
                 <ChevronRight size={14}/>
                 <span className="font-bold text-gray-700">{selectedFolder}</span>
               </>
             )}
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm border-t-4 border-uco-green flex flex-col md:flex-row justify-between items-start gap-4">
             <div>
                <h2 className="text-2xl font-brand font-bold text-uco-blue mb-1">{project?.name}</h2>
                <div className="flex gap-2 mb-4">
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono border">{project?.code}</span>
                   <span className="bg-blue-50 text-uco-blue px-2 py-0.5 rounded text-xs border border-blue-100">{project?.departmentOwner}</span>
                </div>
                <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">{project?.description}</p>
             </div>
             
             {project?.powerBiUrl && (
                <button 
                  onClick={() => setPowerBIOpen(true)}
                  className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded shadow-sm hover:bg-yellow-100 transition flex items-center gap-2"
                >
                   <BarChart2 size={20}/>
                   <div className="text-left">
                     <p className="text-[10px] font-bold uppercase tracking-wide">Reporte en tiempo real</p>
                     <p className="font-bold text-sm leading-none">Ver Tablero de Gestión</p>
                   </div>
                </button>
             )}
          </div>

          {/* LOGIC BRANCH: Reviewers see Flat List, Director/Coord see Folders */}
          {isReviewer ? (
             <div className="space-y-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><AlertTriangle size={18} className="text-uco-yellow"/> Documentos para {currentUser.department}</h3>
                <div className="bg-white rounded shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {accessibleDocs.map(doc => (
                        <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center group transition">
                            <div className="flex items-center gap-3">
                                <FileText className="text-uco-blue" size={24}/>
                                <div>
                                    <p className="font-bold text-gray-800">{doc.title}</p>
                                    <p className="text-xs text-gray-500">Vence: {doc.dueDate}</p>
                                </div>
                            </div>
                            <button className="bg-uco-green text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-green-700">Revisar</button>
                        </div>
                    ))}
                    {accessibleDocs.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No tienes documentos pendientes en este proyecto.</div>
                    )}
                </div>
             </div>
          ) : (
             // DIRECTOR / COORDINATOR VIEW
             !selectedFolder ? (
               // FOLDER VIEW
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {folders.map(folderName => {
                    const count = accessibleDocs.filter(d => d.folder === folderName).length;
                    const hasPending = accessibleDocs.some(d => d.folder === folderName && d.status === DocStatus.PENDING_SIG);
                    const pendingCount = accessibleDocs.filter(d => d.folder === folderName && d.status === DocStatus.PENDING_SIG).length;
                    
                    return (
                      <div 
                         key={folderName} 
                         onClick={() => setSelectedFolder(folderName)}
                         className="bg-gray-800 text-white p-6 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer transition relative overflow-hidden group border border-gray-600 flex flex-col justify-between min-h-[140px]"
                       >
                         <div className="flex justify-between items-start">
                            <div className="bg-yellow-500/20 p-2.5 rounded text-uco-yellow group-hover:bg-uco-yellow group-hover:text-black transition-colors">
                               <Folder size={28} fill="currentColor"/>
                            </div>
                            {hasPending && (
                               <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                                  {pendingCount} Firmas Pendientes
                               </div>
                            )}
                         </div>
                         <div>
                           <h4 className="font-bold text-sm truncate uppercase tracking-wide mt-2">{folderName}</h4>
                           <p className="text-xs text-gray-400 mt-1">{count} documentos</p>
                         </div>
                      </div>
                    );
                 })}
               </div>
             ) : (
               // FILE LIST VIEW (Inside Folder)
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedFolder(null)} className="flex items-center gap-2 text-gray-600 hover:text-uco-green font-bold">
                       <ChevronLeft size={20}/> Volver a Carpetas
                    </button>
                    <span className="bg-gray-200 px-3 py-1 rounded text-xs font-bold text-gray-700">{selectedFolder}</span>
                  </div>

                  {/* URGENT / PENDING SECTION FOR DIRECTOR */}
                  {accessibleDocs.filter(d => d.folder === selectedFolder && isPendingForMe(d)).length > 0 && (
                     <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden mb-4">
                        <div className="p-3 bg-orange-100 flex items-center gap-2 text-orange-800 font-bold text-sm border-b border-orange-200">
                           <AlertTriangle size={16}/> Pendientes de Firma Prioritaria
                        </div>
                        <div className="divide-y divide-orange-100">
                           {accessibleDocs.filter(d => d.folder === selectedFolder && isPendingForMe(d)).map(doc => (
                              <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 hover:bg-orange-100/50 cursor-pointer flex justify-between items-center transition bg-white/50">
                                 <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 text-orange-600 p-2 rounded"><FileSignature size={20}/></div>
                                    <div>
                                       <p className="font-bold text-sm text-gray-800">{doc.title}</p>
                                       <p className="text-xs text-red-600 font-bold">Vencimiento: {doc.dueDate}</p>
                                    </div>
                                 </div>
                                 <button className="bg-uco-green text-white text-xs px-3 py-1 rounded shadow hover:bg-green-700 font-bold">Firmar Ahora</button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* ALL FILES SECTION */}
                  <div className="bg-white rounded shadow-sm border border-gray-100">
                     <div className="p-4 border-b bg-gray-50 font-brand font-bold text-uco-blue flex items-center gap-2">
                        <File size={18}/> Todos los Archivos
                     </div>
                     <div className="divide-y divide-gray-100">
                        {accessibleDocs.filter(d => d.folder === selectedFolder && !isPendingForMe(d)).map(doc => (
                           <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center group transition">
                              <div className="flex items-center gap-3">
                                 <div className="bg-gray-100 p-2 rounded text-gray-500 group-hover:text-uco-blue"><FileText size={20} /></div>
                                 <div>
                                    <p className="font-bold text-sm text-gray-800">{doc.title}</p>
                                    <p className="text-xs text-gray-500">{doc.type} • {doc.uploadDate} • Subido por: {doc.uploadedBy}</p>
                                 </div>
                              </div>
                              <span className={`px-2 py-0.5 text-[10px] rounded border ${getStatusColor(doc.status)}`}>{doc.status}</span>
                           </div>
                        ))}
                        {accessibleDocs.filter(d => d.folder === selectedFolder).length === 0 && (
                           <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                              <FolderOpen size={48} strokeWidth={1} className="mb-2 opacity-50"/>
                              <p>Carpeta vacía.</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
             )
          )}
       </div>
    );
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-gray-800">
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />
      
      {/* Modals */}
      <PowerBIModal isOpen={isPowerBIOpen} onClose={() => setPowerBIOpen(false)} url={PROJECTS.find(p => p.id === selectedProjectId)?.powerBiUrl || ''} />
      
      <DocumentViewerModal 
         isOpen={!!viewingDoc} 
         onClose={() => setViewingDoc(null)} 
         doc={viewingDoc} 
         project={PROJECTS.find(p => p.id === viewingDoc?.projectId)}
         onSign={viewingDoc && isPendingForMe(viewingDoc) ? handleSign : undefined}
      />

      <UploadModal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} projects={PROJECTS} currentUser={currentUser} onUpload={(d: any) => {
         const newDoc = { ...d, id: `d${Date.now()}`, version: 1, comments: [], history: [{ action: 'Radicado', date: new Date().toISOString().split('T')[0], user: currentUser.name }] };
         setDocuments(p => [newDoc, ...p]);
         setUploadOpen(false);
         addToast('Documento radicado exitosamente', 'success');
      }} />

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sticky top-0 z-20 border-b border-gray-200">
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600"><Menu/></button>
             <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1.5 w-64 border border-transparent focus-within:border-uco-green focus-within:bg-white transition">
                <Search size={16} className="text-gray-400 mr-2"/>
                <input type="text" placeholder="Buscar radicado..." className="bg-transparent text-sm outline-none w-full" />
             </div>
          </div>
          <div className="flex items-center gap-4">
            <select className="text-xs border rounded p-1 bg-gray-50 max-w-[150px] outline-none focus:border-uco-green" value={currentUser.id} onChange={(e) => {
               const u = USERS.find(us => us.id === e.target.value);
               if(u) { setCurrentUser(u); setCurrentView('DASHBOARD'); setSelectedProjectId(null); setSelectedFolder(null); }
            }}>
               {USERS.map(u => <option key={u.id} value={u.id}>{u.role === 'REVIEWER' ? `${u.name} (${u.department})` : u.name}</option>)}
            </select>
            <div className="w-8 h-8 rounded-full bg-uco-green text-white flex items-center justify-center font-bold text-xs shadow-sm border border-green-600">{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {currentView === 'DASHBOARD' && renderDashboard()}
          
          {currentView === 'PROJECTS' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 animate-fade-in">
                {PROJECTS.map(p => (
                   <div key={p.id} onClick={() => { setSelectedProjectId(p.id); setSelectedFolder(null); setCurrentView('PROJECT_DETAIL'); }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-uco-green hover:shadow-md cursor-pointer transition group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-uco-green opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between mb-4">
                         <div className="p-3 bg-green-50 text-uco-green rounded-lg group-hover:bg-uco-green group-hover:text-white transition-colors"><FolderOpen /></div>
                         <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded h-fit text-gray-600">{p.code}</span>
                      </div>
                      <h3 className="font-brand font-bold text-lg mb-1 text-uco-blue">{p.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                        <span>Progreso: {p.progress}%</span>
                        <ChevronRight size={16} className="text-uco-green"/>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {currentView === 'PROJECT_DETAIL' && renderProjectDetail()}
          
          {currentView === 'DOCUMENTS' && (
             <div className="bg-white rounded shadow-sm overflow-hidden pb-20 animate-fade-in">
                <div className="p-4 border-b bg-gray-50 font-brand font-bold text-uco-green">Repositorio General</div>
                {documents.filter(d => hasAccessToDoc(d)).map(doc => (
                   <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                         <div className="bg-gray-100 p-2 rounded text-gray-500 group-hover:text-uco-blue"><FileText size={20} /></div>
                         <div>
                            <p className="font-bold text-sm text-gray-800">{doc.title}</p>
                            <p className="text-xs text-gray-500">{doc.type} • {doc.uploadDate} • {doc.folder}</p>
                         </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] rounded border ${getStatusColor(doc.status)}`}>{doc.status}</span>
                   </div>
                ))}
             </div>
          )}
        </main>
      </div>
    </div>
  );
}