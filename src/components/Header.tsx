import React, { useState } from 'react';
import { Menu, Upload, Sparkles, BookOpen, Layers, LogOut, User as UserIcon, ChevronDown, Mic } from 'lucide-react';
import { ActiveTab } from './Sidebar.tsx';
import { User } from '../types/index.ts';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  documentCount: number;
  totalChunks: number;
  onTriggerUpload: () => void;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
  user: User | null;
  onLogout: () => void;
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  documentCount,
  totalChunks,
  onTriggerUpload,
  onLoadSamples,
  isLoadingSamples,
  user,
  onLogout,
  onNavigateToTab
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Workspace Dashboard',
      subtitle: 'Upload documents, monitor vector embeddings, and start Q&A'
    },
    documents: {
      title: 'My Documents',
      subtitle: 'Indexed document library, chunk inspection, and file management'
    },
    chat: {
      title: 'AI Document Assistant',
      subtitle: 'Ask grounded questions with strict source citations and missing-evidence alerts'
    },
    voice: {
      title: 'Voice Document Assistant',
      subtitle: 'Ask questions aloud and listen to grounded answers with highlighted document references'
    },
    study: {
      title: 'Smart Study Mode',
      subtitle: 'Generate short notes, interactive MCQs with answers, revision flashcards, and exam questions'
    },
    compare: {
      title: 'Compare Documents & Versions',
      subtitle: 'Analyze differences, revised deadlines, and conflicting clauses across files'
    },
    actions: {
      title: 'Action & Deadline Extractor',
      subtitle: 'Turn dense PDF/TXT requirements into an actionable verified checklist'
    },
    'django-guide': {
      title: 'Python / Django Architecture',
      subtitle: 'Full codebase reference, models, FAISS RAG pipeline, and Windows setup instructions'
    },
    settings: {
      title: 'Settings & Retrieval Tuning',
      subtitle: 'Configure chunk sizes, top-k retrieval, relevance thresholds, and privacy'
    }
  };

  const { title, subtitle } = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
            {title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Real-time stats pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-800">{documentCount}</span> docs
          <span className="text-slate-300">|</span>
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-slate-800">{totalChunks}</span> chunks
        </div>

        {/* Load Demo Documents Button */}
        <button
          onClick={onLoadSamples}
          disabled={isLoadingSamples}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
          title="Preload 3 realistic test documents (Renewable Energy Policy 2026/2027 and Grant Guidelines)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Load Sample Docs</span>
          <span className="sm:hidden">Samples</span>
        </button>

        {/* Voice Assistant Quick Launch Button */}
        <button
          onClick={() => onNavigateToTab?.('voice')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition border shadow-sm ${
            activeTab === 'voice'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
          }`}
          title="Open Voice Assistant to ask questions aloud and listen to answers"
        >
          <Mic className={`w-3.5 h-3.5 ${activeTab === 'voice' ? 'text-white animate-pulse' : 'text-emerald-600'}`} />
          <span className="hidden sm:inline">Voice Mode</span>
          <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-bold">Live</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onTriggerUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        {/* User Profile & Logout */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition text-xs font-medium text-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
