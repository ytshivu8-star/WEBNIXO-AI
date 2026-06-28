/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Globe, 
  Send, 
  ArrowUp, 
  Copy, 
  Check, 
  RotateCcw, 
  Menu, 
  PanelLeftOpen, 
  ExternalLink, 
  FileText, 
  Terminal, 
  PenTool, 
  Sparkles,
  HelpCircle,
  Lightbulb,
  Search,
  BookOpen,
  ChevronDown,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Cpu,
  Layers,
  Shield,
  Activity,
  Lock
} from 'lucide-react';
import { ChatSession, Message, MODELS, ModelOption, AppSettings, Attachment } from '../types';

export function WebnixoLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512" 
      alt="Webnixo Logo" 
      className={`${className} object-contain rounded-xl`}
      referrerPolicy="no-referrer"
    />
  );
}

export function FlashModelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512" 
      alt="Webnixo Flash" 
      className={`${className} object-contain rounded-xl`}
      referrerPolicy="no-referrer"
    />
  );
}

export function ProModelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512" 
      alt="Webnixo Pro" 
      className={`${className} object-contain rounded-xl`}
      referrerPolicy="no-referrer"
    />
  );
}

export function LatestModelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512" 
      alt="Webnixo Latest" 
      className={`${className} object-contain rounded-xl`}
      referrerPolicy="no-referrer"
    />
  );
}

export function LiteModelLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512" 
      alt="Webnixo Lite" 
      className={`${className} object-contain rounded-xl`}
      referrerPolicy="no-referrer"
    />
  );
}

export function ChatGPTLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1owEGlZuAnWnuujeApVfesKNgpY5l2xw2=s512" 
      alt="ChatGPT" 
      className={`${className} object-contain rounded-md`}
      referrerPolicy="no-referrer"
    />
  );
}

export function AnthropicLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1och2V-ulECH9ujFptpnQulpdfN288JLr" 
      alt="Claude" 
      className={`${className} object-contain rounded-md`}
      referrerPolicy="no-referrer"
    />
  );
}

export function GeminiLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ" 
      alt="Gemini" 
      className={`${className} object-contain rounded-md`}
      referrerPolicy="no-referrer"
    />
  );
}

export function GrokLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo" 
      alt="Grok" 
      className={`${className} object-contain rounded-md`}
      referrerPolicy="no-referrer"
    />
  );
}

export function DeepSeekLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/13_MWI7R7km1HMxQ2HLMvKKqvebFPqy7K" 
      alt="DeepSeek" 
      className={`${className} object-contain rounded-md`}
      referrerPolicy="no-referrer"
    />
  );
}

export function MistralLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1flRFYCw1WYFvyoYttJTWlZTj78nJCtUd" 
      alt="Mistral" 
      className={`${className} object-contain rounded-md`}
      referrerPolicy="no-referrer"
    />
  );
}

export function PerplexityLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1-Qopm9dETsfDxmyv-5-kZN5QmGGsPgaJ" 
      alt="Perplexity" 
      className={`${className} object-contain rounded-md`}
      referrerPolicy="no-referrer"
    />
  );
}

export function renderModelLogo(modelId: string, className: string = "w-5 h-5") {
  switch (modelId) {
    case 'gemini-3.5-flash':
    case 'gemini-3.1-pro-preview':
      return <WebnixoLogo className={className} />;
    case 'chatgpt':
      return <ChatGPTLogo className={className} />;
    case 'claude':
      return <AnthropicLogo className={className} />;
    case 'gemini':
      return <GeminiLogo className={className} />;
    case 'grok':
      return <GrokLogo className={className} />;
    case 'deepseek':
      return <DeepSeekLogo className={className} />;
    case 'mistral':
      return <MistralLogo className={className} />;
    case 'perplexity':
      return (
        <div className={`${className} overflow-hidden rounded-md border border-neutral-700/10`}>
          <PerplexityLogo className="w-full h-full object-cover" />
        </div>
      );
    default:
      return <WebnixoLogo className={className} />;
  }
}

interface ChatWindowProps {
  activeSession: ChatSession | null;
  onSendMessage: (text: string, searchGrounding: boolean, attachments?: Attachment[]) => void;
  onRegenerateMessage: () => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
  sidebarIsOpen: boolean;
  settings: AppSettings;
  onChangeModel: (modelId: string) => void;
  onChangeSearchGrounding: (enabled: boolean) => void;
  onGoHome?: () => void;
  isPremium?: boolean;
  onOpenPricing?: () => void;
  onChangeCompareModels?: (modelIds: string[]) => void;
  onOpenLegal?: (tab: 'faq' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'contact') => void;
  userPlan?: 'free' | 'starter' | 'pro';
}

export function isModelAllowedForPlan(modelId: string, plan: 'free' | 'starter' | 'pro'): boolean {
  if (plan === 'pro') return true;
  if (plan === 'starter') {
    return ['gemini-3.5-flash', 'deepseek', 'mistral', 'compare-all'].includes(modelId);
  }
  return ['gemini-3.5-flash', 'deepseek', 'compare-all'].includes(modelId);
}

export default function ChatWindow({
  activeSession,
  onSendMessage,
  onRegenerateMessage,
  isLoading,
  onToggleSidebar,
  sidebarIsOpen,
  settings,
  onChangeModel,
  onChangeSearchGrounding,
  onGoHome,
  isPremium,
  onOpenPricing,
  onChangeCompareModels,
  onOpenLegal,
  userPlan,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [localSearchGrounding, setLocalSearchGrounding] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with activeSession searchGrounding when session changes
  useEffect(() => {
    if (activeSession) {
      setLocalSearchGrounding(activeSession.searchGrounding);
    } else {
      setLocalSearchGrounding(false);
    }
  }, [activeSession?.id, activeSession?.searchGrounding]);

  const activeModel = MODELS.find(m => m.id === (activeSession?.model || 'gemini-3.5-flash')) || MODELS[0];

  const handleModelChangeSecure = (modelId: string) => {
    const plan = userPlan || 'free';
    if (!isModelAllowedForPlan(modelId, plan)) {
      if (onOpenPricing) onOpenPricing();
      return;
    }
    onChangeModel(modelId);
  };

  // Recommendations for Empty State
  const recommendations = [
    {
      title: "Write an email",
      desc: "negotiating a modern hybrid work schedule",
      prompt: "Write a polite and persuasive email to my manager asking for a hybrid work schedule (3 days remote, 2 days in office). Emphasize productivity.",
      icon: <PenTool className="w-4 h-4 text-amber-500" />
    },
    {
      title: "Help me debug",
      desc: "an issue with React state in an iframe",
      prompt: "Explain how to handle parent-iframe postMessage communication in React securely and avoid infinite renders inside standard react lifecycles.",
      icon: <Terminal className="w-4 h-4 text-emerald-500" />
    },
    {
      title: "Workout plan",
      desc: "for active strength training",
      prompt: "Design a comprehensive, easy-to-follow 3-day active strength training routine using only bodyweight and dumbbells for intermediate level.",
      icon: <Sparkles className="w-4 h-4 text-sky-500" />
    },
    {
      title: "Brainstorm ideas",
      desc: "for an offline weekend hobby",
      prompt: "Give me 5 interesting, screen-free weekend hobby ideas that are highly engaging, creative, and don't require expensive starting gear.",
      icon: <Lightbulb className="w-4 h-4 text-purple-500" />
    }
  ];

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Handle scroll behavior
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [activeSession?.messages, isLoading, isScrolledToBottom]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Consider scrolled to bottom if within 50px of the actual bottom
      const isBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsScrolledToBottom(isBottom);
    }
  };

  const handleSend = () => {
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputValue.trim(), localSearchGrounding, attachments);
    setInputValue('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleOptimizePrompt = async () => {
    if (!inputValue.trim() || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue }),
      });
      const data = await res.json();
      if (data.optimized) {
        setInputValue(data.optimized);
      }
    } catch (err) {
      console.error("Error optimizing prompt:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleCopyCode = (code: string, indexKey: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(indexKey);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        if (!base64String) return;
        const commaIndex = base64String.indexOf(',');
        const base64Data = commaIndex !== -1 ? base64String.substring(commaIndex + 1) : base64String;
        
        const newAttachment: Attachment = {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          base64: base64Data
        };
        
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
    
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Custom code renderer for ReactMarkdown
  const renderMarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeValue = String(children).replace(/\n$/, '');
      const language = match ? match[1] : 'code';
      const indexKey = `${node?.position?.start?.line || 0}-${codeValue.substring(0, 10)}`;

      if (inline) {
        return <code className={className} {...props}>{children}</code>;
      }

      return (
        <div className="my-4 rounded-lg overflow-hidden border border-zinc-700/30 shadow-md">
          {/* Code block header */}
          <div className="bg-[#2f2f2f] text-zinc-300 px-4 py-2 flex justify-between items-center text-xs font-mono select-none">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language}</span>
            </div>
            <button
              onClick={() => handleCopyCode(codeValue, indexKey)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              {copiedCodeIndex === indexKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>
          {/* Code block content */}
          <pre className="bg-[#1e1e1e] p-4 overflow-x-auto text-sm font-mono text-zinc-100 leading-relaxed">
            <code>{children}</code>
          </pre>
        </div>
      );
    }
  };

  return (
    <div 
      id="chat-window-container"
      className={`flex-1 flex flex-col h-full relative overflow-hidden ${
        settings.theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-[#121212] text-zinc-100' 
          : 'bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef] text-zinc-800'
      }`}
    >
      {/* Invisible file upload input */}
      <input 
        id="hidden-file-input"
        type="file" 
        multiple
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Top Header Bar */}
      <header className={`h-14 px-4 flex items-center justify-between border-b shrink-0 ${
        settings.theme === 'dark' ? 'bg-transparent border-white/5' : 'bg-transparent border-zinc-200/50'
      }`}>
        {/* Left Toggle / Sidebar button */}
        <div className="flex items-center gap-2">
          {!sidebarIsOpen && (
            <button
              id="open-sidebar-header-btn"
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg transition-colors border ${
                settings.theme === 'dark' 
                  ? 'border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white bg-white/5 backdrop-blur-md' 
                  : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 bg-white/50 backdrop-blur-md shadow-xs'
              }`}
              title="Show sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          {/* Model Comparison Mode Toggle */}
          {activeSession && (
            <button
              id="compare-models-toggle-btn"
              onClick={() => {
                const nextModel = activeSession.model === 'compare-all' ? 'gemini-3.5-flash' : 'compare-all';
                handleModelChangeSecure(nextModel);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-bold transition-all border uppercase tracking-wider select-none ${
                activeSession.model === 'compare-all'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 shadow-xs'
                  : settings.theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                    : 'bg-white/60 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-white/95 shadow-2xs'
              }`}
              title="Compare all models side-by-side with a single prompt"
            >
              <Layers className={`w-3.5 h-3.5 ${activeSession.model === 'compare-all' ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Compare Models</span>
              {activeSession.model === 'compare-all' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          )}

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              id="model-selector-dropdown-btn"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-display text-sm font-semibold transition-all border ${
                settings.theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-zinc-200 hover:text-white hover:bg-white/10 backdrop-blur-md'
                  : 'bg-white/60 border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-white/90 backdrop-blur-md shadow-2xs'
              }`}
            >
              {renderModelLogo(activeModel.id, "w-4 h-4 shrink-0")}
              <span>{activeModel.name}</span>
              <ChevronDown className="w-4 h-4 opacity-60" />
            </button>

            {modelDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setModelDropdownOpen(false)} 
                />
                <div className={`absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 backdrop-blur-2xl max-h-[80vh] overflow-y-auto ${
                  settings.theme === 'dark' 
                    ? 'bg-[#1a1a1a]/95 border-white/10 text-zinc-100' 
                    : 'bg-white/95 border-zinc-200/80 text-zinc-800'
                }`}>
                  <div className="px-3 py-1.5 border-b border-zinc-700/10 mb-1.5">
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-50">Choose a Model</span>
                  </div>
                  <div className="space-y-1">
                    {MODELS.map((model) => {
                      const isLocked = !isModelAllowedForPlan(model.id, userPlan || 'free');
                      const credits = model.id === 'compare-all' ? 'Multi' : (model.id.includes('flash') || model.id.includes('deepseek') ? 1 : model.id.includes('mistral') ? 2 : model.id.includes('grok') || model.id.includes('perplexity') ? 4 : 5);
                      return (
                        <button
                          id={`model-select-opt-${model.id}`}
                          key={model.id}
                          onClick={() => {
                            handleModelChangeSecure(model.id);
                            setModelDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                            activeModel.id === model.id
                              ? settings.theme === 'dark' ? 'bg-[#212121] text-emerald-400' : 'bg-zinc-100 text-emerald-600'
                              : isLocked
                                ? 'opacity-50 hover:opacity-75 text-zinc-500'
                                : settings.theme === 'dark' ? 'hover:bg-[#212121]/50 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <div className="mt-0.5">
                            {renderModelLogo(model.id, "w-5 h-5")}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm font-semibold truncate block">{model.name}</span>
                                {isLocked && <Lock className="w-3 h-3 text-red-400 shrink-0" />}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[8px] font-black uppercase tracking-wider bg-zinc-700/20 text-zinc-400 px-1 py-0.5 rounded-md border border-zinc-700/10">
                                  {credits} Cr
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                  model.badge === 'Router'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                    : model.badge === 'Pro'
                                      ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                      : model.badge === 'ChatGPT'
                                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                        : model.badge === 'Anthropic'
                                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                                          : model.badge === 'Gemini'
                                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                                            : model.badge === 'xAI Grok'
                                              ? 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/20 dark:text-zinc-300'
                                              : model.badge === 'DeepSeek'
                                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                                                : model.badge === 'Mistral'
                                                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                                  : 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                                }`}>
                                  {model.badge}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs opacity-60 mt-0.5 block line-clamp-1">{model.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right side connection info */}
        <div className="flex items-center gap-2 text-xs opacity-50 font-medium select-none">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>WEBNIXO AI Online</span>
        </div>
      </header>

      {/* Model Comparison Selection Bar */}
      {activeSession && activeSession.model === 'compare-all' && (
        <div className={`px-4 py-2 border-b shrink-0 select-none flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          settings.theme === 'dark' 
            ? 'bg-[#121212]/30 border-white/5 text-zinc-300' 
            : 'bg-zinc-50/50 border-zinc-200/50 text-zinc-700'
        }`}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold font-display uppercase tracking-wider">Arena Engines:</span>
            <span className="text-[10px] opacity-60 hidden sm:inline">Select engines to compare side-by-side</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {MODELS.filter(m => m.id !== 'compare-all').map((model) => {
              const currentCompareList = activeSession.compareModelIds && activeSession.compareModelIds.length > 0
                ? activeSession.compareModelIds
                : ['chatgpt', 'claude', 'gemini', 'grok', 'deepseek'];
              
              const isSelected = currentCompareList.includes(model.id);
              
              return (
                <button
                  id={`arena-toggle-${model.id}`}
                  key={model.id}
                  onClick={() => {
                    const premiumModels = [
                      'gemini-3.1-pro-preview',
                      'chatgpt',
                      'claude',
                      'grok',
                      'deepseek',
                      'mistral',
                      'perplexity'
                    ];
                    if (premiumModels.includes(model.id) && !isPremium) {
                      if (onOpenPricing) onOpenPricing();
                      return;
                    }
                    
                    let newList: string[];
                    if (isSelected) {
                      if (currentCompareList.length <= 1) return;
                      newList = currentCompareList.filter(id => id !== model.id);
                    } else {
                      newList = [...currentCompareList, model.id];
                    }
                    if (onChangeCompareModels) {
                      onChangeCompareModels(newList);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold font-display transition-all border shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold shadow-2xs'
                      : settings.theme === 'dark'
                        ? 'bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        : 'bg-transparent border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {renderModelLogo(model.id, "w-3.5 h-3.5")}
                  </div>
                  <span>{model.badge}</span>
                  {isSelected ? (
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Messages Area */}
      <div 
        id="messages-scroll-area"
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6"
      >
        {!activeSession || activeSession.messages.length === 0 ? (
          /* WEBNIXO MINIMALIST LANDING */
          <div id="empty-state-welcome" className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center py-16 md:py-28 text-center space-y-6 select-none animate-fade-in">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl relative border ${
                settings.theme === 'dark'
                  ? 'bg-zinc-900/80 border-white/10'
                  : 'bg-white border-zinc-200'
              }`}>
                <WebnixoLogo className="w-12 h-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400">
                WEBNIXO AI
              </h1>
              <p className={`text-base font-medium leading-relaxed max-w-md ${
                settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                How can I help you today?
              </p>
            </div>
          </div>
        ) : (
          /* MESSAGE RENDER LIST */
          <div id="message-list-container" className={`w-full mx-auto space-y-8 ${
            activeSession.messages.some(m => !!m.compares) ? 'max-w-[98%] px-2 md:px-4' : 'max-w-3xl'
          }`}>
            {activeSession.messages.map((msg, idx) => (
              <div 
                id={`message-row-${msg.id}`}
                key={msg.id} 
                className={`flex gap-4 md:gap-6 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                } ${msg.compares ? 'w-full' : ''}`}
              >
                {/* User avatar or AI Avatar layout */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-emerald-500/5 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/15 shadow-xs select-none">
                    {renderModelLogo(activeSession.model || 'gemini-3.5-flash', "w-5 h-5")}
                  </div>
                )}

                <div className={`${msg.compares ? 'w-full' : 'max-w-[85%]'} flex flex-col space-y-1.5 ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  {/* Search Query info if searching was used and returned queries */}
                  {msg.role === 'assistant' && msg.queries && msg.queries.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 select-none">
                      <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>Searched: "{msg.queries[0]}"</span>
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className={`${msg.compares ? 'w-full' : 'px-4.5 py-3 rounded-2xl'} ${
                    msg.role === 'user'
                      ? settings.theme === 'dark'
                        ? 'bg-white/10 border border-white/10 backdrop-blur-md text-zinc-100 shadow-sm'
                        : 'bg-black/5 border border-black/5 backdrop-blur-md text-zinc-900 shadow-xs'
                      : ''
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="space-y-2">
                        {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.attachments.map((att, idx) => {
                              const isImage = att.mimeType.startsWith('image/');
                              return (
                                <div 
                                  key={idx}
                                  className={`flex items-center gap-1.5 p-1 pr-2 rounded-lg border text-[11px] ${
                                    settings.theme === 'dark' 
                                      ? 'bg-zinc-950/80 border-white/5 text-zinc-300' 
                                      : 'bg-white border-zinc-200 text-zinc-700 shadow-3xs'
                                  }`}
                                >
                                  {isImage ? (
                                    <div className="w-5 h-5 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                                      {att.base64 ? (
                                        <img 
                                          src={`data:${att.mimeType};base64,${att.base64}`} 
                                          alt={att.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] bg-zinc-700">IMG</div>
                                      )}
                                    </div>
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  )}
                                  <span className="truncate max-w-[120px] font-medium" title={att.name}>{att.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : msg.compares ? (
                      (() => {
                        return (
                          <div className="flex flex-row gap-4 overflow-x-auto pb-4 w-full mt-2 scrollbar-thin snap-x snap-mandatory">
                            {Object.entries(msg.compares).map(([modelId, comp]) => (
                              <div 
                                key={modelId}
                                className={`min-w-[280px] sm:min-w-[320px] md:min-w-[360px] lg:min-w-[400px] max-w-[500px] flex-1 p-4 rounded-2xl border flex flex-col justify-between transition-all snap-start ${
                                  settings.theme === 'dark'
                                    ? 'bg-zinc-900/60 border-white/5 shadow-inner'
                                    : 'bg-white border-zinc-200/60 shadow-xs'
                                }`}
                              >
                                <div className="space-y-3 flex-1">
                                  {/* Model Info Header */}
                                  <div className="flex items-center justify-between border-b border-zinc-700/10 dark:border-white/10 pb-2">
                                    <div className="flex items-center gap-1.5">
                                      {renderModelLogo(modelId, "w-4 h-4 shrink-0")}
                                      <span className="text-[10px] md:text-xs font-bold font-display uppercase tracking-wider">{comp.modelName}</span>
                                    </div>
                                    {comp.isLoading && (
                                      <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Model response markdown content */}
                                  <div className="text-xs overflow-hidden min-h-[80px]">
                                    {comp.isLoading ? (
                                      <div className="space-y-2 py-2 animate-pulse">
                                        <div className="h-2.5 bg-zinc-700/20 dark:bg-white/5 rounded w-5/6"></div>
                                        <div className="h-2.5 bg-zinc-700/20 dark:bg-white/5 rounded w-4/6"></div>
                                        <div className="h-2.5 bg-zinc-700/20 dark:bg-white/5 rounded w-5/6"></div>
                                        <div className="h-2.5 bg-zinc-700/20 dark:bg-white/5 rounded w-3/6"></div>
                                      </div>
                                    ) : (
                                      <div className="markdown-body">
                                        <ReactMarkdown components={renderMarkdownComponents}>
                                          {comp.content || "*(No response generated)*"}
                                        </ReactMarkdown>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Column action toolbar */}
                                {!comp.isLoading && comp.content && (
                                  <div className="flex justify-end gap-1.5 border-t border-zinc-700/10 dark:border-white/10 pt-2 mt-3 select-none">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(comp.content)}
                                      className={`p-1 rounded-lg transition-colors border ${
                                        settings.theme === 'dark' 
                                          ? 'border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white bg-white/5' 
                                          : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 bg-white shadow-3xs'
                                      }`}
                                      title="Copy response"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown components={renderMarkdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Search Citations (Sources Shelf) */}
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 w-full border-t border-zinc-700/10 pt-2.5 space-y-2 select-none">
                      <div className="flex items-center gap-1.5 text-xs opacity-50 font-semibold uppercase tracking-wider">
                        <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                        <span>Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, srcIdx) => (
                          <a
                            id={`source-link-${msg.id}-${srcIdx}`}
                            key={srcIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                              settings.theme === 'dark'
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white backdrop-blur-md'
                                : 'bg-black/5 border-black/5 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 backdrop-blur-md shadow-2xs'
                            }`}
                          >
                            <span className="truncate max-w-[120px]">{src.title}</span>
                            <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons under message */}
                  <div className="flex items-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 pt-1 select-none">
                    <button
                      id={`copy-msg-btn-${msg.id}`}
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        settings.theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
                      }`}
                      title="Copy content"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {msg.role === 'assistant' && (
                      <>
                        <button
                          id={`thumbs-up-btn-${msg.id}`}
                          className={`p-1.5 rounded-lg transition-colors ${
                            settings.theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
                          }`}
                          title="Thumbs up"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`thumbs-down-btn-${msg.id}`}
                          className={`p-1.5 rounded-lg transition-colors ${
                            settings.theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
                          }`}
                          title="Thumbs down"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        {idx === activeSession.messages.length - 1 && (
                          <button
                            id="regenerate-last-msg-btn"
                            onClick={onRegenerateMessage}
                            className={`p-1.5 rounded-lg transition-colors ${
                              settings.theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
                            }`}
                            title="Regenerate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>


              </div>
            ))}

            {/* Active AI Loading Indicator / Search status */}
            {isLoading && (
              <div id="ai-loading-indicator-row" className="flex gap-4 md:gap-6 justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/25 shadow-xs select-none animate-pulse">
                  <WebnixoLogo className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex flex-col space-y-2">
                  {localSearchGrounding && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 select-none animate-pulse">
                      <Globe className="w-3.5 h-3.5 animate-spin" />
                      <span>Searching the web...</span>
                    </div>
                  )}
                  <div className={`px-4.5 py-3 rounded-2xl ${
                    settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <span className="cursor-blink" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Controller Area */}
      <footer className="p-4 md:p-6 shrink-0 max-w-3xl w-full mx-auto select-none">
        <div className={`rounded-[26px] border shadow-2xl flex flex-col p-1.5 transition-all focus-within:ring-2 ${
          settings.theme === 'dark'
            ? 'bg-white/5 border-white/15 backdrop-blur-2xl focus-within:ring-emerald-500/20 focus-within:border-white/30'
            : 'bg-black/5 border-black/10 backdrop-blur-xl focus-within:ring-emerald-500/20 focus-within:border-black/20 focus-within:bg-white/90'
        }`}>
          {/* Selected Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1.5 max-h-36 overflow-y-auto border-b border-zinc-700/10 dark:border-white/5">
              {attachments.map((att, idx) => {
                const isImage = att.mimeType.startsWith('image/');
                const sizeInKb = att.size ? `${(att.size / 1024).toFixed(1)} KB` : '';
                
                return (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border text-xs relative group ${
                      settings.theme === 'dark' 
                        ? 'bg-zinc-900/80 border-white/10 text-zinc-300' 
                        : 'bg-white border-zinc-200 text-zinc-700 shadow-2xs'
                    }`}
                  >
                    {isImage ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <img 
                          src={`data:${att.mimeType};base64,${att.base64}`} 
                          alt={att.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        settings.theme === 'dark' ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 max-w-[150px]">
                      <span className="truncate font-medium">{att.name}</span>
                      {sizeInKb && <span className="text-[10px] opacity-60 font-mono">{sizeInKb}</span>}
                    </div>
                    
                    {/* Delete overlay button */}
                    <button
                      onClick={() => handleRemoveAttachment(idx)}
                      className={`ml-1.5 p-1 rounded-full hover:scale-110 transition-transform ${
                        settings.theme === 'dark' 
                          ? 'hover:bg-zinc-800 text-zinc-400 hover:text-red-400' 
                          : 'hover:bg-zinc-100 text-zinc-500 hover:text-red-600'
                      }`}
                      title="Remove attachment"
                    >
                      <span className="text-sm font-bold leading-none">×</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Textarea */}
          <textarea
            id="chat-textarea-input"
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message WEBNIXO AI (${activeModel.badge} Mode)...`}
            className={`w-full bg-transparent border-0 outline-none px-4.5 py-2.5 resize-none text-sm leading-relaxed focus:ring-0 ${
              settings.theme === 'dark' ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'
            }`}
          />

          {/* Bottom Toolbar inside the text box container */}
          <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
            {/* Attachment, Search web */}
            <div className="flex items-center gap-1.5">
              <button
                id="file-upload-tray-btn"
                onClick={handleUploadClick}
                className={`p-2 rounded-full transition-all ${
                  settings.theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800'
                }`}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                id="web-search-grounding-toggle-btn"
                onClick={() => {
                  const nextVal = !localSearchGrounding;
                  setLocalSearchGrounding(nextVal);
                  onChangeSearchGrounding(nextVal);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-semibold border ${
                  localSearchGrounding
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
                    : settings.theme === 'dark'
                      ? 'bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                      : 'bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-700 shadow-2xs'
                }`}
                title="Toggle Web Search Grounding (Gemini)"
              >
                <Globe className={`w-3.5 h-3.5 ${localSearchGrounding ? 'text-emerald-400' : 'opacity-65'}`} />
                <span>Search</span>
              </button>

              <button
                id="optimize-prompt-btn"
                onClick={handleOptimizePrompt}
                disabled={!inputValue.trim() || isOptimizing}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-semibold border ${
                  isOptimizing
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse cursor-wait'
                    : inputValue.trim()
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                      : settings.theme === 'dark'
                        ? 'bg-transparent border-zinc-800 text-zinc-600 cursor-not-allowed opacity-40'
                        : 'bg-transparent border-zinc-200 text-zinc-400 cursor-not-allowed opacity-40'
                }`}
                title="Optimize prompt before sending"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
                <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
              </button>
            </div>

            {/* Send Arrow Button */}
            <button
              id="send-prompt-btn"
              onClick={handleSend}
              disabled={(!inputValue.trim() && attachments.length === 0) || isLoading}
              className={`p-2 rounded-full transition-all ${
                (inputValue.trim() || attachments.length > 0) && !isLoading
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transform scale-100 active:scale-95'
                  : settings.theme === 'dark'
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ChatGPT disclaimer line */}
        <p className={`text-[11px] text-center mt-3 select-none ${
          settings.theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          WEBNIXO AI can make mistakes. Consider verifying important information.
        </p>
      </footer>
    </div>
  );
}
