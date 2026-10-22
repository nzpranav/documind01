import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DocumentsView } from './components/DocumentsView.tsx';
import { ChatView } from './components/ChatView.tsx';
import { CompareView } from './components/CompareView.tsx';
import { ActionsView } from './components/ActionsView.tsx';
import { DjangoGuideView } from './components/DjangoGuideView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { DocumentModal } from './components/DocumentModal.tsx';
import { EvidenceDrawer } from './components/EvidenceDrawer.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { AuthPage } from './components/AuthPage.tsx';
import { StudyModeView } from './components/StudyModeView.tsx';
import { VoiceAssistantView } from './components/VoiceAssistantView.tsx';
import {
  DocumentItem,
  DocumentChunk,
  ChatMessage,
  Citation,
  ComparisonResult,
  ActionItem,
  SystemStats,
  RagSettings,
  User,
  StudyMaterial
} from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Core Data State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalDocuments: 0,
    processedDocuments: 0,
    totalChunks: 0,
    totalQueries: 0,
    verifiedCitations: 0
  });
  const [settings, setSettings] = useState<RagSettings>({
    chunkSize: 800,
    chunkOverlap: 120,
    topK: 5,
    minRelevanceThreshold: 0.35
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Loading States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);

  // Modals & Drawers
  const [selectedDocForModal, setSelectedDocForModal] = useState<DocumentItem | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Toast Helper
  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Data Fetch
  const fetchAllData = async () => {
    try {
      const [docsRes, statsRes, settingsRes, chatRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/stats'),
        fetch('/api/settings'),
        fetch('/api/chat/history')
      ]);

      if (docsRes.ok) {
        const d = await docsRes.json();
        if (d.documents) setDocuments(d.documents);
      }
      if (statsRes.ok) {
        const s = await statsRes.json();
        if (s.stats) setStats(s.stats);
      }
      if (settingsRes.ok) {
        const st = await settingsRes.json();
        if (st.settings) setSettings(st.settings);
      }
      if (chatRes.ok) {
        const c = await chatRes.json();
        if (c.history) setMessages(c.history);
      }
    } catch (err) {
      console.error('Error fetching app data:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('documind_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem('documind_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('documind_token');
        })
        .finally(() => {
          setIsAuthChecking(false);
          fetchAllData();
        });
    } else {
      setIsAuthChecking(false);
      fetchAllData();
    }
  }, []);

  // Upload Document Handler
  const handleUploadFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext || '')) {
      addToast(
        'error',
        'Unsupported Format',
        'Please upload a PDF, DOCX, or TXT file.'
      );
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      addToast(
        'error',
        'File Too Large',
        'Maximum supported file size is 20MB.'
      );
      return;
    }

    setIsUploading(true);
    setUploadStatusText(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadStatusText('Extracting text and verifying structure...');

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      addToast(
        'success',
        'Document Processed',
        `'${file.name}' successfully chunked and stored in vector index.`
      );

      await fetchAllData();
    } catch (err: any) {
      addToast(
        'error',
        'Upload Failed',
        err.message || 'Error occurred while processing file.'
      );
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
    }
  };

  // Load Demo Documents Handler
  const handleLoadSamples = async () => {
    setIsLoadingSamples(true);
    try {
      const res = await fetch('/api/documents/load-samples', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load demo files');

      addToast(
        'success',
        'Demo Suite Loaded',
        '3 sample policy documents and grant guidelines loaded into vector store.'
      );
      await fetchAllData();
    } catch (err: any) {
      addToast('error', 'Demo Load Failed', err.message);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  // Delete Document Handler
  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete document');

      addToast('info', 'Document Removed', 'File and its vector embeddings deleted.');
      await fetchAllData();
    } catch (err: any) {
      addToast('error', 'Deletion Error', err.message);
    }
  };

  // Ask Question in Chat Handler
  const handleSendMessage = async (
    question: string,
    documentIds: string[],
    trustMode: boolean = true,
    targetLanguage: string = 'en'
  ) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: question,
      language: targetLanguage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, documentIds, trustMode, targetLanguage })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to answer question');

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        insufficientEvidence: data.insufficientEvidence || false,
        conflicts: data.conflicts || [],
        disagreements: data.disagreements || [],
        language: data.language || targetLanguage,
        trustMode: data.trustMode ?? trustMode,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
      // Update query counter
      setStats(prev => ({
        ...prev,
        totalQueries: prev.totalQueries + 1,
        verifiedCitations: prev.verifiedCitations + (data.citations?.length || 0)
      }));
    } catch (err: any) {
      addToast('error', 'Chat Retrieval Error', err.message);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to process document query.'}`,
        timestamp: new Date().toISOString(),
        insufficientEvidence: true
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Clear Chat History
  const handleClearChat = async () => {
    try {
      await fetch('/api/chat/clear', { method: 'POST' });
      setMessages([]);
      addToast('info', 'Chat Cleared', 'Conversation history reset.');
    } catch (err) {
      setMessages([]);
    }
  };

  // Chat feedback
  const handleProvideFeedback = (msgId: string, feedback: 'helpful' | 'unhelpful' | 'citation_issue') => {
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, feedback } : m))
    );
    addToast(
      'success',
      'Feedback Recorded',
      feedback === 'helpful'
        ? 'Thank you for verifying this grounded answer!'
        : 'Feedback noted for retrieval calibration.'
    );
  };

  // Compare Handler
  const handleCompare = async (docAId: string, docBId: string): Promise<ComparisonResult | null> => {
    setIsComparing(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docAId, docBId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Comparison failed');
      return data.comparison;
    } catch (err: any) {
      addToast('error', 'Comparison Failed', err.message);
      return null;
    } finally {
      setIsComparing(false);
    }
  };

  // Direct Two-Document Upload Compare Handler
  const handleDirectCompare = async (fileA: File, fileB: File): Promise<ComparisonResult | null> => {
    setIsComparing(true);
    try {
      const formData = new FormData();
      formData.append('fileA', fileA);
      formData.append('fileB', fileB);

      const res = await fetch('/api/documents/compare-direct', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Direct comparison failed');
      addToast('success', 'Comparison Generated', `Successfully analyzed ${fileA.name} against ${fileB.name}.`);
      return data.comparison;
    } catch (err: any) {
      addToast('error', 'Direct Comparison Failed', err.message);
      return null;
    } finally {
      setIsComparing(false);
    }
  };

  // Extract Actions Handler
  const handleExtractActions = async (documentIds: string[]): Promise<ActionItem[]> => {
    setIsExtracting(true);
    try {
      const res = await fetch('/api/actions/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action extraction failed');
      return data.items || [];
    } catch (err: any) {
      addToast('error', 'Extraction Failed', err.message);
      return [];
    } finally {
      setIsExtracting(false);
    }
  };

  // Generate Study Materials Handler
  const handleGenerateStudy = async (documentIds: string[]): Promise<StudyMaterial | null> => {
    setIsGeneratingStudy(true);
    try {
      const res = await fetch('/api/study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Study generation failed');
      addToast(
        'success',
        'Study Pack Generated',
        'Created summaries, practice MCQs, flashcards, and exam questions.'
      );
      return data.studyMaterial;
    } catch (err: any) {
      addToast('error', 'Study Mode Error', err.message);
      return null;
    } finally {
      setIsGeneratingStudy(false);
    }
  };

  // Update Settings Handler
  const handleUpdateSettings = async (newSettings: RagSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');
      setSettings(data.settings);
      addToast('success', 'Parameters Saved', 'RAG retrieval settings updated.');
    } catch (err: any) {
      addToast('error', 'Save Failed', err.message);
    }
  };

  // Clear Workspace Handler
  const handleClearWorkspace = async () => {
    try {
      for (const d of documents) {
        await fetch(`/api/documents/${d.id}`, { method: 'DELETE' });
      }
      await fetch('/api/chat/clear', { method: 'POST' });
      setDocuments([]);
      setMessages([]);
      setStats({
        totalDocuments: 0,
        processedDocuments: 0,
        totalChunks: 0,
        totalQueries: 0,
        verifiedCitations: 0
      });
      addToast('info', 'Workspace Reset', 'All documents, vectors, and chats cleared.');
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    }
  };

  const readyDocs = documents.filter(d => d.status === 'ready');

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#eaf0fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2558d1] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600">Loading DocuMind AI...</span>
        </div>
      </div>
    );
  }

  if (!currentUser && !isGuestMode) {
    return (
      <>
        <AuthPage
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsGuestMode(false);
            addToast('success', 'Welcome!', `Signed in as ${user.name}`);
            fetchAllData();
          }}
          onContinueAsGuest={() => {
            setIsGuestMode(true);
            addToast('info', 'Guest Mode', 'Browsing in guest mode.');
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Hidden file input for header upload button */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUploadFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
      />

      {/* Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        documentCount={documents.length}
        readyCount={readyDocs.length}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          documentCount={documents.length}
          totalChunks={stats.totalChunks}
          onTriggerUpload={() => hiddenFileInputRef.current?.click()}
          onLoadSamples={handleLoadSamples}
          isLoadingSamples={isLoadingSamples}
          user={currentUser}
          onLogout={() => {
            localStorage.removeItem('documind_token');
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
            setCurrentUser(null);
            setIsGuestMode(false);
            addToast('info', 'Signed Out', 'You have been signed out.');
          }}
          onNavigateToTab={setActiveTab}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              documents={documents}
              stats={stats}
              onUploadFile={handleUploadFile}
              isUploading={isUploading}
              uploadStatusText={uploadStatusText}
              onNavigateToTab={setActiveTab}
              onOpenDocument={setSelectedDocForModal}
              onDeleteDocument={handleDeleteDocument}
              onLoadSamples={handleLoadSamples}
              isLoadingSamples={isLoadingSamples}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onOpenDocument={setSelectedDocForModal}
              onDeleteDocument={handleDeleteDocument}
              onStartChat={(id) => {
                setActiveTab('chat');
              }}
              onTriggerUpload={() => hiddenFileInputRef.current?.click()}
              onLoadSamples={handleLoadSamples}
              isLoadingSamples={isLoadingSamples}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              documents={documents}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              onClearChat={handleClearChat}
              onInspectCitation={setActiveCitation}
              onProvideFeedback={handleProvideFeedback}
              onSwitchToVoice={() => setActiveTab('voice')}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceAssistantView
              documents={documents}
              onInspectCitation={setActiveCitation}
              onOpenDocument={setSelectedDocForModal}
            />
          )}

          {activeTab === 'study' && (
            <StudyModeView
              documents={documents}
              onGenerateStudy={handleGenerateStudy}
              isGenerating={isGeneratingStudy}
              onInspectCitation={setActiveCitation}
            />
          )}

          {activeTab === 'compare' && (
            <CompareView
              documents={documents}
              onCompare={handleCompare}
              onDirectCompare={handleDirectCompare}
              isComparing={isComparing}
            />
          )}

          {activeTab === 'actions' && (
            <ActionsView
              documents={documents}
              onExtractActions={handleExtractActions}
              isExtracting={isExtracting}
              onInspectCitation={setActiveCitation}
            />
          )}

          {activeTab === 'django-guide' && <DjangoGuideView />}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearWorkspace={handleClearWorkspace}
            />
          )}
        </main>
      </div>

      {/* Modals & Slide-over Drawers */}
      <DocumentModal
        document={selectedDocForModal}
        onClose={() => setSelectedDocForModal(null)}
        onDelete={handleDeleteDocument}
        onStartChat={(id) => {
          setSelectedDocForModal(null);
          setActiveTab('chat');
        }}
      />

      <EvidenceDrawer
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
        allCitations={
          messages.length > 0 && messages[messages.length - 1].citations
            ? messages[messages.length - 1].citations
            : []
        }
        onSelectCitation={(c) => setActiveCitation(c)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
