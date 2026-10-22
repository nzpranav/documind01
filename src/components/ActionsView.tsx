import React, { useState } from 'react';
import {
  CheckSquare,
  Calendar,
  FileCheck,
  Download,
  Copy,
  Check,
  Filter,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DocumentItem, ActionItem, Citation } from '../types/index.ts';

interface ActionsViewProps {
  documents: DocumentItem[];
  onExtractActions: (docIds: string[]) => Promise<ActionItem[]>;
  isExtracting: boolean;
  onInspectCitation: (citation: Citation) => void;
}

export const ActionsView: React.FC<ActionsViewProps> = ({
  documents,
  onExtractActions,
  isExtracting,
  onInspectCitation
}) => {
  const readyDocs = documents.filter(d => d.status === 'ready');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    readyDocs.length > 0 ? [readyDocs[0].id] : []
  );
  const [items, setItems] = useState<ActionItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const handleToggleDoc = (id: string) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRunExtract = async () => {
    if (selectedDocIds.length === 0) return;
    const extracted = await onExtractActions(selectedDocIds);
    setItems(extracted);
  };

  const handleToggleStatus = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'Done' ? 'To review' : 'Done' }
          : item
      )
    );
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Task', 'Category', 'Deadline', 'Status', 'Required Documents', 'Source File', 'Location'];
    const rows = items.map(it => [
      `"${it.task.replace(/"/g, '""')}"`,
      `"${it.category}"`,
      `"${it.deadline}"`,
      `"${it.status}"`,
      `"${it.requiredDocuments.join('; ')}"`,
      `"${it.sourceFilename}"`,
      `"${it.pageOrLocation}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocuMind_Action_Checklist_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    if (items.length === 0) return;
    const md =
      `# DocuMind Action Checklist\n\n` +
      items
        .map(
          it =>
            `- [${it.status === 'Done' ? 'x' : ' '}] **${it.task}**\n  - Category: ${it.category}\n  - Deadline: ${it.deadline}\n  - Source: ${it.sourceFilename} (${it.pageOrLocation})\n`
        )
        .join('\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    'All',
    'Deadline',
    'Required Document',
    'Eligibility Condition',
    'Financial & Fee',
    'Compliance'
  ];

  const filteredItems = items.filter(
    it => filterCategory === 'All' || it.category === filterCategory
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="max-w-2xl mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Action & Deadline Extractor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Scan documents to automatically extract compliance obligations, explicit deadlines, required application forms, and eligibility criteria with source citations.
          </p>
        </div>

        {readyDocs.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            Please upload a document or load sample docs first to extract action items.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Select Documents to Scan:
              </label>
              <div className="flex flex-wrap gap-2">
                {readyDocs.map(d => {
                  const isSelected = selectedDocIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleToggleDoc(d.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{d.filename}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunExtract}
                disabled={isExtracting || selectedDocIds.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting Requirements & Deadlines...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract Action Checklist
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Content */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
            {/* Filter chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    filterCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Export actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Markdown'}
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="divide-y divide-slate-100">
            {filteredItems.map(item => {
              const isDone = item.status === 'Done';
              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 transition flex items-start gap-3.5 ${
                    isDone ? 'bg-slate-50/60 opacity-70' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Status Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-blue-500 bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {item.task}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                      </div>

                      {/* Deadline badge */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span
                          className={`text-xs font-medium ${
                            item.deadline === 'Not found in the selected documents'
                              ? 'text-slate-400 italic'
                              : 'text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-semibold'
                          }`}
                        >
                          {item.deadline}
                        </span>
                      </div>
                    </div>

                    {/* Required Documents Pill */}
                    {item.requiredDocuments && item.requiredDocuments.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-medium text-slate-700">Required:</span>
                        {item.requiredDocuments.map((doc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Source Evidence Quote */}
                    {item.evidenceExcerpt && (
                      <div
                        onClick={() =>
                          onInspectCitation({
                            chunkId: item.id,
                            documentId: '',
                            filename: item.sourceFilename,
                            pageOrLocation: item.pageOrLocation,
                            excerpt: item.evidenceExcerpt
                          })
                        }
                        className="cursor-pointer p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-xs space-y-1 transition group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium text-blue-700 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {item.sourceFilename} ({item.pageOrLocation})
                          </span>
                          <span className="text-blue-600 group-hover:underline text-[10px]">
                            Inspect excerpt
                          </span>
                        </div>
                        <p className="text-slate-600 font-serif italic text-[11px] line-clamp-2">
                          "{item.evidenceExcerpt}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
