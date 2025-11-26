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
  AlertOctagon,
  MessageSquare,
  History,
  Filter,
  Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Importando desde la ruta relativa correcta (misma carpeta)
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

const getDaysInStatus = (history: any[]) => {
  if (!history || history.length === 0) return 0;
  const lastEvent = history[history.length - 1];
  const lastDate = new Date(lastEvent.date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDaysLate = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0,0,0,0);
  due.setHours(0,0,0,0);
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays > 0 ? diffDays : 0;
};

// --- COMPONENTS ---

const ToastContainer = ({ toasts, removeToast }: { toasts: {id: number, msg: string, type: 'success' | 'error' | 'info'}[], removeToast: (id: number) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
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

// Reject Modal Component
const RejectModal = ({ isOpen, onClose, onConfirm }: any) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-scale-up border-t-4 border-red-600">
        <div className="p-6">
          <h3 className="font-brand font-bold text-xl text-gray-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="text-red-600"/> Devolver Documento
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Por favor indica la razón por la cual estás devolviendo este documento. Esta nota quedará en el historial.
          </p>
          <textarea 
            className="w-full border border-gray-300 rounded p-3 text-sm focus:border-red-500 outline-none h-32"
            placeholder="Ej: Falta la firma del interventor en la página 3..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>
        <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancelar</button>
          <button 
            onClick={() => { if(reason) onConfirm(reason); }}
            disabled={!reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Devolución
          </button>
        </div>
      </div>
    </div>
  );
};

// Document Viewer Modal
const DocumentViewerModal = ({ isOpen, onClose, doc, project, onSign, onReject }: any) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  
  if (!isOpen || !doc) return null;

  const daysLate = getDaysLate(doc.dueDate);
  const daysInStatus = getDaysInStatus(doc.history);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-uco-blue text-white p-4 rounded-t-lg flex justify-between items-center shadow-md">
           <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded">
               <FileText size={24} />
             </div>
             <div>
               <h3 className="font-brand font-bold text-lg leading-tight">{doc.title}</h3>
               <p className="text-xs text-blue-200 font-mono">{project?.code} • Versión {doc.version}</p>
             </div>
           </div>
           <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition"><X size={24}/></button>
        </div>

        <div className="flex-1 flex overflow-hidden">
           {/* Mock PDF Viewer */}
           <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex justify-center">
              <div className="bg-white shadow-lg w-full max-w-3xl min-h-[800px] p-12 border border-gray-200 relative">
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
                       Este documento certifica que el proyecto <strong>{project?.name}</strong> se encuentra en fase de ejecución acorde al plan estratégico.
                       Todas las partes interesadas han revisado los componentes técnicos, financieros y legales.
                    </p>
                    <p className="text-justify text-gray-700 leading-loose">
                       Se adjuntan los anexos correspondientes a la fase actual. La validación de este documento permite la continuidad de los procesos de contratación y desembolso.
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
           <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10">
              {/* Sidebar Tabs */}
              <div className="flex border-b">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'info' ? 'border-uco-green text-uco-green bg-green-50' : 'border-transparent text-gray-500'}`}
                >
                  Información
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'history' ? 'border-uco-green text-uco-green bg-green-50' : 'border-transparent text-gray-500'}`}
                >
                  Historial y Notas
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                 {activeTab === 'info' ? (
                   <div className="space-y-6">
                      <div>
                         <h4 className="font-bold text-gray-700 mb-2">Estado Actual</h4>
                         <div className="group relative inline-block">
                           <div className={`inline-block px-3 py-1 rounded text-sm font-bold border cursor-help ${getStatusColor(doc.status)}`}>
                             {doc.status}
                           </div>
                           <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-48 z-20">
                              Lleva {daysInStatus} días en este estado.
                           </div>
                         </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-4 border border-gray-100 space-y-3">
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Vencimiento:</span>
                            <span className={`font-medium ${daysLate > 0 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>{doc.dueDate}</span>
                         </div>
                         {daysLate > 0 && (
                           <div className="bg-red-50 border border-red-100 text-red-600 p-2 rounded text-xs font-bold text-center flex items-center justify-center gap-2">
                              <AlertOctagon size={14}/> ¡{daysLate} días de retraso!
                           </div>
                         )}
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Carpeta:</span>
                            <span className="font-medium text-gray-800">{doc.folder}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Responsable:</span>
                            <span className="font-medium text-gray-800">{doc.assignedToDepartment}</span>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 flex items-center gap-2"><History size={16}/> Trazabilidad</h4>
                      <div className="relative pl-2 border-l-2 border-gray-200 ml-1 space-y-6">
                         {[...doc.history].reverse().map((h: any, i: number) => (
                            <div key={i} className="relative pl-4">
                               <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${h.action.includes('Devuelto') ? 'bg-red-500' : 'bg-uco-green'}`}></div>
                               <p className="text-sm font-bold text-gray-800">{h.action}</p>
                               <p className="text-xs text-gray-500">{h.date} • {h.user}</p>
                               {h.detail && (
                                 <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700 italic relative">
                                    <MessageSquare size={12} className="absolute top-2 right-2 text-yellow-400"/>
                                    "{h.detail}"
                                 </div>
                               )}
                            </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t bg-gray-50">
                 {onSign ? (
                   <div className="space-y-2">
                      <button onClick={onSign} className="w-full bg-uco-green text-white py-3 rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center justify-center gap-2">
                         <FileSignature size={20}/> 
                         {doc.status === DocStatus.PENDING_SIG ? 'Firmar Digitalmente' : 'Aprobar Revisión'}
                      </button>
                      <button onClick={onReject} className="w-full bg-white text-red-600 border border-red-200 py-2 rounded-lg font-bold hover:bg-red-50 transition shadow-sm">
                         Rechazar / Devolver
                      </button>
                   </div>
                 ) : (
                   <button className="w-full bg-uco-blue text-white py-2 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow">
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [folder, setFolder] = useState<DocFolder>('EJECUCION');
  const [type, setType] = useState<DocType>(DocType.REPORT);
  const [dueDate, setDueDate] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title || !projectId || !dueDate || !selectedFile) return;
    let assignedDept: Department = 'Dirección';
    let initialStatus = DocStatus.PENDING_SIG;
    if (type === DocType.CONTRACT) { initialStatus = DocStatus.IN_REVIEW_LEGAL; assignedDept = 'Jurídica'; } 
    else if (type === DocType.OFFER) { initialStatus = DocStatus.IN_REVIEW_FINANCE; assignedDept = 'Compras'; }

    onUpload({
      title, projectId, type, folder, dueDate,
      status: initialStatus, assignedToDepartment: assignedDept, uploadedBy: currentUser.name, url: '#'
    });
    setTitle(''); setSelectedFile(null); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up border-t-4 border-uco-green">
        <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
          <h3 className="font-brand font-bold text-lg text-uco-green flex items-center gap-2"><UploadCloud size={20}/> Radicar Documento</h3>
          <button onClick={onClose} className="hover:bg-gray-200 p-1 rounded text-gray-600"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-6">
          <div className={`border-2 border-dashed rounded p-8 text-center transition-colors cursor-pointer ${selectedFile ? 'bg-green-50 border-uco-green' : 'border-gray-300 hover:border-uco-green'}`}
            onClick={() => !selectedFile && document.getElementById('fileInput')?.click()}
          >
            <input id="fileInput" type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { setSelectedFile(e.target.files[0]); if(!title) setTitle(e.target.files[0].name.split('.')[0]); } }} />
            {selectedFile ? (
              <div className="text-uco-green"><CheckCircle size={32} className="mx-auto mb-2" /><p className="font-bold">{selectedFile.name}</p><button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="text-red-600 text-xs mt-2 hover:underline">Cambiar archivo</button></div>
            ) : (
              <div className="text-gray-500"><UploadCloud size={32} className="mx-auto mb-2 text-gray-400" /><p className="font-medium">Clic para seleccionar archivo</p></div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proyecto</label><select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none bg-white">{projects.map((p:any) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Carpeta</label><select value={folder} onChange={(e) => setFolder(e.target.value as DocFolder)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none bg-white"><option value="PLANEACION">PLANEACION</option><option value="CONTRACTUAL - INICIO">CONTRACTUAL - INICIO</option><option value="EJECUCION">EJECUCION</option><option value="CIERRE">CIERRE</option></select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label><select value={type} onChange={(e) => setType(e.target.value as DocType)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none bg-white">{Object.values(DocType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vencimiento</label><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-uco-green outline-none" /></div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancelar</button><button onClick={handleSubmit} disabled={!selectedFile || !title} className="bg-uco-green text-white px-6 py-2 rounded font-bold hover:bg-green-800 disabled:opacity-50 transition">Guardar</button></div>
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
            <div><h1 className="font-brand font-bold text-sm leading-tight text-white">Gestión<br/>Documental</h1></div>
          </div>
          <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-white"><X size={24}/></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentView(item.id); onClose(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === item.id || (item.id === 'PROJECTS' && currentView === 'PROJECT_DETAIL') ? 'bg-uco-yellow text-uco-blue font-bold shadow-lg transform translate-x-1' : 'hover:bg-white/10 text-white/90'}`}>
              {item.icon} <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 bg-black/10">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white/40" />
            <div className="overflow-hidden"><p className="font-bold text-sm truncate text-white">{currentUser.name}</p><div className="flex items-center gap-1 text-xs text-green-100"><span className="truncate">{currentUser.department}</span></div></div>
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DocFolder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Modals
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isPowerBIOpen, setPowerBIOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  
  // Dashboard Filters
  const [dashboardFilter, setDashboardFilter] = useState<'ALL' | 'PENDING' | 'SIGNED' | 'REJECTED'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  const [toasts, setToasts] = useState<any[]>([]);

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

  const matchesSearch = (doc: Document) => {
     if (!searchTerm) return true;
     const term = searchTerm.toLowerCase();
     const project = PROJECTS.find(p => p.id === doc.projectId);
     return doc.title.toLowerCase().includes(term) || 
            (project?.name || '').toLowerCase().includes(term) || 
            (project?.code || '').toLowerCase().includes(term);
  };

  const handleSign = () => {
     if(!viewingDoc) return;
     const newStatus = viewingDoc.status === DocStatus.PENDING_SIG ? DocStatus.SIGNED : DocStatus.PENDING_SIG;
     setDocuments(prev => prev.map(d => d.id === viewingDoc.id ? {
        ...d, status: newStatus, history: [...d.history, { action: 'Firmado/Aprobado', date: new Date().toISOString().split('T')[0], user: currentUser.name }]
     } : d));
     addToast('Documento gestionado exitosamente', 'success');
     setViewingDoc(null);
  };

  const handleReject = (reason: string) => {
    if(!viewingDoc) return;
    setDocuments(prev => prev.map(d => d.id === viewingDoc.id ? {
      ...d, 
      status: DocStatus.REJECTED,
      version: d.version + 1, // Simulating version bump requirement
      history: [...d.history, { action: 'Devuelto', date: new Date().toISOString().split('T')[0], user: currentUser.name, detail: reason }]
    } : d));
    addToast('Documento devuelto al solicitante', 'error');
    setRejectModalOpen(false);
    setViewingDoc(null);
  };

  // Render Dashboard
  const renderDashboard = () => {
    // Calculo de KPIs globales (Visible para Director/Coord) o específicos (Reviewer)
    const accessibleDocs = documents.filter(d => hasAccessToDoc(d));
    
    // Configuración de Datos para el Gráfico según Rol
    let chartData = [];
    let chartTitle = "";

    if (currentUser.role === UserRole.DIRECTOR || currentUser.role === UserRole.COORDINATOR) {
        // Lógica Director: Estado Global de Gestión (Document Status)
        const countSigned = documents.filter(d => d.status === DocStatus.SIGNED).length;
        const countPendingSig = documents.filter(d => d.status === DocStatus.PENDING_SIG).length;
        const countInReview = documents.filter(d => d.status.includes('En Rev')).length;
        const countRejected = documents.filter(d => d.status === DocStatus.REJECTED).length;
        
        chartData = [
          { name: 'Firmados', value: countSigned, color: '#008B50' }, // Green UCO
          { name: 'En Trámite', value: countInReview, color: '#1D3475' }, // Blue
          { name: 'Por Firmar', value: countPendingSig, color: '#FFCA00' }, // Yellow UCO
          { name: 'Devueltos', value: countRejected, color: '#DC2626' }, // Red
        ].filter(i => i.value > 0);
        chartTitle = "Estado de Gestión Documental";
    } else {
        // Lógica Reviewer: Mi efectividad (Mis Pendientes vs Firmados/Devueltos)
        const myDeptDocs = documents.filter(d => d.assignedToDepartment === currentUser.department);
        const myPending = myDeptDocs.filter(d => d.status.includes('En Rev')).length;
        // Asignados que no están pendientes (fueron procesados o firmados por otros pasos)
        const totalAssigned = myDeptDocs.length;
        const processed = totalAssigned - myPending;

        chartData = [
            { name: 'Pendientes', value: myPending, color: '#FFCA00' }, // Yellow UCO
            { name: 'Gestionados', value: processed, color: '#008B50' }, // Green UCO
        ].filter(i => i.value > 0);
        chartTitle = `Gestión: ${currentUser.department}`;
    }


    const kpiTotal = accessibleDocs.length;
    const kpiPending = accessibleDocs.filter(d => isPendingForMe(d)).length;
    const kpiSigned = accessibleDocs.filter(d => d.status === DocStatus.SIGNED).length;
    const kpiRejected = accessibleDocs.filter(d => d.status === DocStatus.REJECTED).length;

    // Filter Logic
    let filteredList = accessibleDocs.filter(matchesSearch);

    // Apply Filters
    if (departmentFilter) {
      filteredList = filteredList.filter(d => {
         if (departmentFilter === 'Jurídica') return d.status === DocStatus.IN_REVIEW_LEGAL;
         if (departmentFilter === 'Compras') return d.status === DocStatus.IN_REVIEW_FINANCE;
         if (departmentFilter === 'Gestión Humana') return d.status === DocStatus.IN_REVIEW_HR;
         return true;
      });
    } else {
      // Only apply KPI filters if no department filter is active
      if (dashboardFilter === 'PENDING') filteredList = filteredList.filter(d => isPendingForMe(d));
      if (dashboardFilter === 'SIGNED') filteredList = filteredList.filter(d => d.status === DocStatus.SIGNED);
      if (dashboardFilter === 'REJECTED') filteredList = filteredList.filter(d => d.status === DocStatus.REJECTED);
    }

    return (
      <div className="space-y-8 animate-fade-in pb-20">
         <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
               <h2 className="text-2xl md:text-3xl font-brand font-bold text-uco-blue">Hola, {currentUser.name.split(' ')[0]}</h2>
               <p className="text-gray-500 text-sm">Resumen de gestión: <span className="font-bold text-uco-green">{departmentFilter ? `Filtro: ${departmentFilter}` : dashboardFilter}</span></p>
            </div>
            {currentUser.role === UserRole.COORDINATOR && (
              <button onClick={() => setUploadOpen(true)} className="bg-uco-green text-white px-5 py-2.5 rounded shadow hover:bg-green-700 transition flex items-center gap-2 font-bold text-sm">
                 <Plus size={18}/> Nuevo Documento
              </button>
            )}
         </header>

         {/* KPI CARDS (FILTERS) */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => { setDashboardFilter('ALL'); setDepartmentFilter(null); }} className={`p-4 rounded-lg border cursor-pointer transition shadow-sm ${dashboardFilter === 'ALL' && !departmentFilter ? 'bg-uco-blue text-white ring-2 ring-offset-2 ring-uco-blue' : 'bg-white hover:bg-gray-50'}`}>
               <p className="text-xs font-bold uppercase opacity-70 mb-1">Total Docs</p>
               <p className="text-3xl font-brand font-bold">{kpiTotal}</p>
            </div>
            <div onClick={() => { setDashboardFilter('PENDING'); setDepartmentFilter(null); }} className={`p-4 rounded-lg border cursor-pointer transition shadow-sm ${dashboardFilter === 'PENDING' && !departmentFilter ? 'bg-uco-yellow text-uco-blue ring-2 ring-offset-2 ring-uco-yellow' : 'bg-white hover:bg-gray-50'}`}>
               <div className="flex justify-between"><p className="text-xs font-bold uppercase opacity-70 mb-1">Mis Pendientes</p><AlertTriangle size={16}/></div>
               <p className="text-3xl font-brand font-bold">{kpiPending}</p>
            </div>
            <div onClick={() => { setDashboardFilter('SIGNED'); setDepartmentFilter(null); }} className={`p-4 rounded-lg border cursor-pointer transition shadow-sm ${dashboardFilter === 'SIGNED' && !departmentFilter ? 'bg-green-600 text-white ring-2 ring-offset-2 ring-green-600' : 'bg-white hover:bg-gray-50'}`}>
               <div className="flex justify-between"><p className="text-xs font-bold uppercase opacity-70 mb-1">Firmados</p><CheckCircle size={16}/></div>
               <p className="text-3xl font-brand font-bold">{kpiSigned}</p>
            </div>
            <div onClick={() => { setDashboardFilter('REJECTED'); setDepartmentFilter(null); }} className={`p-4 rounded-lg border cursor-pointer transition shadow-sm ${dashboardFilter === 'REJECTED' && !departmentFilter ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-red-600' : 'bg-white hover:bg-gray-50'}`}>
               <div className="flex justify-between"><p className="text-xs font-bold uppercase opacity-70 mb-1">Devueltos</p><XCircle size={16}/></div>
               <p className="text-3xl font-brand font-bold">{kpiRejected}</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
               <h3 className="font-brand font-bold text-gray-700 text-lg flex items-center gap-2 border-b pb-2">
                  <FileText size={20}/> 
                  {departmentFilter ? `Documentos en ${departmentFilter}` : 'Listado de Documentos'}
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{filteredList.length}</span>
                  {departmentFilter && (
                    <button onClick={() => setDepartmentFilter(null)} className="ml-auto text-xs text-red-600 hover:underline flex items-center gap-1">
                      <Trash2 size={12}/> Limpiar filtro
                    </button>
                  )}
               </h3>
               
               {/* List Content */}
               <div className="grid grid-cols-1 gap-3">
                 {filteredList.slice(0, 10).map(doc => { 
                    const daysLate = getDaysLate(doc.dueDate);
                    const timeInStatus = getDaysInStatus(doc.history);
                    return (
                       <div key={doc.id} onClick={() => setViewingDoc(doc)} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-uco-green hover:shadow-md transition cursor-pointer flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-full ${getStatusColor(doc.status)} bg-opacity-20`}>
                               {doc.status === DocStatus.PENDING_SIG ? <FileSignature size={20}/> : <FileText size={20}/>}
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-uco-blue">{doc.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                   <span className="bg-gray-100 px-1.5 py-0.5 rounded">{PROJECTS.find(p=>p.id===doc.projectId)?.code}</span>
                                   <span>• {doc.folder}</span>
                                   {daysLate > 0 && <span className="text-red-600 font-bold flex items-center gap-1"><AlertOctagon size={10}/> {daysLate} días tarde</span>}
                                </div>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <div className="group/tooltip relative">
                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${getStatusColor(doc.status)}`}>{doc.status}</span>
                                <div className="absolute right-0 bottom-full mb-1 hidden group-hover/tooltip:block bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                                   Hace {timeInStatus} días
                                </div>
                             </div>
                          </div>
                       </div>
                    );
                 })}
                 {filteredList.length === 0 && (
                   <div className="p-8 text-center text-gray-500 bg-white rounded border border-dashed">
                     {searchTerm ? 'No se encontraron documentos con ese criterio.' : 'No hay documentos en esta vista.'}
                   </div>
                 )}
               </div>
            </div>

            {/* Quick Monitor (Right Column) */}
            <div className="space-y-6">
               
                   <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Eye size={18}/> Monitor de Áreas</h4>
                      {(currentUser.role === UserRole.DIRECTOR || currentUser.role === UserRole.COORDINATOR) ? (
                         <>
                            <p className="text-xs text-gray-400 mb-3">Clic en un área para filtrar</p>
                            <div className="space-y-3">
                                <div onClick={() => setDepartmentFilter('Jurídica')} className={`flex justify-between items-center p-2 rounded text-sm cursor-pointer transition ${departmentFilter === 'Jurídica' ? 'bg-purple-100 ring-1 ring-purple-300' : 'bg-purple-50 hover:bg-purple-100'}`}>
                                    <span className="text-purple-700 font-bold">Jurídica</span>
                                    <span className="font-bold bg-white px-2 rounded text-purple-800 shadow-sm">{documents.filter(d => d.status === DocStatus.IN_REVIEW_LEGAL).length}</span>
                                </div>
                                <div onClick={() => setDepartmentFilter('Compras')} className={`flex justify-between items-center p-2 rounded text-sm cursor-pointer transition ${departmentFilter === 'Compras' ? 'bg-blue-100 ring-1 ring-blue-300' : 'bg-blue-50 hover:bg-blue-100'}`}>
                                    <span className="text-blue-700 font-bold">Compras</span>
                                    <span className="font-bold bg-white px-2 rounded text-blue-800 shadow-sm">{documents.filter(d => d.status === DocStatus.IN_REVIEW_FINANCE).length}</span>
                                </div>
                                <div onClick={() => setDepartmentFilter('Gestión Humana')} className={`flex justify-between items-center p-2 rounded text-sm cursor-pointer transition ${departmentFilter === 'Gestión Humana' ? 'bg-pink-100 ring-1 ring-pink-300' : 'bg-pink-50 hover:bg-pink-100'}`}>
                                    <span className="text-pink-700 font-bold">G. Humana</span>
                                    <span className="font-bold bg-white px-2 rounded text-pink-800 shadow-sm">{documents.filter(d => d.status === DocStatus.IN_REVIEW_HR).length}</span>
                                </div>
                            </div>
                         </>
                      ) : (
                         <div className="p-4 bg-gray-50 text-center rounded text-sm text-gray-500">
                             Solo visible para Dirección.
                         </div>
                      )}
                   </div>

                   {/* Distribution Chart - Dynamic based on Role */}
                   <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-64 flex flex-col">
                      <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm"><BarChart2 size={16}/> {chartTitle}</h4>
                      <div className="flex-1 w-full text-xs flex items-center justify-center">
                        {chartData.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie
                               data={chartData}
                               cx="50%"
                               cy="50%"
                               innerRadius={50}
                               outerRadius={70}
                               fill="#8884d8"
                               paddingAngle={5}
                               dataKey="value"
                             >
                               {chartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                               ))}
                             </Pie>
                             <RechartsTooltip />
                             <Legend layout="vertical" verticalAlign="bottom" align="center"/>
                           </PieChart>
                         </ResponsiveContainer>
                        ) : (
                           <div className="text-center text-gray-400">
                              <p>No hay datos suficientes para generar el gráfico.</p>
                           </div>
                        )}
                        
                      </div>
                   </div>
            </div>
         </div>
      </div>
    );
  };
  
  // (Render Project Detail and other sections remain similar, relying on updated components)
  const renderProjectDetail = () => {
    const project = PROJECTS.find(p => p.id === selectedProjectId);
    
    // Safety check in case project is not found
    if (!project) {
       return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <AlertTriangle size={48} className="mb-4 text-uco-yellow" />
             <h2 className="text-xl font-bold mb-2">Proyecto no encontrado</h2>
             <button onClick={() => setCurrentView('PROJECTS')} className="text-uco-green font-bold hover:underline">Volver a la lista</button>
          </div>
       );
    }

    const allProjDocs = documents.filter(d => d.projectId === selectedProjectId);
    const accessibleDocs = currentUser.role === UserRole.REVIEWER ? allProjDocs.filter(d => d.assignedToDepartment === currentUser.department) : allProjDocs;
    const folders: DocFolder[] = ['PLANEACION', 'CONTRACTUAL - INICIO', 'EJECUCION', 'CIERRE'];
    const isReviewer = currentUser.role === UserRole.REVIEWER;

    // Local filter inside project detail
    const filteredProjectDocs = accessibleDocs.filter(matchesSearch);

    return (
       <div className="animate-fade-in space-y-6 pb-20">
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <button onClick={() => { setSelectedFolder(null); setCurrentView('PROJECTS'); }} className="hover:text-uco-green flex items-center gap-1">Proyectos</button>
             <ChevronRight size={14}/>
             <span className="font-bold text-uco-blue">{project?.name}</span>
             {selectedFolder && <><ChevronRight size={14}/><span className="font-bold text-gray-700">{selectedFolder}</span></>}
          </div>
          
          <div className="bg-white p-6 rounded shadow-sm border-t-4 border-uco-green flex flex-col md:flex-row justify-between items-start gap-4">
             <div>
                <h2 className="text-2xl font-brand font-bold text-uco-blue mb-1">{project?.name}</h2>
                <div className="flex gap-2 mb-4"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono border">{project?.code}</span><span className="bg-blue-50 text-uco-blue px-2 py-0.5 rounded text-xs border border-blue-100">{project?.departmentOwner}</span></div>
                <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">{project?.description}</p>
             </div>
             {project?.powerBiUrl && (
                <button onClick={() => setPowerBIOpen(true)} className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded shadow-sm hover:bg-yellow-100 transition flex items-center gap-2">
                   <BarChart2 size={20}/>
                   <div className="text-left"><p className="text-[10px] font-bold uppercase tracking-wide">Reporte en tiempo real</p><p className="font-bold text-sm leading-none">Ver Tablero de Gestión</p></div>
                </button>
             )}
          </div>

          {isReviewer ? (
             <div className="space-y-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><AlertTriangle size={18} className="text-uco-yellow"/> Documentos para {currentUser.department}</h3>
                <div className="bg-white rounded shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {filteredProjectDocs.map(doc => (
                        <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center group transition">
                            <div className="flex items-center gap-3">
                                <FileText className="text-uco-blue" size={24}/>
                                <div><p className="font-bold text-gray-800">{doc.title}</p><p className="text-xs text-gray-500">Vence: {doc.dueDate}</p></div>
                            </div>
                            <button className="bg-uco-green text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-green-700">Revisar</button>
                        </div>
                    ))}
                    {filteredProjectDocs.length === 0 && <div className="p-8 text-center text-gray-500">No tienes documentos pendientes en este proyecto.</div>}
                </div>
             </div>
          ) : (
             !selectedFolder ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {folders.map(folderName => {
                    const count = filteredProjectDocs.filter(d => d.folder === folderName).length;
                    const pendingCount = filteredProjectDocs.filter(d => d.folder === folderName && d.status === DocStatus.PENDING_SIG).length;
                    return (
                      <div key={folderName} onClick={() => setSelectedFolder(folderName)} className="bg-gray-800 text-white p-6 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer transition relative overflow-hidden group border border-gray-600 flex flex-col justify-between min-h-[140px]">
                         <div className="flex justify-between items-start">
                            <div className="bg-yellow-500/20 p-2.5 rounded text-uco-yellow group-hover:bg-uco-yellow group-hover:text-black transition-colors"><Folder size={28} fill="currentColor"/></div>
                            {pendingCount > 0 && <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{pendingCount} Firmas</div>}
                         </div>
                         <div><h4 className="font-bold text-sm truncate uppercase tracking-wide mt-2">{folderName}</h4><p className="text-xs text-gray-400 mt-1">{count} documentos</p></div>
                      </div>
                    );
                 })}
               </div>
             ) : (
               <div className="space-y-6">
                  <div className="flex items-center justify-between"><button onClick={() => setSelectedFolder(null)} className="flex items-center gap-2 text-gray-600 hover:text-uco-green font-bold"><ChevronLeft size={20}/> Volver a Carpetas</button><span className="bg-gray-200 px-3 py-1 rounded text-xs font-bold text-gray-700">{selectedFolder}</span></div>
                  {filteredProjectDocs.filter(d => d.folder === selectedFolder && isPendingForMe(d)).length > 0 && (
                     <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden mb-4">
                        <div className="p-3 bg-orange-100 flex items-center gap-2 text-orange-800 font-bold text-sm border-b border-orange-200"><AlertTriangle size={16}/> Pendientes de Firma Prioritaria</div>
                        <div className="divide-y divide-orange-100">
                           {filteredProjectDocs.filter(d => d.folder === selectedFolder && isPendingForMe(d)).map(doc => (
                              <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 hover:bg-orange-100/50 cursor-pointer flex justify-between items-center transition bg-white/50">
                                 <div className="flex items-center gap-3"><div className="bg-orange-100 text-orange-600 p-2 rounded"><FileSignature size={20}/></div><div><p className="font-bold text-sm text-gray-800">{doc.title}</p><p className="text-xs text-red-600 font-bold">Vence: {doc.dueDate}</p></div></div><button className="bg-uco-green text-white text-xs px-3 py-1 rounded shadow hover:bg-green-700 font-bold">Firmar Ahora</button>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
                  <div className="bg-white rounded shadow-sm border border-gray-100">
                     <div className="p-4 border-b bg-gray-50 font-brand font-bold text-uco-blue flex items-center gap-2"><File size={18}/> Todos los Archivos</div>
                     <div className="divide-y divide-gray-100">
                        {filteredProjectDocs.filter(d => d.folder === selectedFolder && !isPendingForMe(d)).map(doc => (
                           <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center group transition">
                              <div className="flex items-center gap-3"><div className="bg-gray-100 p-2 rounded text-gray-500 group-hover:text-uco-blue"><FileText size={20} /></div><div><p className="font-bold text-sm text-gray-800">{doc.title}</p><p className="text-xs text-gray-500">{doc.type} • {doc.uploadDate} • {doc.uploadedBy}</p></div></div><span className={`px-2 py-0.5 text-[10px] rounded border ${getStatusColor(doc.status)}`}>{doc.status}</span>
                           </div>
                        ))}
                        {filteredProjectDocs.filter(d => d.folder === selectedFolder).length === 0 && <div className="p-10 text-center text-gray-400 flex flex-col items-center"><FolderOpen size={48} strokeWidth={1} className="mb-2 opacity-50"/><p>Carpeta vacía.</p></div>}
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
      <PowerBIModal isOpen={isPowerBIOpen} onClose={() => setPowerBIOpen(false)} url={PROJECTS.find(p => p.id === selectedProjectId)?.powerBiUrl || ''} />
      
      {/* Reject Modal */}
      <RejectModal isOpen={isRejectModalOpen} onClose={() => setRejectModalOpen(false)} onConfirm={handleReject} />
      
      <DocumentViewerModal 
         isOpen={!!viewingDoc} 
         onClose={() => setViewingDoc(null)} 
         doc={viewingDoc} 
         project={PROJECTS.find(p => p.id === viewingDoc?.projectId)}
         onSign={viewingDoc && isPendingForMe(viewingDoc) ? handleSign : undefined}
         onReject={viewingDoc && isPendingForMe(viewingDoc) ? () => setRejectModalOpen(true) : undefined}
      />
      
      <UploadModal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} projects={PROJECTS} currentUser={currentUser} onUpload={(d: any) => { const newDoc = { ...d, id: `d${Date.now()}`, version: 1, comments: [], history: [{ action: 'Radicado', date: new Date().toISOString().split('T')[0], user: currentUser.name }] }; setDocuments(p => [newDoc, ...p]); setUploadOpen(false); addToast('Documento radicado exitosamente', 'success'); }} />
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sticky top-0 z-20 border-b border-gray-200">
          <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600"><Menu/></button>
             <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1.5 w-64 border border-transparent focus-within:border-uco-green focus-within:bg-white transition">
                <Search size={16} className="text-gray-400 mr-2"/>
                <input 
                   type="text" 
                   placeholder="Buscar doc, proyecto o código..." 
                   className="bg-transparent text-sm outline-none w-full" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="flex items-center gap-4">
            <select className="text-xs border rounded p-1 bg-gray-50 max-w-[150px] outline-none focus:border-uco-green" value={currentUser.id} onChange={(e) => { const u = USERS.find(us => us.id === e.target.value); if(u) { setCurrentUser(u); setCurrentView('DASHBOARD'); setSelectedProjectId(null); setSelectedFolder(null); setDashboardFilter('ALL'); setDepartmentFilter(null); } }}>{USERS.map(u => <option key={u.id} value={u.id}>{u.role === 'REVIEWER' ? `${u.name} (${u.department})` : u.name}</option>)}</select>
            <div className="w-8 h-8 rounded-full bg-uco-green text-white flex items-center justify-center font-bold text-xs shadow-sm border border-green-600">{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {currentView === 'DASHBOARD' && renderDashboard()}
          
          {currentView === 'PROJECTS' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 animate-fade-in">
                {PROJECTS.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                   <div key={p.id} onClick={() => { setSelectedProjectId(p.id); setSelectedFolder(null); setCurrentView('PROJECT_DETAIL'); }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-uco-green hover:shadow-md cursor-pointer transition group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-uco-green opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between mb-4"><div className="p-3 bg-green-50 text-uco-green rounded-lg group-hover:bg-uco-green group-hover:text-white transition-colors"><FolderOpen /></div><span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded h-fit text-gray-600">{p.code}</span></div>
                      <h3 className="font-brand font-bold text-lg mb-1 text-uco-blue">{p.name}</h3><p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100"><span>Progreso: {p.progress}%</span><ChevronRight size={16} className="text-uco-green"/></div>
                   </div>
                ))}
             </div>
          )}

          {currentView === 'PROJECT_DETAIL' && renderProjectDetail()}
          
          {currentView === 'DOCUMENTS' && (
             <div className="bg-white rounded shadow-sm overflow-hidden pb-20 animate-fade-in">
                <div className="p-4 border-b bg-gray-50 font-brand font-bold text-uco-green">Repositorio General</div>
                {documents.filter(d => hasAccessToDoc(d) && matchesSearch(d)).map(doc => (
                   <div key={doc.id} onClick={() => setViewingDoc(doc)} className="p-4 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center group">
                      <div className="flex items-center gap-3"><div className="bg-gray-100 p-2 rounded text-gray-500 group-hover:text-uco-blue"><FileText size={20} /></div><div><p className="font-bold text-sm text-gray-800">{doc.title}</p><p className="text-xs text-gray-500">{doc.type} • {doc.uploadDate} • {doc.folder}</p></div></div><span className={`px-2 py-0.5 text-[10px] rounded border ${getStatusColor(doc.status)}`}>{doc.status}</span>
                   </div>
                ))}
             </div>
          )}
        </main>
      </div>
    </div>
  );
}