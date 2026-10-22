import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  FileText,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Send,
  Languages,
  Check,
  Copy,
  Settings,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { DocumentItem, Citation, PassageDisagreement } from '../types/index.ts';
import { INDIAN_LANGUAGES } from '../utils/indianLanguages.ts';

interface VoiceTurn {
  id: string;
  question: string;
  answer: string;
  citations: Citation[];
  insufficientEvidence?: boolean;
  conflicts?: string[];
  disagreements?: PassageDisagreement[];
  language: string;
  timestamp: string;
}

interface VoiceAssistantViewProps {
  documents: DocumentItem[];
  onInspectCitation: (citation: Citation) => void;
  onOpenDocument?: (doc: DocumentItem) => void;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({
  documents,
  onInspectCitation,
  onOpenDocument
}) => {
  // State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoSpeakAnswer, setAutoSpeakAnswer] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [activeVoiceTurn, setActiveVoiceTurn] = useState<VoiceTurn | null>(null);
  const [history, setHistory] = useState<VoiceTurn[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Visualizer State
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const readyDocs = documents.filter(d => d.status === 'ready');
  const currentLangObj = INDIAN_LANGUAGES.find(l => l.code === selectedLanguage) || INDIAN_LANGUAGES[0];

  // Initialize Speech Synthesis and Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Try to find matching voice for current language
        const match = voices.find(v => v.lang.startsWith(currentLangObj.speechCode.split('-')[0]));
        if (match) {
          setSelectedVoiceURI(match.voiceURI);
        } else if (voices.length > 0 && !selectedVoiceURI) {
          setSelectedVoiceURI(voices[0].voiceURI);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Update voice selection when language changes
  useEffect(() => {
    if (availableVoices.length > 0) {
      const match = availableVoices.find(v =>
        v.lang.toLowerCase().startsWith(currentLangObj.speechCode.toLowerCase().split('-')[0])
      );
      if (match) {
        setSelectedVoiceURI(match.voiceURI);
      }
    }
  }, [selectedLanguage, availableVoices]);

  // Handle Speech Recognition setup
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or enter your question in the text box below.'
      );
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = currentLangObj.speechCode || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
        startMicVisualizer();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }
        if (final) {
          setFinalTranscript(final);
          setInterimTranscript('');
          handleAskQuestion(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(
            'Microphone access was denied or is blocked in this window. You can type questions aloud below or choose a suggestion.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please tap the microphone and speak clearly.');
        } else {
          setSpeechError(`Speech recognition: ${event.error}. You can also type your query below.`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopMicVisualizer();
      };

      return recognition;
    } catch (err: any) {
      setSpeechError('Could not initialize speech recognition: ' + err.message);
      return null;
    }
  };

  // Start Mic Audio Visualizer using Web Audio API or fallback simulation
  const startMicVisualizer = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
        return;
      }
    } catch (e) {
      // Fallback pulse simulation if getUserMedia is denied in iframe
      const fallbackPulse = () => {
        setAudioLevel(prev => {
          const next = Math.floor(Math.random() * 40) + 20;
          return next;
        });
        animFrameRef.current = requestAnimationFrame(fallbackPulse);
      };
      fallbackPulse();
    }
  };

  const stopMicVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const startListening = () => {
    stopSpeaking();
    setSpeechError(null);
    setInterimTranscript('');
    setFinalTranscript('');

    const rec = initSpeechRecognition();
    if (rec) {
      recognitionRef.current = rec;
      try {
        rec.start();
      } catch (err: any) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    stopMicVisualizer();
  };

  // Text-To-Speech Clean Spoken Output
  const cleanTextForSpeech = (text: string): string => {
    // Strip markdown formatting, code ticks, and [Page X] brackets to sound natural
    return text
      .replace(/\[(?:Page\s*\d+|Chunk\s*\d+|Section\s*[^\]]+)\]/gi, '')
      .replace(/\[\d+\]/g, '')
      .replace(/[*_#`~>]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;

    // Cancel any existing speech
    synthRef.current.cancel();

    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utteranceRef.current = utterance;
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.lang = currentLangObj.speechCode || 'en-US';

    if (selectedVoiceURI) {
      const v = availableVoices.find(voice => voice.voiceURI === selectedVoiceURI);
      if (v) utterance.voice = v;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // Execute Question against Document RAG Engine
  const handleAskQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isProcessing) return;

    stopSpeaking();
    setIsProcessing(true);
    setSpeechError(null);

    try {
      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          documentIds: selectedDocIds.length > 0 ? selectedDocIds : undefined,
          trustMode: true,
          targetLanguage: selectedLanguage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process voice query');

      const turn: VoiceTurn = {
        id: `voice_${Date.now()}`,
        question: q,
        answer: data.answer,
        citations: data.citations || [],
        insufficientEvidence: data.insufficientEvidence || false,
        conflicts: data.conflicts || [],
        disagreements: data.disagreements || [],
        language: data.language || selectedLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setActiveVoiceTurn(turn);
      setHistory(prev => [turn, ...prev]);

      // If auto-speak is enabled, immediately read out the answer
      if (autoSpeakAnswer && data.answer) {
        speakText(data.answer);
      }
    } catch (err: any) {
      setSpeechError(err.message || 'Error retrieving document answer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim() || isProcessing) return;
    const text = manualText.trim();
    setManualText('');
    setFinalTranscript(text);
    handleAskQuestion(text);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sample prompt questions tailored to ready documents
  const samplePrompts = [
    'What are the mandatory eligibility criteria in Section 2?',
    'What is the final submission deadline and penalty for delay?',
    'What are the key policy differences between the 2026 and 2027 standards?',
    'What financial documentation or audits are required for approval?'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Voice Assistant Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glowing backdrop rings */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Voice-Based Document Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ask Aloud & Listen to Grounded Answers
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Speak your document questions naturally. DocuMind searches indexed pages, delivers verified answers spoken aloud, and pins exact source passages with interactive page citations on screen.
            </p>
          </div>

          {/* Quick Controls Card */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-300" />
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="bg-slate-800/90 text-white text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title="Select language for speech recognition and explanation"
              >
                {INDIAN_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                const next = !autoSpeakAnswer;
                setAutoSpeakAnswer(next);
                if (!next) stopSpeaking();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                autoSpeakAnswer
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Automatically read answers aloud when retrieved"
            >
              {autoSpeakAnswer ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{autoSpeakAnswer ? 'Auto-Speak: ON' : 'Auto-Speak: OFF'}</span>
            </button>

            {/* Speech Rate Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl px-2 py-1 text-xs text-slate-300 border border-slate-700">
              <span className="text-[11px] text-slate-400">Speed:</span>
              {[0.9, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    setSpeechRate(rate);
                    if (isSpeaking) {
                      stopSpeaking();
                      if (activeVoiceTurn) speakText(activeVoiceTurn.answer);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition ${
                    speechRate === rate
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector: Filter to specific documents if desired */}
      {readyDocs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <ListFilter className="w-4 h-4 text-emerald-600" />
            <span>Document Target Scope:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDocIds([])}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedDocIds.length === 0
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Indexed Documents ({readyDocs.length})
            </button>
            {readyDocs.map(doc => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedDocIds(selectedDocIds.filter(id => id !== doc.id));
                    } else {
                      setSelectedDocIds([...selectedDocIds, doc.id]);
                    }
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition border ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[140px]">{doc.filename}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Voice Hero on Left, Live Document References on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Voice Interaction & Live Spoken Readout (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audio Visualizer & Push-to-Talk Pod */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Speech Error Banner if permission or browser issue occurs */}
            {speechError && (
              <div className="w-full mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-left animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 flex-1">
                  <p className="font-semibold text-amber-900">Audio Notice</p>
                  <p>{speechError}</p>
                </div>
                <button
                  onClick={() => setSpeechError(null)}
                  className="text-amber-600 hover:text-amber-900 text-xs font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Central Animated Mic Orb */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Outer pulsing rings when listening */}
              {isListening && (
                <>
                  <div
                    className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-ping pointer-events-none"
                    style={{ animationDuration: '2s' }}
                  />
                  <div
                    className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none"
                    style={{ transform: `scale(${1 + audioLevel / 120})` }}
                  />
                </>
              )}

              {/* Pulsing rings when speaking answer */}
              {isSpeaking && !isPaused && (
                <div className="absolute w-40 h-40 rounded-full bg-teal-500/15 animate-pulse pointer-events-none" />
              )}

              {/* Main Button */}
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                disabled={isProcessing}
                className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 ${
                  isListening
                    ? 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-200 shadow-rose-300 animate-pulse'
                    : isProcessing
                    ? 'bg-slate-700 text-slate-300 cursor-wait'
                    : isSpeaking
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-200 shadow-emerald-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 focus:ring-emerald-200 shadow-emerald-300'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
              >
                {isListening ? (
                  <>
                    <Square className="w-8 h-8 fill-current mb-1" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Stop</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin mb-1" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">Thinking</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {isSpeaking ? 'Speaking' : 'Speak'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Audio Waveform Bars Simulation */}
            <div className="flex items-center justify-center gap-1.5 h-8 my-2">
              {[40, 70, 30, 90, 60, 85, 45, 95, 55, 75, 35, 80, 50, 65, 40].map((baseHeight, idx) => {
                let dynamicHeight = 6;
                if (isListening) {
                  dynamicHeight = Math.max(8, Math.min(32, (baseHeight * (audioLevel + 20)) / 100));
                } else if (isSpeaking && !isPaused) {
                  dynamicHeight = Math.max(8, Math.min(28, (baseHeight * 0.7 + (idx % 4) * 4)));
                }

                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isListening
                        ? 'bg-rose-500'
                        : isSpeaking
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                    style={{ height: `${dynamicHeight}px` }}
                  />
                );
              })}
            </div>

            {/* Status & Live Transcribing Indicator */}
            <div className="mt-2 space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {isListening
                  ? 'Listening to your voice...'
                  : isProcessing
                  ? 'Searching documents & synthesizing answer...'
                  : isSpeaking
                  ? 'Reading grounded answer aloud...'
                  : 'Tap microphone and ask your question'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isListening
                  ? `Speaking in ${currentLangObj.name}. Pause when finished or tap Stop.`
                  : isSpeaking
                  ? 'Source citations and page passages are displayed on the right.'
                  : `Language set to ${currentLangObj.name} (${currentLangObj.nativeName}). Tap to start.`}
              </p>
            </div>

            {/* Live interim / partial transcript */}
            {(isListening || interimTranscript) && (
              <div className="w-full mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left animate-in fade-in">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Live Transcription:
                </span>
                <p className="text-sm font-medium text-slate-800 italic">
                  "{interimTranscript || 'Listening for speech...'}"
                </p>
              </div>
            )}

            {/* Text Input Fallback if microphone is blocked or user prefers typing */}
            <form onSubmit={handleManualSubmit} className="w-full mt-5 flex items-center gap-2">
              <input
                type="text"
                value={manualText}
                onChange={e => setManualText(e.target.value)}
                placeholder={`Or type a question to speak (${currentLangObj.samplePrompt.substring(0, 45)}...)`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!manualText.trim() || isProcessing}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>

            {/* Quick vocal suggestion chips */}
            <div className="w-full mt-4 pt-4 border-t border-slate-100 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Sample Questions to Ask:
              </span>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFinalTranscript(prompt);
                      handleAskQuestion(prompt);
                    }}
                    disabled={isProcessing}
                    className="text-left px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 rounded-xl text-xs text-slate-700 transition"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Spoken Answer Display & Audio Playback Dock */}
          {activeVoiceTurn && (
            <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-3">
              {/* Question Banner */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <Mic className="w-3 h-3" /> Question Asked Aloud:
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    "{activeVoiceTurn.question}"
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {activeVoiceTurn.timestamp}
                </span>
              </div>

              {/* Answer Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Grounded Spoken Response:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(activeVoiceTurn.answer, activeVoiceTurn.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      title="Copy response text"
                    >
                      {copiedId === activeVoiceTurn.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                  {activeVoiceTurn.answer}
                </div>
              </div>

              {/* Audio Controls Dock */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isSpeaking && !isPaused ? (
                    <button
                      onClick={pauseSpeaking}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Speech</span>
                    </button>
                  ) : isPaused ? (
                    <button
                      onClick={resumeSpeaking}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Speech</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => speakText(activeVoiceTurn.answer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Listen Again</span>
                    </button>
                  )}

                  {(isSpeaking || isPaused) && (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium transition"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>

                {/* Spoken voice indicator */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] text-slate-500">
                    Voice playback active • Speed: {speechRate}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Voice Turns History Accordion */}
          {history.length > 1 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recent Spoken Turns ({history.length})
              </h4>
              <div className="divide-y divide-slate-100">
                {history.slice(1, 5).map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        "{item.question}"
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.answer.substring(0, 90)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setActiveVoiceTurn(item);
                          speakText(item.answer);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3" />
                        <span>Replay</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Relevant Document References Displayed on Screen (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Relevant Document References
                </h3>
                <p className="text-xs text-slate-500">
                  Grounded evidence excerpts & page citations matching spoken query
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                {activeVoiceTurn ? `${activeVoiceTurn.citations.length} Verified` : 'Live Grounding'}
              </span>
            </div>

            {/* Insufficient Evidence Warning Banner */}
            {activeVoiceTurn?.insufficientEvidence && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-amber-900 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Insufficient Document Evidence Detected</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  The uploaded documents do not contain direct evidence to substantiate this question. The system explicitly refused to fabricate or guess an answer.
                </p>
              </div>
            )}

            {/* Conflicting Passages Alert */}
            {activeVoiceTurn && activeVoiceTurn.disagreements && activeVoiceTurn.disagreements.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-rose-900 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Conflicting Statements Across Passages:</span>
                </div>
                {activeVoiceTurn.disagreements.map((dis, idx) => (
                  <div key={idx} className="text-xs text-rose-800 bg-white/70 p-2.5 rounded-xl border border-rose-100 space-y-1">
                    <p className="font-semibold">{dis.topic}</p>
                    <p className="text-[11px] text-rose-700">{dis.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Citations List */}
            {activeVoiceTurn && activeVoiceTurn.citations.length > 0 ? (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {activeVoiceTurn.citations.map((citation, index) => {
                  const scorePercent = citation.similarity
                    ? Math.round(citation.similarity * 100)
                    : 90;

                  return (
                    <div
                      key={citation.chunkId || index}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all space-y-3 group"
                    >
                      {/* Document Source Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 truncate max-w-[190px]">
                              {citation.filename}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              <MapPin className="w-3 h-3" />
                              {citation.pageNumber ? `Page ${citation.pageNumber}` : citation.pageOrLocation}
                            </span>
                          </div>
                        </div>

                        {/* Relevance Confidence Badge */}
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {scorePercent}% match
                          </span>
                        </div>
                      </div>

                      {/* Highlighted Passage Excerpt */}
                      <div className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed group-hover:border-emerald-200 transition">
                        "{citation.excerpt}"
                      </div>

                      {/* Verify Action Button */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          Chunk: #{index + 1}
                        </span>
                        <button
                          onClick={() => onInspectCitation(citation)}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 group-hover:underline"
                        >
                          <span>Inspect Full Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : activeVoiceTurn && !activeVoiceTurn.insufficientEvidence ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No direct text chunks cited for this response.</p>
              </div>
            ) : !activeVoiceTurn ? (
              /* Idle state placeholder */
              <div className="py-12 px-4 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">
                    Document References Will Appear Here
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    When you speak a question aloud, DocuMind will highlight the exact page numbers, confidence score, and text excerpts right here.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 space-y-1.5">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    How Grounding Works:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                    <li>Speech is transcribed and converted to semantic vector query.</li>
                    <li>Only passages with cosine similarity &gt; threshold are returned.</li>
                    <li>Every answer is bound to exact page coordinates.</li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
