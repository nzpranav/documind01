import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Shield,
  Trash2,
  Save,
  Check,
  RefreshCw,
  Cpu,
  Database,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { RagSettings } from '../types/index.ts';

interface SettingsViewProps {
  settings: RagSettings;
  onUpdateSettings: (newSettings: RagSettings) => Promise<void>;
  onClearWorkspace: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearWorkspace
}) => {
  const [localSettings, setLocalSettings] = useState<RagSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateSettings(localSettings);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setLocalSettings({
      chunkSize: 800,
      chunkOverlap: 120,
      topK: 5,
      minRelevanceThreshold: 0.35
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Retrieval & RAG Settings</h2>
            <p className="text-xs text-slate-500">
              Tune chunking parameters, vector similarity thresholds, and inspect security rules.
            </p>
          </div>
        </div>
      </div>

      {/* RAG Tuning Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-600" />
          Document Chunking & Vector Search Tuning
        </h3>

        <div className="space-y-5">
          {/* Chunk Size */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-700">Chunk Size (characters)</label>
              <span className="font-mono text-blue-600 font-bold">{localSettings.chunkSize} chars</span>
            </div>
            <input
              type="range"
              min="300"
              max="2000"
              step="50"
              value={localSettings.chunkSize}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, chunkSize: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Controls the character span of each indexed passage. 800 characters maintains focused context.
            </p>
          </div>

          {/* Chunk Overlap */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-700">Chunk Overlap (characters)</label>
              <span className="font-mono text-blue-600 font-bold">{localSettings.chunkOverlap} chars</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={localSettings.chunkOverlap}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, chunkOverlap: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Characters shared between contiguous chunks to prevent sentences from being severed.
            </p>
          </div>

          {/* Top-K Retrieval */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-700">Top-K Retrieved Passages</label>
              <span className="font-mono text-blue-600 font-bold">{localSettings.topK} passages</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={localSettings.topK}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, topK: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Number of most similar semantic chunks supplied to Gemini as grounding evidence.
            </p>
          </div>

          {/* Minimum Relevance Threshold */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-700">Minimum Cosine Relevance Threshold</label>
              <span className="font-mono text-blue-600 font-bold">{localSettings.minRelevanceThreshold}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={localSettings.minRelevanceThreshold}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  minRelevanceThreshold: Number(e.target.value)
                })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Chunks below this similarity score trigger the Missing Evidence alert rather than a hallucinated answer.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Settings Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Parameters</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security & Privacy Architecture Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Security, Grounding & Privacy Guarantees
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" /> Server-Side Secrets Only
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              GEMINI_API_KEY is isolated on the Node.js server. No API keys or credentials ever touch the browser bundle or network traffic.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" /> Untrusted Document Isolation
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Document contents are treated as untrusted text. System prompts instruct the LLM to strictly ignore any embedded prompt injections.
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Reset Danger Zone */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Clear Current Workspace
            </h3>
            <p className="text-xs text-rose-700/80 mt-1 max-w-xl">
              Permanently delete all uploaded documents, computed text chunks, vector embeddings, and chat history in the current session.
            </p>
          </div>

          {confirmClear ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  await onClearWorkspace();
                  setConfirmClear(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Confirm Clear All
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-sm shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Reset Workspace
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
