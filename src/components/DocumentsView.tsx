import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Trash2,
  MessageSquare,
  Layers,
  HardDrive,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Sparkles
} from 'lucide-react';
import { DocumentItem } from '../types/index.ts';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onOpenDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onStartChat: (id: string) => void;
  onTriggerUpload: () => void;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onOpenDocument,
  onDeleteDocument,
  onStartChat,
  onTriggerUpload,
  onLoadSamples,
  isLoadingSamples
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(search.toLowerCase());
    const ext = doc.filename.split('.').pop()?.toLowerCase();
    const matchesType = filterType === 'all' || ext === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar with Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Document Repository</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage uploaded files, inspect chunk distributions, and verify vector storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLoadSamples}
              disabled={isLoadingSamples}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Docs
            </button>
            <button
              onClick={onTriggerUpload}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by filename..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Format:</span>
            {['all', 'pdf', 'docx', 'txt'].map(fmt => (
              <button
                key={fmt}
                onClick={() => setFilterType(fmt)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg uppercase transition ${
                  filterType === fmt
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No documents found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'No documents matched your query. Try clearing the search filter.'
              : 'Your workspace is empty. Upload a PDF or TXT file or load the demo suite.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate" title={doc.filename}>
                        {doc.filename}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                        <span className="uppercase font-mono font-medium">
                          {doc.filename.split('.').pop()}
                        </span>
                        <span>•</span>
                        <span>{(doc.sizeBytes / 1024).toFixed(1)} KB</span>
                        {doc.isDemo && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-medium">Sample</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {doc.status === 'ready' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Indexed ({doc.chunkCount} chunks)
                    </div>
                  )}
                  {doc.status === 'failed' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Failed to index
                    </div>
                  )}
                  {['uploaded', 'extracting', 'chunking', 'embedding'].includes(doc.status) && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing ({doc.status})
                    </div>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-600 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.pageCount} Pages</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-600 flex items-center gap-1.5 truncate">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDocument(doc)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Inspect Chunks
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onStartChat(doc.id)}
                    disabled={doc.status !== 'ready'}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-40"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ask
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
