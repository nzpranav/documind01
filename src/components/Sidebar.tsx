import React from 'react';
import {
  LayoutDashboard,
  Files,
  MessageSquareText,
  GitCompare,
  CheckSquare,
  Code2,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Database,
  GraduationCap,
  Mic
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'documents'
  | 'chat'
  | 'voice'
  | 'study'
  | 'compare'
  | 'actions'
  | 'django-guide'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  documentCount: number;
  readyCount: number;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  documentCount,
  readyCount,
  isOpen,
  onCloseMobile
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'documents',
      label: 'My Documents',
      icon: <Files className="w-4 h-4" />,
      badge: documentCount > 0 ? `${documentCount}` : undefined
    },
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: <MessageSquareText className="w-4 h-4" />,
      badge: readyCount > 0 ? 'RAG' : undefined
    },
    {
      id: 'voice',
      label: 'Voice Assistant',
      icon: <Mic className="w-4 h-4 text-emerald-500" />,
      badge: 'Live Voice'
    },
    {
      id: 'study',
      label: 'Smart Study Mode',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: 'Study'
    },
    {
      id: 'compare',
      label: 'Compare Documents',
      icon: <GitCompare className="w-4 h-4" />
    },
    {
      id: 'actions',
      label: 'Action Checklist',
      icon: <CheckSquare className="w-4 h-4" />
    },
    {
      id: 'django-guide',
      label: 'Django Architecture',
      icon: <Code2 className="w-4 h-4" />,
      badge: 'Docs'
    },
    {
      id: 'settings',
      label: 'Settings & Privacy',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base">DocuMind AI</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                  VDI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Verified Document Intelligence</p>
            </div>
          </div>
          <div className="mt-3 px-2 py-1.5 bg-slate-800/80 rounded-lg text-[11px] text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">"Get answers you can verify."</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* System & RAG Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Vector Index
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>Embedding:</span>
              <span className="text-slate-200 font-mono">gemini-embed-2</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Generation:</span>
              <span className="text-slate-200 font-mono">gemini-3.8-flash</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
