import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Bell, 
  Search, 
  Menu, 
  LogOut, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  FileSignature,
  Bot
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

import { USERS, PROJECTS, INITIAL_DOCUMENTS } from './constants';
import { User, Project, Document, UserRole, DocStatus, DocType } from './types';
import { askUCOAssistant } from './services/geminiService';

// --- Components defined in file for simplicity of single-file output requirement, 
// normally would be split. ---

// 1. Sidebar Component
const Sidebar = ({ 
  currentView, 
  setCurrentView, 
  currentUser 
}: { 
  currentView: string, 
  setCurrentView: (v: string) => void, 
  currentUser: User 
}) => {
  return (
    <div className="w-64 bg-uco-blue text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-blue-800">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-uco-blue font-bold text-xl">
          UCO
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Gestión<br/>Proyectos</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setCurrentView('DASHBOARD')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${currentView === 'DASHBOARD' ? 'bg-uco-yellow text-uco-blue font-bold' : 'hover:bg-blue-800'}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentView('PROJECTS')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${currentView === 'PROJECTS' || currentView === 'PROJECT_DETAIL' ? 'bg-uco-yellow text-uco-blue font-bold' : 'hover:bg-blue-800'}`}
        >
          <FolderOpen size={20} />
          Proyectos
        </button>
        <button 
          onClick={() => setCurrentView('DOCUMENTS')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${currentView === 'DOCUMENTS' ? 'bg-uco-yellow text-uco-blue font-bold' : 'hover:bg-blue-800'}`}
        >
          <FileText size={20} />
          Mis Documentos
        </button>
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-uco-yellow" />
          <div className="flex-1 overflow-hidden">
            <p className="font-bold truncate">{currentUser.name}</p>
            <p className="text-xs text-blue-200 truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Dashboard Component
const Dashboard = ({ 
  documents, 
  projects, 
  currentUser,
  onNavigate 
}: { 
  documents: Document[], 
  projects: Project[], 
  currentUser: User,
  onNavigate: (view: string, id?: string) => void
}) => {
  
  // Stats
  const pendingSign = documents.filter(d => d.status === DocStatus.PENDING_SIG && (d.assignedTo === currentUser.id || currentUser.role === UserRole.DIRECTOR)).length;
  const overdue = documents.filter(d => {
    const today = new Date().toISOString().split('T')[0];
    return d.dueDate < today && d.status !== DocStatus.SIGNED;
  }).length;

  const dataStatus = [
    { name: 'Firmados', value: documents.filter(d => d.status === DocStatus.SIGNED).length, color: '#10B981' }, // Green
    { name: 'Pendientes', value: documents.filter(d => d.status === DocStatus.PENDING_SIG).length, color: '#FFCC00' }, // Yellow
    { name: 'Borradores', value: documents.filter(d => d.status === DocStatus.DRAFT).length, color: '#9CA3AF' }, // Gray
    { name: 'Vencidos', value: overdue, color: '#EF4444' }, // Red
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-uco-blue">Hola, {currentUser.name.split(' ')[0]}</h2>
        <p className="text-gray-500">Resumen de gestión documental de proyectos</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-uco-yellow flex flex-col">
          <span className="text-gray-500 text-sm font-medium uppercase">Pendientes Firma</span>
          <span className="text-4xl font-bold text-uco-blue mt-2">{pendingSign}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col">
          <span className="text-gray-500 text-sm font-medium uppercase">Vencidos / Críticos</span>
          <span className="text-4xl font-bold text-red-600 mt-2">{overdue}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col">
          <span className="text-gray-500 text-sm font-medium uppercase">Proyectos Activos</span>
          <span className="text-4xl font-bold text-green-700 mt-2">{projects.filter(p => p.status === 'Activo').length}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-300 flex flex-col">
          <span className="text-gray-500 text-sm font-medium uppercase">Docs esta semana</span>
          <span className="text-4xl font-bold text-blue-500 mt-2">5</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="font-bold text-lg text-uco-blue mb-4">Estado de Documentos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Recent */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg text-uco-blue mb-4">Acción Inmediata</h3>
          <div className="space-y-3">
            {documents
              .filter(d => d.status === DocStatus.PENDING_SIG)
              .slice(0, 4)
              .map(doc => (
                <div key={doc.id} onClick={() => onNavigate('DOC_VIEW', doc.id)} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition border border-gray-100 group">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm text-gray-800 group-hover:text-uco-blue">{doc.title}</p>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Firmar</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{projects.find(p => p.id === doc.projectId)?.name}</p>
                </div>
              ))}
              {documents.filter(d => d.status === DocStatus.PENDING_SIG).length === 0 && (
                <p className="text-gray-400 text-sm italic">No hay documentos pendientes.</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Document View / Signer
const DocumentViewer = ({ 
  document, 
  project, 
  onBack, 
  currentUser,
  onSign,
  onReject
}: { 
  document: Document, 
  project: Project | undefined, 
  onBack: () => void, 
  currentUser: User,
  onSign: (id: string) => void,
  onReject: (id: string) => void
}) => {
  const [comment, setComment] = useState('');

  const canSign = document.status === DocStatus.PENDING_SIG && 
                 (document.assignedTo === currentUser.id || currentUser.role === UserRole.DIRECTOR);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-100px)]">
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full">
            <ChevronRight className="rotate-180 text-gray-600" />
          </button>
          <div>
            <h2 className="font-bold text-xl text-uco-blue">{document.title}</h2>
            <p className="text-sm text-gray-500">Proyecto: {project?.name} • Versión {document.version}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1
              ${document.status === DocStatus.SIGNED ? 'bg-green-100 text-green-800' : 
                document.status === DocStatus.PENDING_SIG ? 'bg-yellow-100 text-yellow-800' : 
                document.status === DocStatus.REJECTED ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {document.status === DocStatus.SIGNED && <CheckCircle size={14}/>}
              {document.status === DocStatus.REJECTED && <XCircle size={14}/>}
              {document.status === DocStatus.PENDING_SIG && <Clock size={14}/>}
              {document.status}
            </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mock PDF Viewer */}
        <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center">
           <div className="bg-white shadow-2xl w-full max-w-3xl min-h-[800px] p-12 flex flex-col">
              <div className="border-b-2 border-uco-blue pb-4 mb-8 flex justify-between items-end">
                <img src="https://via.placeholder.com/150x50/003366/FFFFFF?text=LOGO+UCO" alt="Logo" />
                <div className="text-right">
                  <h1 className="text-2xl font-serif text-gray-800 uppercase tracking-wide">{document.type}</h1>
                  <p className="text-gray-500 text-sm">Ref: {document.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex-1 space-y-6 text-justify text-gray-700 font-serif leading-relaxed">
                <p>
                  <strong>FECHA:</strong> {document.uploadDate}
                </p>
                <p>
                  Por medio del presente documento se hace constar que el proyecto <strong>{project?.name}</strong> ha cumplido con los requisitos establecidos en la fase preliminar.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                
                {/* Visual signature placeholder */}
                {document.status === DocStatus.SIGNED && (
                  <div className="mt-12 border-2 border-green-600 border-dashed p-4 inline-block transform -rotate-2">
                     <p className="text-green-700 font-bold font-mono text-xl">FIRMADO DIGITALMENTE</p>
                     <p className="text-green-600 text-xs">{new Date().toLocaleDateString()}</p>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar Actions */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-700 mb-2">Detalles</h3>
            <div className="text-sm space-y-2 text-gray-600">
              <div className="flex justify-between"><span>Responsable:</span> <span className="font-medium">{document.uploadedBy}</span></div>
              <div className="flex justify-between"><span>Vence:</span> <span className={`${document.dueDate < new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : ''}`}>{document.dueDate}</span></div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-bold text-gray-700 mb-2">Historial</h3>
            <div className="space-y-4">
              {document.history.map((h, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <div className="min-w-[2px] bg-gray-200 relative">
                    <div className="absolute top-1.5 -left-[3px] w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{h.action}</p>
                    <p className="text-xs text-gray-500">{h.user} • {h.date}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {document.comments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-2">Comentarios</h3>
                {document.comments.map(c => (
                   <div key={c.id} className="bg-blue-50 p-3 rounded-lg mb-2 text-sm">
                     <p className="font-bold text-uco-blue text-xs">{c.userName}</p>
                     <p className="text-gray-700">{c.text}</p>
                   </div>
                ))}
              </div>
            )}
          </div>

          {canSign ? (
            <div className="p-4 border-t bg-gray-50">
              <textarea 
                className="w-full text-sm border rounded p-2 mb-3" 
                placeholder="Comentarios (opcional)..."
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onReject(document.id)}
                  className="bg-red-100 text-red-700 font-bold py-2 rounded-lg hover:bg-red-200 transition"
                >
                  Rechazar
                </button>
                <button 
                  onClick={() => onSign(document.id)}
                  className="bg-uco-blue text-white font-bold py-2 rounded-lg hover:bg-blue-800 transition shadow-lg flex justify-center items-center gap-2"
                >
                  <FileSignature size={18}/>
                  Firmar
                </button>
              </div>
            </div>
          ) : (
             <div className="p-4 border-t text-center text-gray-400 text-sm">
               {document.status === DocStatus.SIGNED ? 'Documento finalizado.' : 'No tienes acciones pendientes.'}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. Projects List
const ProjectList = ({ 
  projects, 
  onSelectProject 
}: { 
  projects: Project[], 
  onSelectProject: (id: string) => void 
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-uco-blue">Proyectos</h2>
        <button className="bg-uco-yellow text-uco-blue px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition">
          <Plus size={20} /> Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div 
            key={project.id} 
            onClick={() => onSelectProject(project.id)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-uco-blue group"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-uco-blue group-hover:bg-uco-blue group-hover:text-white transition-colors">
                  <FolderOpen size={24} />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${project.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{project.description}</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-uco-blue h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progreso</span>
                <span>{project.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. AI Assistant Component
const Assistant = ({ 
  isOpen, 
  onClose,
  documents,
  projects
}: { 
  isOpen: boolean, 
  onClose: () => void,
  documents: Document[],
  projects: Project[]
}) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setQuery('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const answer = await askUCOAssistant(userMsg, documents, projects);
    
    setLoading(false);
    setHistory(prev => [...prev, { role: 'ai', text: answer }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-slide-up">
      <div className="bg-uco-blue text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-bold">Asistente UCO</h3>
        </div>
        <button onClick={onClose}><XCircle size={20} /></button>
      </div>
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {history.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-10">
            Pregúntame sobre fechas de vencimiento, documentos pendientes o estado de proyectos.
          </p>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-white border text-gray-700'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-400 ml-2">Pensando...</div>}
      </div>
      <div className="p-3 bg-white border-t flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Escribe tu pregunta..."
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:border-uco-blue"
        />
        <button onClick={handleAsk} disabled={loading} className="bg-uco-yellow text-uco-blue p-2 rounded hover:opacity-80 disabled:opacity-50">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};


// --- MAIN APP ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]); // Default to Director
  const [currentView, setCurrentView] = useState('DASHBOARD'); // DASHBOARD, PROJECTS, PROJECT_DETAIL, DOC_VIEW
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  // Helper to handle signing
  const handleSignDocument = (docId: string) => {
    setDocuments(docs => docs.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: DocStatus.SIGNED,
          history: [...d.history, { action: 'Firmado Digitalmente', date: new Date().toISOString().split('T')[0], user: currentUser.name }]
        };
      }
      return d;
    }));
    // After sign, go back
    setCurrentView(selectedProjectId ? 'PROJECT_DETAIL' : 'DASHBOARD');
  };

  const handleRejectDocument = (docId: string) => {
    setDocuments(docs => docs.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: DocStatus.REJECTED,
          history: [...d.history, { action: 'Rechazado', date: new Date().toISOString().split('T')[0], user: currentUser.name }]
        };
      }
      return d;
    }));
    setCurrentView(selectedProjectId ? 'PROJECT_DETAIL' : 'DASHBOARD');
  };

  // Views rendering
  const renderContent = () => {
    switch(currentView) {
      case 'DASHBOARD':
        return <Dashboard 
          documents={documents} 
          projects={PROJECTS} 
          currentUser={currentUser}
          onNavigate={(view, id) => {
             if (view === 'DOC_VIEW' && id) {
               setSelectedDocId(id);
               // Find project for this doc to keep context
               const doc = documents.find(d => d.id === id);
               if(doc) setSelectedProjectId(doc.projectId);
               setCurrentView('DOC_VIEW');
             }
          }}
        />;
      
      case 'PROJECTS':
        return <ProjectList 
          projects={PROJECTS} 
          onSelectProject={(id) => {
            setSelectedProjectId(id);
            setCurrentView('PROJECT_DETAIL');
          }} 
        />;

      case 'PROJECT_DETAIL':
        const project = PROJECTS.find(p => p.id === selectedProjectId);
        const projectDocs = documents.filter(d => d.projectId === selectedProjectId);
        
        return (
          <div className="animate-fade-in space-y-6">
             <button onClick={() => setCurrentView('PROJECTS')} className="text-sm text-gray-500 hover:text-uco-blue flex items-center gap-1 mb-2">
               &larr; Volver a Proyectos
             </button>
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-3xl font-bold text-uco-blue">{project?.name}</h2>
                   <p className="text-gray-600">{project?.description}</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm text-gray-500">Estado</span>
                  <span className="font-bold text-green-600">{project?.status}</span>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-lg">Documentos</h3>
                  <button className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-2">
                    <Plus size={16}/> Subir Nuevo
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-sm text-gray-500 border-b">
                       <th className="p-4 font-medium">Nombre</th>
                       <th className="p-4 font-medium">Tipo</th>
                       <th className="p-4 font-medium">Fecha Carga</th>
                       <th className="p-4 font-medium">Estado</th>
                       <th className="p-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDocs.map(doc => (
                      <tr key={doc.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded text-uco-blue"><FileText size={18}/></div>
                            <span className="font-medium text-gray-800">{doc.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{doc.type}</td>
                        <td className="p-4 text-sm text-gray-600">{doc.uploadDate}</td>
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold 
                            ${doc.status === DocStatus.SIGNED ? 'bg-green-100 text-green-800' : 
                              doc.status === DocStatus.PENDING_SIG ? 'bg-yellow-100 text-yellow-800' : 
                              doc.status === DocStatus.REJECTED ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              {doc.status}
                           </span>
                        </td>
                        <td className="p-4 text-right">
                           <button 
                            onClick={() => {
                              setSelectedDocId(doc.id);
                              setCurrentView('DOC_VIEW');
                            }}
                            className="text-uco-blue hover:underline text-sm font-medium"
                           >
                             Ver / Gestionar
                           </button>
                        </td>
                      </tr>
                    ))}
                    {projectDocs.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">No hay documentos en este proyecto.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        );

      case 'DOCUMENTS':
        // Reuse Dashboard logic or specialized list, keeping simple for MVP
        return (
          <div className="animate-fade-in">
             <h2 className="text-3xl font-bold text-uco-blue mb-6">Mis Documentos Recientes</h2>
             {/* Simple list reused logic */}
             <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-500">Funcionalidad en desarrollo para MVP.</p>
             </div>
          </div>
        );

      case 'DOC_VIEW':
        const doc = documents.find(d => d.id === selectedDocId);
        const proj = PROJECTS.find(p => p.id === doc?.projectId);
        if(!doc) return <div>Documento no encontrado</div>;
        return <DocumentViewer 
          document={doc} 
          project={proj} 
          onBack={() => selectedProjectId ? setCurrentView('PROJECT_DETAIL') : setCurrentView('DASHBOARD')}
          currentUser={currentUser}
          onSign={handleSignDocument}
          onReject={handleRejectDocument}
        />;

      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(v) => {
          if(v !== 'PROJECT_DETAIL' && v !== 'DOC_VIEW') setSelectedProjectId(null);
          setCurrentView(v);
        }} 
        currentUser={currentUser} 
      />

      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-gray-100 rounded-lg px-3 py-2 w-96">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar documento, proyecto..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-uco-blue">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            
            {/* User Switcher for MVP Demo Purposes */}
            <select 
              className="text-xs border rounded p-1 bg-gray-50"
              value={currentUser.id}
              onChange={(e) => {
                const u = USERS.find(user => user.id === e.target.value);
                if(u) setCurrentUser(u);
              }}
            >
              {USERS.map(u => <option key={u.id} value={u.id}>Demo: {u.name} ({u.role})</option>)}
            </select>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-8">
          {renderContent()}
        </main>
      </div>

      {/* AI Floating Button */}
      <button 
        onClick={() => setAssistantOpen(!isAssistantOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-uco-blue text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-800 transition z-40"
      >
        <Bot size={28} />
      </button>

      <Assistant 
        isOpen={isAssistantOpen} 
        onClose={() => setAssistantOpen(false)} 
        documents={documents}
        projects={PROJECTS}
      />
    </div>
  );
}