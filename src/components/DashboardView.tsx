import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Layers,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GitCompare,
  CheckSquare,
  Clock,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  GraduationCap,
  Mic
} from 'lucide-react';
import { DocumentItem, SystemStats } from '../types/index.ts';

interface DashboardViewProps {
  documents: DocumentItem[];
  stats: SystemStats;
  onUploadFile: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadStatusText: string;
  onNavigateToTab: (tab: any) => void;
  onOpenDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  stats,
  onUploadFile,
  isUploading,
  uploadStatusText,
  onNavigateToTab,
  onOpenDocument,
  onDeleteDocument,
  onLoadSamples,
  isLoadingSamples
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Verified Document Intelligence (VDI)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Get answers you can verify.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Ask questions across your PDFs, DOCX, and TXT documents. Every answer is retrieved first by vector similarity and grounded in verifiable source passages with exact page citations.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('voice')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-emerald-900/30"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              Ask Aloud (Voice Assistant)
            </button>
            <button
              onClick={() => onNavigateToTab('chat')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-900/30"
            >
              Start Chat
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateToTab('django-guide')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              View Python / Django Code
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
      </div>

      {/* Real Backend Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Documents</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.totalDocuments}</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium">{stats.processedDocuments} indexed</span>
            <span>•</span>
            <span>{stats.totalDocuments - stats.processedDocuments} other</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Indexed Chunks</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.totalChunks}</div>
          <div className="mt-1 text-xs text-slate-500">
            Stored in vector index
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Queries Asked</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.totalQueries}</div>
          <div className="mt-1 text-xs text-slate-500">
            Grounded RAG queries
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Citations</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.verifiedCitations}</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero hallucinated sources
          </div>
        </div>
      </div>

      {/* Upload Dropzone & Demo Preloader Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Upload Document</h3>
              <p className="text-xs text-slate-500">
                Supports PDF, DOCX, and TXT files (Max 20MB)
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Auto Vectorization
            </span>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{uploadStatusText}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Extracting text, chunking passages, and computing Gemini embeddings...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Drag and drop your document here, or <span className="text-blue-600 hover:underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF (with extractable text), DOCX, or TXT
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">PDF</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">DOCX</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">TXT</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo Documents Showcase */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Quick Demo Suite</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Want to see DocuMind AI in action right now? Load our realistic sample policy documents and grant guidelines:
            </p>

            <ul className="text-xs text-slate-700 space-y-2 pt-1">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Renewable Energy 2026</strong>: 45% tax credit, $500/day late penalty, Nov 30 deadline.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Renewable Energy 2027</strong>: 50% tax credit, Dec 15 deadline, battery storage mandate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>Academic Grant AREG</strong>: $75,000 funding, Aug 15 LOI deadline, required COI form.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 space-y-2">
            <button
              onClick={onLoadSamples}
              disabled={isLoadingSamples}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {isLoadingSamples ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Indexing Demo Files...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Load 3 Demo Documents
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-700/80">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Includes pre-extracted pages and vectors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Uploaded Documents</h3>
            <p className="text-xs text-slate-500">Live indexed documents in current session</p>
          </div>
          <button
            onClick={() => onNavigateToTab('documents')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            Manage All ({documents.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">No documents in workspace</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Upload a PDF or TXT file above, or click "Load 3 Demo Documents" to test vector retrieval immediately.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Pages / Chunks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="truncate block max-w-xs">{doc.filename}</span>
                        {doc.isDemo && (
                          <span className="text-[10px] font-normal text-indigo-600">Sample Document</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 uppercase font-mono text-[11px]">
                      {doc.filename.split('.').pop()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {(doc.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium text-slate-800">{doc.pageCount} pages</span>
                      <span className="text-slate-400"> ({doc.chunkCount} chunks)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready for Q&A
                        </span>
                      )}
                      {doc.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      {['uploaded', 'extracting', 'chunking', 'embedding'].includes(doc.status) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processing ({doc.status})
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDocument(doc)}
                          className="px-2.5 py-1 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => {
                            onNavigateToTab('chat');
                          }}
                          disabled={doc.status !== 'ready'}
                          className="px-2.5 py-1 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg font-medium transition disabled:opacity-40"
                        >
                          Ask
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feature Exploration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          onClick={() => onNavigateToTab('voice')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Live Voice
          </div>
          <div className="p-2.5 w-fit rounded-xl bg-emerald-100 text-emerald-700 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Voice Assistant</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ask aloud and listen to spoken answers with interactive page citations displayed on screen.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-3 group-hover:translate-x-0.5 transition">
            Speak Now <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateToTab('chat')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="p-2.5 w-fit rounded-xl bg-blue-100 text-blue-700 mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Grounded Q&A</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Retrieves top semantic passages before prompting Gemini. Zero invented facts.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mt-3 group-hover:translate-x-0.5 transition">
            Open Chat <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateToTab('study')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="p-2.5 w-fit rounded-xl bg-indigo-100 text-indigo-700 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Smart Study Mode</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Generate short notes, interactive MCQs with answers, 3D flashcards, and exam questions.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-3 group-hover:translate-x-0.5 transition">
            Start Studying <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateToTab('compare')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="p-2.5 w-fit rounded-xl bg-purple-100 text-purple-700 mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
            <GitCompare className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Version Comparison</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Side-by-side detection of added clauses, removed conditions, and conflicting terms.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 mt-3 group-hover:translate-x-0.5 transition">
            Compare Versions <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => onNavigateToTab('actions')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="p-2.5 w-fit rounded-xl bg-emerald-100 text-emerald-700 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Action Extractor</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Converts long policies into an actionable checklist with explicit deadlines and forms.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-3 group-hover:translate-x-0.5 transition">
            Extract Checklist <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
