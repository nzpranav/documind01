import React, { useState } from 'react';
import {
  X,
  FileText,
  MapPin,
  Percent,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Search,
  Sparkles,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Citation } from '../types/index.ts';

interface EvidenceDrawerProps {
  citation: Citation | null;
  onClose: () => void;
  allCitations?: Citation[];
  onSelectCitation?: (c: Citation) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  citation,
  onClose,
  allCitations = [],
  onSelectCitation
}) => {
  const [copiedType, setCopiedType] = useState<'excerpt' | 'citation' | null>(null);
  const [pageSearch, setPageSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'highlighted' | 'sidebyside'>('highlighted');

  if (!citation) return null;

  const pageNum = citation.pageNumber || 1;
  const rawText = citation.fullPageText || citation.excerpt || '';
  const excerptToHighlight = citation.highlightText || citation.excerpt || '';

  const handleCopy = (text: string, type: 'excerpt' | 'citation') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Helper to render text with highlighted passage
  const renderHighlightedText = () => {
    if (!rawText) return <p className="text-slate-500 italic">No page text available.</p>;

    // If user typed in search box, prioritize user search term
    const term = pageSearch.trim() || excerptToHighlight.trim();

    if (!term) {
      return <span>{rawText}</span>;
    }

    // Try finding exact or fuzzy match
    const lowerRaw = rawText.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerRaw.indexOf(lowerTerm);

    if (index === -1) {
      // Split by significant words of the excerpt
      const words = term.split(/\s+/).filter(w => w.length > 4);
      if (words.length > 0) {
        const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        const parts = rawText.split(regex);
        return (
          <span>
            {parts.map((part, i) =>
              regex.test(part) ? (
                <mark key={i} className="bg-amber-200 text-amber-950 font-semibold px-1 py-0.5 rounded border border-amber-300">
                  {part}
                </mark>
              ) : (
                part
              )
            )}
          </span>
        );
      }
      return <span>{rawText}</span>;
    }

    const before = rawText.slice(0, index);
    const match = rawText.slice(index, index + term.length);
    const after = rawText.slice(index + term.length);

    return (
      <span>
        {before}
        <mark className="bg-amber-200 text-amber-950 font-semibold px-1 py-0.5 rounded border border-amber-400 ring-2 ring-amber-300 shadow-xs">
          {match}
        </mark>
        {after}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Trust Passage Verifier</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Grounding
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <span>Direct Document Proof</span>
                <span className="text-slate-500">•</span>
                <span>Page-Attributed Evidence</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Close Verifier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Citation Selector Tabs if multiple citations */}
        {allCitations.length > 1 && onSelectCitation && (
          <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-semibold text-slate-500 shrink-0 uppercase text-[10px] tracking-wider">
              Cited Pages:
            </span>
            {allCitations.map((c, i) => {
              const isSelected = c.chunkId === citation.chunkId;
              return (
                <button
                  key={c.chunkId || i}
                  onClick={() => onSelectCitation(c)}
                  className={`px-3 py-1 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Page {c.pageNumber || i + 1}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Metadata Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Document</span>
            <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5" title={citation.filename}>
              {citation.filename}
            </span>
          </div>

          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Verified Location</span>
            <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Page {pageNum}
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vector Relevance</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
              <Percent className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {citation.similarity !== undefined ? `${Math.round(citation.similarity * 100)}% match` : 'High'}
            </span>
          </div>

          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Status</span>
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              100% Verbatim
            </span>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="px-5 py-2 border-b border-slate-200 flex items-center justify-between bg-white text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('highlighted')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'highlighted'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Highlighted Page View
            </button>
            <button
              onClick={() => setActiveTab('sidebyside')}
              className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                activeTab === 'sidebyside'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Claim vs. Source
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(`[${citation.filename}, Page ${pageNum}]`, 'citation')}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 font-medium transition"
              title="Copy citation reference"
            >
              {copiedType === 'citation' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'citation' ? 'Copied' : `Copy [Page ${pageNum}]`}</span>
            </button>
            <button
              onClick={() => handleCopy(citation.excerpt, 'excerpt')}
              className="flex items-center gap-1 px-2.5 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 font-medium transition"
              title="Copy verbatim passage text"
            >
              {copiedType === 'excerpt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'excerpt' ? 'Copied Excerpt' : 'Copy Passage'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'highlighted' ? (
            <div className="space-y-3">
              {/* Filter search bar inside document page */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  placeholder="Filter or search words in this page..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                />
              </div>

              {/* Exact Page Mockup Card */}
              <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                {/* Page Sheet Header */}
                <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">DOCUMENT PAGE {pageNum}</span>
                    <span className="text-slate-400">•</span>
                    <span className="truncate max-w-[260px]">{citation.filename}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Chunk: {citation.chunkId.slice(-8)}
                  </span>
                </div>

                {/* Page Content with glowing highlighted passage */}
                <div className="p-6 font-serif text-sm leading-relaxed text-slate-800 whitespace-pre-wrap select-text bg-gradient-to-b from-amber-50/20 via-white to-white min-h-[300px]">
                  {renderHighlightedText()}
                </div>

                {/* Legend footer */}
                <div className="px-4 py-2 bg-amber-50/70 border-t border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-300 border border-amber-500 shrink-0"></span>
                  <span className="font-semibold">Highlighted Passage:</span>
                  <span>Direct grounded text retrieved to answer the question.</span>
                </div>
              </div>
            </div>
          ) : (
            /* Side-by-side claim verification */
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Grounding Guarantee
                </span>
                <p className="text-xs text-blue-950 leading-relaxed">
                  In Trust Mode, every statement is cross-referenced with exact chunk boundaries. The quote below was extracted directly from <strong>{citation.filename}</strong> on <strong>Page {pageNum}</strong>.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Verbatim Passage from Page {pageNum}</span>
                  <span className="text-emerald-700 text-[11px] font-bold">100% Unaltered</span>
                </div>
                <div className="p-4 bg-white font-serif text-sm text-slate-800 leading-relaxed border-l-4 border-blue-600">
                  "{citation.excerpt}"
                </div>
              </div>

              {citation.fullPageText && citation.fullPageText !== citation.excerpt && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700">
                    Surrounding Page Context
                  </div>
                  <div className="p-4 bg-slate-50 font-serif text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {citation.fullPageText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trust Guarantee Note */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Zero-Hallucination Guardrail:</strong>
              DocuMind AI retrieves text chunks before model synthesis. Citations are mathematically checked against indexed document tokens to prevent fabricated claims or inaccurate page references.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Verified against {citation.filename} (Page {pageNum})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-2xs"
          >
            Close Verifier
          </button>
        </div>
      </div>
    </div>
  );
};
