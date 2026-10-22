export type DocumentStatus = 'uploaded' | 'extracting' | 'chunking' | 'embedding' | 'ready' | 'failed';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  status: DocumentStatus;
  pageCount: number;
  chunkCount: number;
  error?: string;
  isDemo?: boolean;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  filename: string;
  pageOrLocation: string;
  pageNumber?: number;
  chunkIndex: number;
  text: string;
  charStart?: number;
  charEnd?: number;
}

export interface Citation {
  chunkId: string;
  documentId: string;
  filename: string;
  pageOrLocation: string;
  pageNumber?: number;
  excerpt: string;
  similarity?: number;
  fullPageText?: string;
  highlightText?: string;
}

export interface PassageDisagreement {
  topic: string;
  passageA: {
    pageOrLocation: string;
    pageNumber?: number;
    text: string;
    filename?: string;
  };
  passageB: {
    pageOrLocation: string;
    pageNumber?: number;
    text: string;
    filename?: string;
  };
  explanation: string;
}

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  samplePrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  insufficientEvidence?: boolean;
  conflicts?: string[];
  disagreements?: PassageDisagreement[];
  language?: string;
  timestamp: string;
  selectedDocIds?: string[];
  feedback?: 'helpful' | 'unhelpful' | 'citation_issue';
  trustMode?: boolean;
}

export interface ComparisonDiffItem {
  type: 'added' | 'removed' | 'changed' | 'potential-conflict';
  title: string;
  description: string;
  category?: 'Changed Sections' | 'Missing Sections' | 'Conflicting Statements' | 'Added Clauses';
  sourceA?: {
    filename: string;
    pageOrLocation: string;
    pageNumber?: number;
    excerpt: string;
  };
  sourceB?: {
    filename: string;
    pageOrLocation: string;
    pageNumber?: number;
    excerpt: string;
  };
}

export interface ComparisonResult {
  summary: string;
  docAName: string;
  docBName: string;
  items: ComparisonDiffItem[];
  changedSections?: ComparisonDiffItem[];
  missingSections?: ComparisonDiffItem[];
  conflictingStatements?: ComparisonDiffItem[];
  stats?: {
    changedCount: number;
    missingCount: number;
    conflictCount: number;
    addedCount: number;
  };
  timestamp: string;
}

export interface ActionItem {
  id: string;
  task: string;
  category: 'Deadline' | 'Required Document' | 'Eligibility Condition' | 'Financial & Fee' | 'Compliance' | 'Other';
  deadline: string;
  requiredDocuments: string[];
  status: 'To review' | 'Done';
  sourceFilename: string;
  pageOrLocation: string;
  evidenceExcerpt: string;
}

export interface SystemStats {
  totalDocuments: number;
  processedDocuments: number;
  totalChunks: number;
  totalQueries: number;
  verifiedCitations: number;
}

export interface RagSettings {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  minRelevanceThreshold: number;
}

// -------------------------------------------------------------
// SMART STUDY MODE INTERFACES
// -------------------------------------------------------------
export interface StudySummaryItem {
  topic: string;
  summary: string;
  keyPoints: string[];
  pageOrLocation: string;
  sourceFilename: string;
  evidenceExcerpt?: string;
}

export interface StudyMCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pageOrLocation: string;
  sourceFilename: string;
  evidenceExcerpt?: string;
}

export interface StudyFlashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  pageOrLocation: string;
  sourceFilename: string;
  mastered?: boolean;
}

export interface StudyImpQuestion {
  id: string;
  question: string;
  type: 'Short Answer' | 'Long Answer' | 'Application / Case';
  keyConcepts: string[];
  modelAnswer: string;
  pageOrLocation: string;
  sourceFilename: string;
  evidenceExcerpt?: string;
}

export interface StudyMaterial {
  documentIds: string[];
  docNames: string[];
  generatedAt: string;
  summaries: StudySummaryItem[];
  mcqs: StudyMCQ[];
  flashcards: StudyFlashcard[];
  impQuestions: StudyImpQuestion[];
}

