import React, { useEffect, useState } from 'react';
import { X, FileText, Trash2, Layers, Calendar, HardDrive, AlertTriangle, Loader2 } from 'lucide-react';
import { DocumentItem } from '../types/index.ts';

interface DocumentModalProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onStartChat: (id: string) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  document,
  onClose,
  onDelete,
  onStartChat
}) => {
  const [chunks, setChunks] = useState<{ id: string; pageOrLocation: string; chunkIndex: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!document) return;
    setLoading(true);
    fetch(`/api/documents/${document.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.chunks) setChunks(data.chunks);
      })
      .catch(err => console.error('Failed to load chunks:', err))
      .finally(() => setLoading(false));
  }, [document]);

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{document.filename}</h3>
              <p className="text-xs text-slate-500">Document Inspection & Chunks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Size
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-1">
                {(document.sizeBytes / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Pages / Sec
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-1">
                {document.pageCount}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Total Chunks
              </span>
              <span className="text-sm font-semibold text-slate-800 block mt-1">
                {document.chunkCount}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Uploaded
              </span>
              <span className="text-xs font-semibold text-slate-800 block mt-1 truncate">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Status Message */}
          {document.status === 'failed' ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Processing Failed:</strong>
                {document.error || 'Unable to extract text from this document.'}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
              <span className="font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Indexed in Vector Store & Ready for RAG
              </span>
              <span className="font-mono text-emerald-700 font-semibold">{chunks.length} vectors stored</span>
            </div>
          )}

          {/* Chunks List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Indexed Chunks Breakdown
            </h4>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">Loading chunks...</span>
              </div>
            ) : chunks.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                No chunks available for this document.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {chunks.map((c, i) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs hover:border-blue-300 transition">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1.5">
                      <span className="font-semibold text-blue-700">Chunk #{i + 1} ({c.pageOrLocation})</span>
                      <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                    </div>
                    <p className="text-slate-700 font-serif leading-relaxed line-clamp-3">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-700 font-medium">Permanently delete document & embeddings?</span>
              <button
                onClick={() => {
                  onDelete(document.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete Document
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onStartChat(document.id);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              Ask Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
