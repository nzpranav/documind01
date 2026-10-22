import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  FileText,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Share2,
  Eye,
  Award
} from 'lucide-react';
import { DocumentItem, StudyMaterial, StudyMCQ, StudyFlashcard, Citation } from '../types/index.ts';

interface StudyModeViewProps {
  documents: DocumentItem[];
  onGenerateStudy: (docIds: string[]) => Promise<StudyMaterial | null>;
  isGenerating: boolean;
  onInspectCitation?: (citation: Citation) => void;
}

export const StudyModeView: React.FC<StudyModeViewProps> = ({
  documents,
  onGenerateStudy,
  isGenerating,
  onInspectCitation
}) => {
  const readyDocs = documents.filter(d => d.status === 'ready');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    readyDocs.length > 0 ? [readyDocs[0].id] : []
  );

  // Active sub-tab inside study mode
  const [studyTab, setStudyTab] = useState<'summaries' | 'mcq' | 'flashcards' | 'questions'>('summaries');

  // Study Material state
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);

  // MCQ state
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState(false);

  // Imp Questions accordion state
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const handleToggleDoc = (id: string) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRunGenerate = async () => {
    if (selectedDocIds.length === 0) return;
    const res = await onGenerateStudy(selectedDocIds);
    if (res) {
      setStudyMaterial(res);
      setMcqAnswers({});
      setRevealedExplanations({});
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      setMasteredCards({});
    }
  };

  const handleSelectMCQOption = (mcqId: string, optionIdx: number) => {
    if (mcqAnswers[mcqId] !== undefined) return; // already answered
    setMcqAnswers(prev => ({ ...prev, [mcqId]: optionIdx }));
    setRevealedExplanations(prev => ({ ...prev, [mcqId]: true }));
  };

  const handleResetQuiz = () => {
    setMcqAnswers({});
    setRevealedExplanations({});
  };

  const handleNextCard = () => {
    if (!studyMaterial || studyMaterial.flashcards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex(prev => (prev + 1) % studyMaterial.flashcards.length);
  };

  const handlePrevCard = () => {
    if (!studyMaterial || studyMaterial.flashcards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex(
      prev => (prev - 1 + studyMaterial.flashcards.length) % studyMaterial.flashcards.length
    );
  };

  const handleToggleMastered = (cardId: string) => {
    setMasteredCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleToggleQuestion = (qId: string) => {
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleExportStudyGuide = () => {
    if (!studyMaterial) return;

    let md = `# DocuMind AI Smart Study Guide\n`;
    md += `Source Documents: ${studyMaterial.docNames.join(', ')}\nGenerated: ${new Date(studyMaterial.generatedAt).toLocaleString()}\n\n`;

    // 1. Summaries
    md += `## 1. Short Notes & Key Summaries\n\n`;
    studyMaterial.summaries.forEach((s, i) => {
      md += `### ${i + 1}. ${s.topic} (${s.pageOrLocation})\n`;
      md += `${s.summary}\n\nKey Takeaways:\n`;
      s.keyPoints.forEach(kp => {
        md += `- ${kp}\n`;
      });
      md += `\n`;
    });

    // 2. MCQs
    md += `## 2. Practice MCQs with Answers\n\n`;
    studyMaterial.mcqs.forEach((m, i) => {
      md += `**Q${i + 1}: ${m.question}** (${m.pageOrLocation})\n`;
      m.options.forEach((opt, idx) => {
        const isCorrect = idx === m.correctIndex;
        md += `  ${String.fromCharCode(65 + idx)}) ${opt} ${isCorrect ? '✓ [Correct]' : ''}\n`;
      });
      md += `Explanation: ${m.explanation}\n\n`;
    });

    // 3. Flashcards
    md += `## 3. Flashcards for Quick Revision\n\n`;
    studyMaterial.flashcards.forEach((f, i) => {
      md += `**Card ${i + 1}**\nFront: ${f.front}\nBack: ${f.back}\nLocation: ${f.pageOrLocation}\n\n`;
    });

    // 4. Important Questions
    md += `## 4. Important Examination Questions & Model Answers\n\n`;
    studyMaterial.impQuestions.forEach((q, i) => {
      md += `### Q${i + 1} [${q.type}]: ${q.question} (${q.pageOrLocation})\n`;
      md += `Key Concepts: ${q.keyConcepts.join(', ')}\n\n`;
      md += `**Model Answer:**\n${q.modelAnswer}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocuMind_Study_Guide_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    if (!studyMaterial) return;
    navigator.clipboard.writeText(
      studyMaterial.summaries.map(s => `## ${s.topic}\n${s.summary}\n${s.keyPoints.map(kp => `- ${kp}`).join('\n')}`).join('\n\n')
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute quiz score
  const answeredCount = Object.keys(mcqAnswers).length;
  const correctCount = studyMaterial
    ? studyMaterial.mcqs.filter(m => mcqAnswers[m.id] === m.correctIndex).length
    : 0;

  const masteredCount = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              Smart Study Mode
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Study Pack Generator
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              Turn dense PDFs and TXT files into comprehensive revision notes, practice MCQs, interactive flashcards, and high-yield exam questions.
            </p>
          </div>

          {studyMaterial && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Notes'}
              </button>
              <button
                onClick={handleExportStudyGuide}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export Study Guide (.md)
              </button>
            </div>
          )}
        </div>

        {/* Document Selection Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-700">Source Documents:</span>
            {readyDocs.map(d => {
              const isSelected = selectedDocIds.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleToggleDoc(d.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="max-w-[160px] truncate">{d.filename}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRunGenerate}
            disabled={isGenerating || selectedDocIds.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Smart Study Pack...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {studyMaterial ? 'Regenerate Study Pack' : 'Generate Study Pack'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* If No Study Material Generated Yet: Explainer Cards */}
      {!studyMaterial && !isGenerating && (
        <div className="bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-white rounded-2xl border border-indigo-100 p-8 text-center space-y-6 shadow-sm">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Master Your Documents in Minutes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select one or more documents above and click "Generate Study Pack". DocuMind AI will synthesize 4 comprehensive learning modules grounded directly in the document text.
            </p>
          </div>

          {/* 4 Feature Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-1.5">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg inline-block">
                <BookOpen className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold text-slate-900">1. Short Notes & Summaries</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Core concepts, structured section takeaways, and high-yield bulleted summaries with citations.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-1.5">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg inline-block">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold text-slate-900">2. Interactive MCQs</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Exam-style multiple choice questions with immediate option validation and grounded explanations.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-1.5">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg inline-block">
                <Layers className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold text-slate-900">3. 3D Flashcards Deck</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Interactive double-sided cards for active recall, concept memorization, and mastery tracking.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-1.5">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-lg inline-block">
                <HelpCircle className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold text-slate-900">4. Important Questions</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Short and long answer examination questions with model answers and key concepts to cover.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Study Material Tabs & Workspace */}
      {studyMaterial && (
        <div className="space-y-6 animate-in fade-in">
          {/* Sub Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs">
            <button
              onClick={() => setStudyTab('summaries')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition shrink-0 ${
                studyTab === 'summaries'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Short Notes & Summaries</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                {studyMaterial.summaries.length}
              </span>
            </button>

            <button
              onClick={() => setStudyTab('mcq')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition shrink-0 ${
                studyTab === 'mcq'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Practice MCQs</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                {studyMaterial.mcqs.length}
              </span>
            </button>

            <button
              onClick={() => setStudyTab('flashcards')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition shrink-0 ${
                studyTab === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Revision Flashcards</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                {studyMaterial.flashcards.length}
              </span>
            </button>

            <button
              onClick={() => setStudyTab('questions')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition shrink-0 ${
                studyTab === 'questions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Important Exam Questions</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                {studyMaterial.impQuestions.length}
              </span>
            </button>
          </div>

          {/* TAB 1: SHORT NOTES & SUMMARIES */}
          {studyTab === 'summaries' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  Synthesized Section Notes ({studyMaterial.summaries.length} topics)
                </span>
                <span>Grounded in {studyMaterial.docNames.join(', ')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {studyMaterial.summaries.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-200 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {item.topic}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 shrink-0">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.pageOrLocation}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {item.summary}
                      </p>

                      {/* Key Points */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Key Takeaways & Rules:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-800">
                          {item.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Excerpt footer */}
                    {item.evidenceExcerpt && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 font-serif italic line-clamp-2">
                        "{item.evidenceExcerpt}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MCQS WITH ANSWERS */}
          {studyTab === 'mcq' && (
            <div className="space-y-6">
              {/* Score Banner */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">MCQ Practice Quiz</h3>
                    <p className="text-xs text-slate-500">
                      Answered: {answeredCount} / {studyMaterial.mcqs.length} | Correct: {correctCount} (
                      {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetQuiz}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Quiz
                </button>
              </div>

              {/* MCQs List */}
              <div className="space-y-5">
                {studyMaterial.mcqs.map((mcq, idx) => {
                  const hasAnswered = mcqAnswers[mcq.id] !== undefined;
                  const selectedOption = mcqAnswers[mcq.id];
                  const isCorrect = selectedOption === mcq.correctIndex;

                  return (
                    <div
                      key={mcq.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm leading-relaxed">
                            {mcq.question}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
                          <MapPin className="w-3 h-3" />
                          {mcq.pageOrLocation}
                        </span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {mcq.options.map((option, optIdx) => {
                          let optStyle =
                            'bg-slate-50 border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-300 text-slate-800';

                          if (hasAnswered) {
                            if (optIdx === mcq.correctIndex) {
                              optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                            } else if (optIdx === selectedOption && !isCorrect) {
                              optStyle = 'bg-rose-50 border-rose-300 text-rose-950 line-through';
                            } else {
                              optStyle = 'bg-slate-50 border-slate-200 opacity-60 text-slate-600';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectMCQOption(mcq.id, optIdx)}
                              disabled={hasAnswered}
                              className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 ${optStyle}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-600 shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="truncate">{option}</span>
                              </div>

                              {hasAnswered && optIdx === mcq.correctIndex && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {hasAnswered && (
                        <div
                          className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 animate-in fade-in ${
                            isCorrect
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50/60 border-rose-200 text-rose-950'
                          }`}
                        >
                          <div className="font-semibold flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="text-emerald-700">✓ Correct Answer!</span>
                            ) : (
                              <span className="text-rose-700">✗ Incorrect. Correct: {String.fromCharCode(65 + mcq.correctIndex)}</span>
                            )}
                          </div>
                          <p className="text-slate-700">{mcq.explanation}</p>
                          <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            Source: {mcq.sourceFilename} ({mcq.pageOrLocation})
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 3D FLASHCARDS DECK */}
          {studyTab === 'flashcards' && studyMaterial.flashcards.length > 0 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Deck Controls Header */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  Card <strong className="text-slate-900">{currentCardIndex + 1}</strong> of{' '}
                  <strong className="text-slate-900">{studyMaterial.flashcards.length}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                    {masteredCount} / {studyMaterial.flashcards.length} Mastered
                  </span>
                </div>
              </div>

              {/* 3D Flashcard */}
              {(() => {
                const currentCard = studyMaterial.flashcards[currentCardIndex];
                const isMastered = masteredCards[currentCard.id] || false;

                return (
                  <div className="relative perspective-1000">
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`w-full min-h-[300px] p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 shadow-lg flex flex-col justify-between ${
                        isFlipped
                          ? 'bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white border-indigo-700 shadow-indigo-900/20'
                          : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300 shadow-slate-200/50'
                      }`}
                    >
                      {/* Card Top Label */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            isFlipped
                              ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {isFlipped ? 'Answer / Solution' : 'Question / Concept'}
                        </span>

                        <span
                          className={`text-xs flex items-center gap-1 ${
                            isFlipped ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {currentCard.pageOrLocation}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="py-6 text-center space-y-3">
                        <h3
                          className={`text-lg sm:text-xl font-bold leading-relaxed ${
                            isFlipped ? 'text-white font-sans' : 'text-slate-900 font-sans'
                          }`}
                        >
                          {isFlipped ? currentCard.back : currentCard.front}
                        </h3>

                        {!isFlipped && currentCard.hint && showHint && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs inline-block text-left animate-in fade-in">
                            <strong>Hint:</strong> {currentCard.hint}
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Hint & Flip Action */}
                      <div className="flex items-center justify-between text-xs pt-2">
                        {!isFlipped && currentCard.hint ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowHint(!showHint);
                            }}
                            className="text-indigo-600 hover:underline font-medium text-[11px]"
                          >
                            {showHint ? 'Hide Hint' : 'Show Hint'}
                          </button>
                        ) : (
                          <div />
                        )}

                        <span
                          className={`text-[11px] font-medium flex items-center gap-1 ${
                            isFlipped ? 'text-indigo-300' : 'text-slate-400'
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Click card to flip
                        </span>
                      </div>
                    </div>

                    {/* Mastered & Navigation Controls */}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <button
                        onClick={handlePrevCard}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition shadow-sm"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Previous
                      </button>

                      <button
                        onClick={() => handleToggleMastered(currentCard.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                          isMastered
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        {isMastered ? 'Mastered!' : 'Mark as Mastered'}
                      </button>

                      <button
                        onClick={handleNextCard}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
                      >
                        Next
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: IMPORTANT EXAM QUESTIONS */}
          {studyTab === 'questions' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  Examination & Review Questions ({studyMaterial.impQuestions.length})
                </span>
                <span>Includes model answers and core concepts to cover</span>
              </div>

              <div className="space-y-4">
                {studyMaterial.impQuestions.map((q, idx) => {
                  const isExpanded = expandedQuestions[q.id] || false;
                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-indigo-200 transition"
                    >
                      {/* Question Top */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {q.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm leading-relaxed">
                            {q.question}
                          </h4>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
                          <MapPin className="w-3 h-3" />
                          {q.pageOrLocation}
                        </span>
                      </div>

                      {/* Key Concepts pill tags */}
                      {q.keyConcepts && q.keyConcepts.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="text-[11px] font-semibold text-slate-500">Key Concepts:</span>
                          {q.keyConcepts.map((concept, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Expand Model Answer Toggle */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleToggleQuestion(q.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Model Answer
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Reveal Grounded Model Answer
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2 text-xs leading-relaxed animate-in fade-in">
                            <div className="font-semibold text-indigo-950">Model Answer:</div>
                            <p className="text-slate-800 whitespace-pre-wrap">{q.modelAnswer}</p>

                            {q.evidenceExcerpt && (
                              <div className="pt-2 mt-2 border-t border-indigo-200/60 text-[11px] text-slate-600 font-serif italic">
                                "{q.evidenceExcerpt}"
                              </div>
                            )}

                            <div className="text-[10px] text-slate-500 pt-1">
                              Source: {q.sourceFilename} ({q.pageOrLocation})
                            </div>
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
      )}
    </div>
  );
};
