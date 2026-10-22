import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Download,
  AlertTriangle,
  Info,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Copy,
  Check,
  FileText,
  MapPin,
  ExternalLink,
  Loader2,
  Search,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Languages,
  Volume2,
  VolumeX,
  Scale,
  HelpCircle,
  AlertOctagon,
  Mic
} from 'lucide-react';
import { DocumentItem, ChatMessage, Citation, PassageDisagreement } from '../types/index.ts';
import { INDIAN_LANGUAGES, INSUFFICIENT_EVIDENCE_MESSAGES } from '../utils/indianLanguages.ts';

interface ChatViewProps {
  documents: DocumentItem[];
  messages: ChatMessage[];
  onSendMessage: (
    question: string,
    documentIds: string[],
    trustMode?: boolean,
    targetLanguage?: string
  ) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
  onInspectCitation: (citation: Citation) => void;
  onProvideFeedback?: (msgId: string, feedback: 'helpful' | 'unhelpful' | 'citation_issue') => void;
  onSwitchToVoice?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  documents,
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  onInspectCitation,
  onProvideFeedback,
  onSwitchToVoice
}) => {
  const [input, setInput] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [trustMode, setTrustMode] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const readyDocs = documents.filter(d => d.status === 'ready');
  const currentLangObj = INDIAN_LANGUAGES.find(l => l.code === selectedLanguage) || INDIAN_LANGUAGES[0];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    onSendMessage(text, selectedDocIds, trustMode, selectedLanguage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyAnswer = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, msgId: string, langCode: string = 'en') => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean citation tokens for smooth speech
    const cleanText = text.replace(/\[(?:Page\s*)?\d+(?:,[^\]]+)?\]/gi, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langInfo = INDIAN_LANGUAGES.find(l => l.code === langCode);
    if (langInfo?.speechCode) {
      utterance.lang = langInfo.speechCode;
    }

    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map(
        m =>
          `[${m.role.toUpperCase()}] (${new Date(m.timestamp).toLocaleTimeString()})\nLanguage: ${m.language || 'en'}\n${m.content}\n${
            m.citations && m.citations.length > 0
              ? 'Sources:\n' +
                m.citations
                  .map(
                    (c, i) =>
                      ` [${i + 1}] ${c.filename} (${c.pageOrLocation}, Page ${c.pageNumber || 1}): "${c.excerpt}"`
                  )
                  .join('\n')
              : ''
          }\n${
            m.disagreements && m.disagreements.length > 0
              ? 'Contradictions Detected:\n' +
                m.disagreements
                  .map(
                    d =>
                      ` - ${d.topic}: ${d.explanation} [A: ${d.passageA.pageOrLocation} vs B: ${d.passageB.pageOrLocation}]`
                  )
                  .join('\n')
              : ''
          }\n-----------------------------------\n`
      )
      .join('\n');

    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocuMind_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleDoc = (docId: string) => {
    setSelectedDocIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAllDocs = () => {
    if (selectedDocIds.length === readyDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(readyDocs.map(d => d.id));
    }
  };

  // Helper function to render text with interactive citations [Page X] or [1], [2]
  const renderMessageContentWithCitations = (content: string, citations?: Citation[]) => {
    if (!citations || citations.length === 0) {
      return <span>{content}</span>;
    }

    // Regular expression matching [Page X] or [Page X, ...] or [1], [2]
    const tokenRegex = /(\[(?:Page\s*\d+|[1-9]\d*)\])/gi;
    const parts = content.split(tokenRegex);

    return (
      <span>
        {parts.map((part, index) => {
          if (!tokenRegex.test(part)) {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          }

          // Extract number or page number
          const pageMatch = part.match(/Page\s*(\d+)/i);
          const numMatch = part.match(/\[(\d+)\]/);

          let matchingCitation: Citation | undefined;
          if (pageMatch) {
            const pNum = parseInt(pageMatch[1], 10);
            matchingCitation = citations.find(c => c.pageNumber === pNum) || citations[0];
          } else if (numMatch) {
            const idx = parseInt(numMatch[1], 10) - 1;
            matchingCitation = citations[idx] || citations[0];
          }

          if (matchingCitation) {
            const pageDisplay = matchingCitation.pageNumber || 1;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onInspectCitation(matchingCitation!)}
                className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md font-semibold text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-all shadow-2xs hover:scale-105 cursor-pointer align-baseline"
                title={`Verify answer directly against Page ${pageDisplay} highlighted passage`}
              >
                <BookOpen className="w-3 h-3 text-emerald-700" />
                <span>Page {pageDisplay}</span>
                <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
              </button>
            );
          }

          return (
            <span key={index} className="font-semibold text-blue-600">
              {part}
            </span>
          );
        })}
      </span>
    );
  };

  const defaultPrompts = [
    'What is the tax credit in the clean energy policy?',
    'What are the mandatory submission deadlines and late filing fees?',
    'Compare the project eligibility threshold between 2026 and 2027.',
    'What is the population of Mars?' // Benchmark test for strict Insufficient Evidence handling
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Controls: Document Scope Selector, Multilingual Explain Mode & Trust Mode */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
        {/* Document Scope Selector */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            Scope:
          </span>

          <button
            type="button"
            onClick={handleSelectAllDocs}
            className={`px-2.5 py-1 rounded-lg border font-medium transition ${
              selectedDocIds.length === 0 || selectedDocIds.length === readyDocs.length
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            All Docs ({readyDocs.length})
          </button>

          {readyDocs.map(d => {
            const isSelected = selectedDocIds.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => handleToggleDoc(d.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium transition max-w-[170px] truncate ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={d.filename}
              >
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{d.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Multilingual Selector & Trust Mode */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Multilingual Explain Mode Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs shadow-2xs">
            <Languages className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700 hidden sm:inline">Explain in:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs font-bold text-indigo-900 focus:outline-none cursor-pointer"
            >
              {INDIAN_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Trust Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setTrustMode(!trustMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-2xs ${
              trustMode
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="When active, every answer includes exact page citations and clickable highlighted passages"
          >
            {trustMode ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <span className="hidden sm:inline">Trust Mode</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                trustMode ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {trustMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Switch to Voice Assistant Button */}
          {onSwitchToVoice && (
            <button
              type="button"
              onClick={onSwitchToVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 shadow-2xs"
              title="Switch to Voice Assistant mode to ask questions aloud"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Voice Assistant</span>
              <span className="sm:hidden">Voice</span>
            </button>
          )}

          {/* Clear & Export Buttons */}
          {messages.length > 0 && (
            <>
              <button
                onClick={handleExportChat}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                title="Export chat transcript"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={onClearChat}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition"
                title="Clear chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Multilingual & Trust Mode Active Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-b border-emerald-100 flex flex-wrap items-center justify-between text-xs text-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-950">Active Explanatory Engine:</span>
          <span className="text-slate-600 hidden md:inline">
            Answers are strictly grounded in document pages with zero hallucinations, explained in{' '}
            <strong className="text-indigo-800">{currentLangObj.nativeName} ({currentLangObj.name})</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
            🌐 {currentLangObj.nativeName} Mode
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
            100% Verifiable Source Grounding
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">DocuMind Multilingual Intelligence</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ask questions in any Indian language (हिन्दी, தமிழ், తెలుగు, বাংলা, मराठी, etc.) or English. DocuMind guarantees strict grounding, flags missing evidence, alerts you to passage contradictions, and provides clickable page verification citations.
              </p>
            </div>

            {readyDocs.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs text-left flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">No ready documents in scope:</strong>
                  Please upload a PDF or TXT document, or click "Load Sample Docs" in the top bar to test the assistant.
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3 pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Suggested Questions (Click to Ask):
                </p>

                {/* Show Indian Language Sample Prompt First if active */}
                {selectedLanguage !== 'en' && (
                  <button
                    onClick={() => {
                      setInput(currentLangObj.samplePrompt);
                      inputRef.current?.focus();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200 text-xs text-indigo-950 font-medium transition flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{currentLangObj.samplePrompt}</span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 transition shrink-0 ml-2" />
                  </button>
                )}

                <div className="flex flex-col gap-2">
                  {defaultPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(p);
                        inputRef.current?.focus();
                      }}
                      className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 text-xs text-slate-700 transition flex items-center justify-between group"
                    >
                      <span>{p}</span>
                      <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-3 flex-1 min-w-0">
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white ml-auto rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Assistant response formatting */}
                  {msg.role === 'assistant' ? (
                    <div className="space-y-3.5">
                      {/* Top Badges: Trust Mode + Language */}
                      <div className="flex flex-wrap items-center gap-2">
                        {msg.trustMode && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Trust Mode Verified • Exact Page Attribution</span>
                          </div>
                        )}
                        {msg.language && msg.language !== 'en' && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-semibold">
                            <Languages className="w-3 h-3 text-indigo-600" />
                            <span>
                              {INDIAN_LANGUAGES.find(l => l.code === msg.language)?.nativeName || msg.language}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Insufficient Evidence Warning Banner */}
                      {msg.insufficientEvidence && (
                        <div className="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs space-y-2 shadow-2xs">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                            <AlertOctagon className="w-4 h-4 text-amber-600" />
                            <span>Notice: Insufficient Evidence in Document</span>
                          </div>
                          <p className="font-semibold text-amber-900 leading-relaxed">
                            {msg.content}
                          </p>
                          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                            <strong className="block font-bold">🛡️ Zero Hallucination Guarantee:</strong>
                            <p>
                              DocuMind strictly refuses to guess or invent facts outside the uploaded document. If this information is in another document, please select it in the Retrieval Scope above.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Passage Disagreement / Contradiction Warning */}
                      {((msg.disagreements && msg.disagreements.length > 0) || (msg.conflicts && msg.conflicts.length > 0)) && (
                        <div className="p-4 bg-purple-50/90 border-2 border-purple-300 rounded-2xl text-purple-950 text-xs space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
                            <Scale className="w-4 h-4 text-purple-700" />
                            <span>⚠️ Passage Disagreement Detected Across Sources</span>
                          </div>

                          <p className="text-purple-900 text-[11px]">
                            Retrieved passages contain conflicting statements or differing quantitative standards:
                          </p>

                          {msg.disagreements && msg.disagreements.length > 0 ? (
                            <div className="space-y-2.5">
                              {msg.disagreements.map((d, di) => (
                                <div key={di} className="p-3 bg-white rounded-xl border border-purple-200 space-y-2 shadow-2xs">
                                  <div className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    <span>{d.topic}</span>
                                  </div>
                                  <p className="text-slate-600 text-[11px]">{d.explanation}</p>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                    {/* Passage A */}
                                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                                      <div className="flex items-center justify-between font-bold text-slate-700 text-[10px]">
                                        <span>Source 1 ({d.passageA.filename || 'Doc 1'})</span>
                                        <span className="text-blue-600">{d.passageA.pageOrLocation}</span>
                                      </div>
                                      <p className="italic text-slate-800 font-serif">"{d.passageA.text}"</p>
                                    </div>

                                    {/* Passage B */}
                                    <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-200 space-y-1">
                                      <div className="flex items-center justify-between font-bold text-purple-900 text-[10px]">
                                        <span>Source 2 ({d.passageB.filename || 'Doc 2'})</span>
                                        <span className="text-purple-700">{d.passageB.pageOrLocation}</span>
                                      </div>
                                      <p className="italic text-slate-800 font-serif">"{d.passageB.text}"</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <ul className="list-disc list-inside text-[11px] text-purple-900 space-y-1">
                              {msg.conflicts?.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Main answer text with clickable citations */}
                      {!msg.insufficientEvidence && (
                        <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-sm">
                          {renderMessageContentWithCitations(msg.content, msg.citations)}
                        </div>
                      )}

                      {/* Footer Actions: Copy, Read Aloud & Feedback */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyAnswer(msg.content, msg.id)}
                            className="flex items-center gap-1 px-2 py-1 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>

                          {/* Listen / Read Aloud Button */}
                          <button
                            onClick={() => handleSpeak(msg.content, msg.id, msg.language || selectedLanguage)}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition ${
                              isSpeakingId === msg.id
                                ? 'text-indigo-600 bg-indigo-50 font-semibold'
                                : 'hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Read answer aloud in preferred language voice"
                          >
                            {isSpeakingId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                                <span>Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen ({msg.language || selectedLanguage})</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onProvideFeedback?.(msg.id, 'helpful')}
                            className={`p-1.5 rounded transition ${
                              msg.feedback === 'helpful'
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Helpful & Verified"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onProvideFeedback?.(msg.id, 'unhelpful')}
                            className={`p-1.5 rounded transition ${
                              msg.feedback === 'unhelpful'
                                ? 'text-rose-600 bg-rose-50'
                                : 'hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Inaccurate or Unclear"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onProvideFeedback?.(msg.id, 'citation_issue')}
                            className={`p-1.5 rounded transition ${
                              msg.feedback === 'citation_issue'
                                ? 'text-amber-600 bg-amber-50'
                                : 'hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title="Citation does not support claim"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>

                {/* Grounded Source Passages & Exact Page Citations Section */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="space-y-2 pt-1 pl-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        Attributed Document Pages ({msg.citations.length})
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Click to verify highlighted passage
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.citations.map((c, idx) => {
                        const pNum = c.pageNumber || idx + 1;
                        return (
                          <div
                            key={c.chunkId || idx}
                            onClick={() => onInspectCitation(c)}
                            className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/40 hover:from-blue-50/60 hover:to-indigo-50/60 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition text-xs space-y-2 group shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-800 flex items-center gap-1 truncate max-w-[170px]" title={c.filename}>
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate">{c.filename}</span>
                              </span>

                              {/* Prominent Page Badge */}
                              <span className="px-2 py-0.5 rounded-md font-extrabold text-[11px] bg-blue-600 text-white shadow-2xs flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-blue-200" />
                                PAGE {pNum}
                              </span>
                            </div>

                            {/* Passage Excerpt with highlighted preview */}
                            <p className="text-slate-700 line-clamp-3 font-serif text-[11px] leading-relaxed bg-white/80 p-2 rounded-lg border border-slate-200/70">
                              <span className="font-semibold text-amber-900 bg-amber-100/70 px-1 rounded">
                                "{c.excerpt}"
                              </span>
                            </p>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                              {c.similarity !== undefined && (
                                <span className="text-emerald-700 font-semibold">
                                  {Math.round(c.similarity * 100)}% Match
                                </span>
                              )}
                              <span className="text-blue-700 group-hover:text-blue-900 group-hover:underline flex items-center gap-1 font-bold ml-auto">
                                Verify Page {pNum} Passage <ExternalLink className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-600 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>
                {selectedLanguage !== 'en'
                  ? `Retrieving passages, detecting contradictions, and formulating explanation in ${currentLangObj.nativeName} (${currentLangObj.name})...`
                  : trustMode
                  ? 'Trust Mode: Retrieving passages, matching page citations, and generating verified answer...'
                  : 'Searching vector index, verifying evidence, and grounding answer...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || readyDocs.length === 0}
            rows={2}
            placeholder={
              readyDocs.length === 0
                ? 'Upload a document or load sample docs above to start asking questions...'
                : selectedLanguage !== 'en'
                ? `Ask your question in any language (Explanation will be in ${currentLangObj.nativeName})...`
                : trustMode
                ? 'Ask a question in Trust Mode (Every answer will link to exact page citations)...'
                : 'Ask a question about your documents (Press Enter to send, Shift+Enter for new line)...'
            }
            className="flex-1 p-3 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
          />

          {onSwitchToVoice && (
            <button
              type="button"
              onClick={onSwitchToVoice}
              className="px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition shrink-0 shadow-2xs"
              title="Speak aloud with Voice Assistant"
            >
              <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Voice</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || isLoading || readyDocs.length === 0}
            className={`px-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 text-white ${
              trustMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {trustMode ? <ShieldCheck className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {selectedLanguage !== 'en' ? `Ask in ${currentLangObj.nativeName}` : trustMode ? 'Ask Trust RAG' : 'Ask RAG'}
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${trustMode ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            {selectedLanguage !== 'en'
              ? `Multilingual Engine active: Explaining in ${currentLangObj.nativeName} with strict page attribution.`
              : trustMode
              ? 'Trust Mode ON: Strict page-level attribution & verifiable highlighted passages enabled.'
              : 'Grounded in retrieved document chunks. Zero hallucinations enforced.'}
          </span>
          <span className="hidden sm:inline">Contradiction Detection & Zero Hallucination Guarantee Enabled</span>
        </div>
      </div>
    </div>
  );
};
