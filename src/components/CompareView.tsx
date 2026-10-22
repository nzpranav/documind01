import React, { useState, useRef } from 'react';
import {
  GitCompare,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  MapPin,
  Download,
  Loader2,
  Sparkles,
  Upload,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DocumentItem, ComparisonResult, ComparisonDiffItem } from '../types/index.ts';

interface CompareViewProps {
  documents: DocumentItem[];
  onCompare: (docAId: string, docBId: string) => Promise<ComparisonResult | null>;
  onDirectCompare?: (fileA: File, fileB: File) => Promise<ComparisonResult | null>;
  isComparing: boolean;
}

type FilterCategory = 'all' | 'changed' | 'missing' | 'conflicts';

export const CompareView: React.FC<CompareViewProps> = ({
  documents,
  onCompare,
  onDirectCompare,
  isComparing
}) => {
  const readyDocs = documents.filter(d => d.status === 'ready');
  const [docAId, setDocAId] = useState<string>(readyDocs[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(readyDocs[1]?.id || readyDocs[0]?.id || '');
  const [compareMode, setCompareMode] = useState<'library' | 'upload'>('library');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Direct upload files state
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const fileAInputRef = useRef<HTMLInputElement>(null);
  const fileBInputRef = useRef<HTMLInputElement>(null);

  const handleRunLibraryCompare = async () => {
    if (!docAId || !docBId || docAId === docBId) return;
    const res = await onCompare(docAId, docBId);
    if (res) setResult(res);
  };

  const handleRunDirectCompare = async () => {
    if (!fileA || !fileB || !onDirectCompare) return;
    const res = await onDirectCompare(fileA, fileB);
    if (res) setResult(res);
  };

  const handleExportComparison = () => {
    if (!result) return;
    const content = `DOCUMENT COMPARATIVE ANALYSIS REPORT\nDoc A (Base): ${result.docAName}\nDoc B (Revised): ${result.docBName}\nTimestamp: ${result.timestamp}\n\nEXECUTIVE SUMMARY:\n${result.summary}\n\n=========================================\nKEY COMPARATIVE FINDINGS:\n=========================================\n` +
      result.items.map((item, idx) => {
        return `[${idx + 1}] CATEGORY: ${(item.category || item.type).toUpperCase()}\nTitle: ${item.title}\nDescription: ${item.description}\nSource A (${item.sourceA?.pageOrLocation || 'N/A'}): "${item.sourceA?.excerpt || 'N/A'}"\nSource B (${item.sourceB?.pageOrLocation || 'N/A'}): "${item.sourceB?.excerpt || 'N/A'}"\n-----------------------------------------`;
      }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comparison_${result.docAName.replace(/[^a-z0-9]/gi, '_')}_vs_${result.docBName.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3.5 h-3.5" /> Added Clause
          </span>
        );
      case 'removed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <MinusCircle className="w-3.5 h-3.5" /> Missing / Removed
          </span>
        );
      case 'potential-conflict':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Conflicting Statement
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5" /> Changed Section
          </span>
        );
    }
  };

  // Filter items based on active tab
  const getFilteredItems = (): ComparisonDiffItem[] => {
    if (!result) return [];
    if (activeFilter === 'changed') {
      return result.items.filter(i => i.type === 'changed');
    }
    if (activeFilter === 'missing') {
      return result.items.filter(i => i.type === 'removed' || i.type === 'added');
    }
    if (activeFilter === 'conflicts') {
      return result.items.filter(i => i.type === 'potential-conflict');
    }
    return result.items;
  };

  const filteredItems = getFilteredItems();

  const changedCount = result?.stats?.changedCount ?? result?.items.filter(i => i.type === 'changed').length ?? 0;
  const missingCount = result?.stats?.missingCount ?? result?.items.filter(i => i.type === 'removed' || i.type === 'added').length ?? 0;
  const conflictCount = result?.stats?.conflictCount ?? result?.items.filter(i => i.type === 'potential-conflict').length ?? 0;
  const totalCount = result?.items.length ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Mode Toggle Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-blue-200">
              <GitCompare className="w-3.5 h-3.5" />
              Comparative Intelligence Engine
            </div>
            <h2 className="text-xl font-bold text-slate-900">Compare Two Document Versions</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Upload or select two document editions (e.g. 2026 vs 2027 Policy amendments, contracts, or grant terms) to automatically identify changed sections, missing/omitted provisions, and conflicting statements.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-center shrink-0 border border-slate-200">
            <button
              onClick={() => setCompareMode('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                compareMode === 'library'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Select from Library
            </button>
            <button
              onClick={() => setCompareMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                compareMode === 'upload'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload Two Files
            </button>
          </div>
        </div>

        {/* Option A: Select from library */}
        {compareMode === 'library' && (
          <div>
            {readyDocs.length < 2 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block font-semibold">Need at least 2 ready documents:</strong>
                  Upload files or click "Load Sample Docs" in the top bar, or toggle "Upload Two Files" above to compare documents directly.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Doc A */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Base Document (Version A)
                  </label>
                  <select
                    value={docAId}
                    onChange={(e) => setDocAId(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {readyDocs.map(d => (
                      <option key={d.id} value={d.id} disabled={d.id === docBId}>
                        {d.filename} ({d.pageCount} pgs)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Arrow Icon */}
                <div className="md:col-span-2 flex justify-center py-1">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {/* Doc B */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Revised Document (Version B)
                  </label>
                  <select
                    value={docBId}
                    onChange={(e) => setDocBId(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {readyDocs.map(d => (
                      <option key={d.id} value={d.id} disabled={d.id === docAId}>
                        {d.filename} ({d.pageCount} pgs)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compare Action Button */}
                <div className="md:col-span-12 flex justify-end pt-3">
                  <button
                    onClick={handleRunLibraryCompare}
                    disabled={isComparing || !docAId || !docBId || docAId === docBId}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40"
                  >
                    {isComparing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Comparing Versions...
                      </>
                    ) : (
                      <>
                        <GitCompare className="w-4 h-4" />
                        Analyze Changed, Missing & Conflicting Sections
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Option B: Direct Drag & Drop / File Upload */}
        {compareMode === 'upload' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box A */}
              <div
                onClick={() => fileAInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center transition flex flex-col items-center justify-center space-y-2 ${
                  fileA
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileAInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileA(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                />
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fileA ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {fileA ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                </div>
                <div>
                  <strong className="block text-xs font-bold text-slate-800">
                    {fileA ? fileA.name : 'Upload Document Version 1 (Base)'}
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    {fileA ? `${(fileA.size / 1024).toFixed(1)} KB` : 'Click to select PDF, DOCX, or TXT'}
                  </span>
                </div>
              </div>

              {/* Box B */}
              <div
                onClick={() => fileBInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center transition flex flex-col items-center justify-center space-y-2 ${
                  fileB
                    ? 'border-blue-300 bg-blue-50/40 text-blue-950'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileBInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileB(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                />
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fileB ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {fileB ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                </div>
                <div>
                  <strong className="block text-xs font-bold text-slate-800">
                    {fileB ? fileB.name : 'Upload Document Version 2 (Revised)'}
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    {fileB ? `${(fileB.size / 1024).toFixed(1)} KB` : 'Click to select PDF, DOCX, or TXT'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunDirectCompare}
                disabled={isComparing || !fileA || !fileB}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40"
              >
                {isComparing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting & Comparing Direct Uploads...
                  </>
                ) : (
                  <>
                    <GitCompare className="w-4 h-4" />
                    Compare Uploaded Files Directly
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Summary Card */}
          <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3" />
                  Comparative Executive Summary
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {result.docAName} <span className="text-slate-400 font-normal">compared with</span> {result.docBName}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed mt-2 max-w-4xl">
                  {result.summary}
                </p>
              </div>

              <button
                onClick={handleExportComparison}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition shadow-xs shrink-0 self-start"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Export Comparison
              </button>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-blue-200/60">
              <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 font-medium block">Total Key Findings</span>
                <span className="text-lg font-bold text-slate-900">{totalCount}</span>
              </div>
              <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-center">
                <span className="text-[11px] text-amber-700 font-medium block">Changed Sections</span>
                <span className="text-lg font-bold text-amber-900">{changedCount}</span>
              </div>
              <div className="p-2.5 bg-rose-50/80 rounded-xl border border-rose-200 text-center">
                <span className="text-[11px] text-rose-700 font-medium block">Missing / Removed</span>
                <span className="text-lg font-bold text-rose-900">{missingCount}</span>
              </div>
              <div className="p-2.5 bg-purple-50/80 rounded-xl border border-purple-200 text-center">
                <span className="text-[11px] text-purple-700 font-medium block">Conflicting Statements</span>
                <span className="text-lg font-bold text-purple-900">{conflictCount}</span>
              </div>
            </div>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>All Findings</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'all' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('changed')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                activeFilter === 'changed'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Changed Sections</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'changed' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {changedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('missing')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                activeFilter === 'missing'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Missing Sections</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'missing' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'}`}>
                {missingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('conflicts')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                activeFilter === 'conflicts'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Conflicting Statements</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'conflicts' ? 'bg-purple-800 text-white' : 'bg-purple-100 text-purple-800'}`}>
                {conflictCount}
              </span>
            </button>
          </div>

          {/* Diff Items List */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                No items found for this specific filter category.
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-blue-300 transition"
                >
                  {/* Top Bar of item */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(item.type)}
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    </div>
                    {item.category && (
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  {/* Side-by-side sources */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source A */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-bold text-slate-800 truncate max-w-[220px]">
                          Doc A (Base): {item.sourceA?.filename || result.docAName}
                        </span>
                        {item.sourceA?.pageOrLocation && (
                          <span className="flex items-center gap-1 font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.sourceA.pageOrLocation}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-serif leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                        "{item.sourceA?.excerpt || 'No corresponding clause located in this version.'}"
                      </p>
                    </div>

                    {/* Source B */}
                    <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      item.type === 'potential-conflict'
                        ? 'bg-purple-50/60 border-purple-200'
                        : item.type === 'removed'
                        ? 'bg-rose-50/60 border-rose-200'
                        : 'bg-blue-50/60 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900 truncate max-w-[220px]">
                          Doc B (Revised): {item.sourceB?.filename || result.docBName}
                        </span>
                        {item.sourceB?.pageOrLocation && (
                          <span className="flex items-center gap-1 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            {item.sourceB.pageOrLocation}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-serif leading-relaxed italic bg-white p-2.5 rounded-lg border border-slate-200/80">
                        "{item.sourceB?.excerpt || 'Omitted or missing in this revised version.'}"
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
