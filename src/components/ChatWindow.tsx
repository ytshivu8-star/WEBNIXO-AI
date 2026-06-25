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
  ThumbsDown
} from 'lucide-react';
import { ChatSession, Message, MODELS, ModelOption, AppSettings } from '../types';

interface ChatWindowProps {
  activeSession: ChatSession | null;
  onSendMessage: (text: string, searchGrounding: boolean) => void;
  onRegenerateMessage: () => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
  sidebarIsOpen: boolean;
  settings: AppSettings;
  onChangeModel: (modelId: string) => void;
  onChangeSearchGrounding: (enabled: boolean) => void;
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
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeModel = MODELS.find(m => m.id === (activeSession?.model || 'gemini-3.5-flash')) || MODELS[0];
  const isSearchGroundingActive = activeSession?.searchGrounding ?? false;

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
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim(), isSearchGroundingActive);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
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
    const file = e.target.files?.[0];
    if (file) {
      // Create a nice styled upload mock text
      setInputValue(prev => prev + `[Uploaded File: ${file.name}] `);
    }
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
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{activeModel.name}</span>
              <ChevronDown className="w-4 h-4 opacity-60" />
            </button>

            {modelDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setModelDropdownOpen(false)} 
                />
                <div className={`absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 backdrop-blur-2xl ${
                  settings.theme === 'dark' 
                    ? 'bg-[#1a1a1a]/95 border-white/10 text-zinc-100' 
                    : 'bg-white/95 border-zinc-200/80 text-zinc-800'
                }`}>
                  <div className="px-3 py-1.5 border-b border-zinc-700/10 mb-1.5">
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-50">Choose a Model</span>
                  </div>
                  <div className="space-y-1">
                    {MODELS.map((model) => (
                      <button
                        id={`model-select-opt-${model.id}`}
                        key={model.id}
                        onClick={() => {
                          onChangeModel(model.id);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all ${
                          activeModel.id === model.id
                            ? settings.theme === 'dark' ? 'bg-[#212121] text-emerald-400' : 'bg-zinc-100 text-emerald-600'
                            : settings.theme === 'dark' ? 'hover:bg-[#212121]/50 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold block">{model.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            model.badge === 'Pro' 
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' 
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {model.badge}
                          </span>
                        </div>
                        <span className="text-xs opacity-60 mt-0.5 block line-clamp-1">{model.description}</span>
                      </button>
                    ))}
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

      {/* Main Messages Area */}
      <div 
        id="messages-scroll-area"
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6"
      >
        {!activeSession || activeSession.messages.length === 0 ? (
          /* EMPTY STATE (WELCOME SCREEN) */
          <div id="empty-state-welcome" className="max-w-2xl mx-auto h-full flex flex-col justify-center py-10 select-none">
            <div className="text-center mb-12 space-y-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl mx-auto border transition-all animate-fade-in ${
                settings.theme === 'dark'
                  ? 'bg-white/5 border-white/20 backdrop-blur-2xl text-emerald-400'
                  : 'bg-black/5 border-black/10 backdrop-blur-md text-emerald-600'
              }`}>
                <span className="text-3xl font-bold">W</span>
              </div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 mt-4">
                WEBNIXO AI
              </h1>
              <p className={`text-sm max-w-md mx-auto ${
                settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                What can I help you design, debug, brainstorm, or write today? Ask anything.
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recommendations.map((item, idx) => (
                <div
                  id={`suggestion-card-${idx}`}
                  key={idx}
                  onClick={() => onSendMessage(item.prompt, isSearchGroundingActive)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 transform hover:scale-[1.01] hover:shadow-lg backdrop-blur-md ${
                    settings.theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-zinc-200'
                      : 'bg-black/5 border-black/5 hover:bg-black/10 hover:border-black/15 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`p-1.5 rounded-lg ${
                      settings.theme === 'dark' ? 'bg-[#121212]' : 'bg-white shadow-2xs border border-zinc-100'
                    }`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold font-display">{item.title}</span>
                  </div>
                  <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MESSAGE RENDER LIST */
          <div id="message-list-container" className="max-w-3xl mx-auto space-y-8">
            {activeSession.messages.map((msg, idx) => (
              <div 
                id={`message-row-${msg.id}`}
                key={msg.id} 
                className={`flex gap-4 md:gap-6 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* User avatar or AI Avatar layout */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/25 shadow-xs select-none">
                    W
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col space-y-1.5 ${
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
                  <div className={`px-4.5 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? settings.theme === 'dark'
                        ? 'bg-white/10 border border-white/10 backdrop-blur-md text-zinc-100 shadow-sm'
                        : 'bg-black/5 border border-black/5 backdrop-blur-md text-zinc-900 shadow-xs'
                      : ''
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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

                {/* User avatar for right aligned layout */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/25 shadow-xs select-none">
                    {(settings.userEmail || "G").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {/* Active AI Loading Indicator / Search status */}
            {isLoading && (
              <div id="ai-loading-indicator-row" className="flex gap-4 md:gap-6 justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/25 shadow-xs select-none animate-pulse">
                  W
                </div>
                <div className="flex flex-col space-y-2">
                  {isSearchGroundingActive && (
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
                onClick={() => onChangeSearchGrounding(!isSearchGroundingActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-semibold border ${
                  isSearchGroundingActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
                    : settings.theme === 'dark'
                      ? 'bg-transparent border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                      : 'bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-700 shadow-2xs'
                }`}
                title="Toggle Web Search Grounding (Gemini)"
              >
                <Globe className={`w-3.5 h-3.5 ${isSearchGroundingActive ? 'text-emerald-400' : 'opacity-65'}`} />
                <span>Search</span>
              </button>
            </div>

            {/* Send Arrow Button */}
            <button
              id="send-prompt-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-full transition-all ${
                inputValue.trim() && !isLoading
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
