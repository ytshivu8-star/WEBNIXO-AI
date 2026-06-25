/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChatSession, Message, MODELS, AppSettings } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsDialog from './components/SettingsDialog';
import { Menu, PanelLeftOpen, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_CHATS_KEY = 'webnixo_ai_chats';
const LOCAL_STORAGE_SETTINGS_KEY = 'webnixo_ai_settings';

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    clearOnNewChat: false,
    userEmail: 'ytshivu8@gmail.com' // Connected user email from runtime context
  });

  // Load chats and settings on mount
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem(LOCAL_STORAGE_CHATS_KEY);
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        if (parsed.length > 0) {
          setActiveChatId(parsed[0].id);
        }
      } else {
        // Create an initial beautiful welcome chat session
        const welcomeId = `welcome-${Date.now()}`;
        const initialSession: ChatSession = {
          id: welcomeId,
          title: "About WEBNIXO AI",
          createdAt: new Date().toISOString(),
          model: "gemini-3.5-flash",
          searchGrounding: false,
          messages: [
            {
              id: "welcome-msg-1",
              role: "assistant",
              content: "👋 Hello and welcome! I am **WEBNIXO AI**, your highly optimized productivity partner styled exactly like ChatGPT and built for high-performance interactions.\n\n### Here is what I can do:\n* 🔍 **Real-time Web Grounding**: Click the **Search** globe in the input bar to fetch immediate current facts from the live web.\n* ⚙️ **Dual Engines**: Toggle between **WEBNIXO 1.0 (Flash)** for speedy tasks, or **WEBNIXO Pro (Pro)** for intricate coding and advanced reasoning.\n* 💻 **Premium Code Terminal**: All code blocks render with syntax highlights and a quick copy panel.\n\nType your first message below, or click any suggestion card to begin!",
              timestamp: new Date().toISOString()
            }
          ]
        };
        setChats([initialSession]);
        setActiveChatId(welcomeId);
      }

      const savedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error("Error loading localStorage data:", e);
    }
  }, []);

  // Sync settings theme to HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#212121';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#ffffff';
    }
  }, [settings.theme]);

  // Save chats to localStorage whenever they change
  const saveChats = (updatedChats: ChatSession[]) => {
    setChats(updatedChats);
    localStorage.setItem(LOCAL_STORAGE_CHATS_KEY, JSON.stringify(updatedChats));
  };

  // Save settings to localStorage
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const getActiveSession = (): ChatSession | null => {
    return chats.find(s => s.id === activeChatId) || null;
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Chat",
      createdAt: new Date().toISOString(),
      model: "gemini-3.5-flash",
      searchGrounding: false,
      messages: []
    };
    const updated = [newSession, ...chats];
    saveChats(updated);
    setActiveChatId(newId);
    
    // Auto-open sidebar on mobile when creating a new chat to make sure they see it
    if (window.innerWidth < 768) {
      setSidebarIsOpen(false);
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    if (window.innerWidth < 768) {
      setSidebarIsOpen(false); // Close sidebar on mobile select
    }
  };

  const handleDeleteChat = (id: string) => {
    const updated = chats.filter(c => c.id !== id);
    saveChats(updated);
    if (activeChatId === id) {
      if (updated.length > 0) {
        setActiveChatId(updated[0].id);
      } else {
        setActiveChatId(null);
      }
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    const updated = chats.map(c => c.id === id ? { ...c, title: newTitle } : c);
    saveChats(updated);
  };

  const handleClearAllChats = () => {
    saveChats([]);
    setActiveChatId(null);
  };

  const handleChangeModel = (modelId: string) => {
    if (!activeChatId) return;
    const updated = chats.map(c => c.id === activeChatId ? { ...c, model: modelId } : c);
    saveChats(updated);
  };

  const handleChangeSearchGrounding = (enabled: boolean) => {
    if (!activeChatId) return;
    const updated = chats.map(c => c.id === activeChatId ? { ...c, searchGrounding: enabled } : c);
    saveChats(updated);
  };

  const handleSendMessage = async (text: string, searchGrounding: boolean) => {
    let currentSession = getActiveSession();
    let sessionId = activeChatId;

    // If no active session, create one first
    if (!currentSession) {
      const newId = `chat-${Date.now()}`;
      const newSession: ChatSession = {
        id: newId,
        title: "New Chat",
        createdAt: new Date().toISOString(),
        model: "gemini-3.5-flash",
        searchGrounding: searchGrounding,
        messages: []
      };
      currentSession = newSession;
      sessionId = newId;
      saveChats([newSession, ...chats]);
      setActiveChatId(newId);
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...currentSession.messages, userMsg];
    
    // Update state synchronously for immediate response feedback
    const updatedSession = { ...currentSession, messages: updatedMessages };
    const nextChats = chats.map(c => c.id === sessionId ? updatedSession : c);
    saveChats(nextChats);
    setIsLoading(true);

    try {
      // 1. Trigger Title generation if this is the very first user message
      const isFirstMessage = currentSession.messages.length === 0;
      if (isFirstMessage) {
        // Fire and forget title generation to make it fast
        fetch('/api/chat/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        })
        .then(res => res.json())
        .then(data => {
          if (data.title) {
            handleRenameChat(sessionId!, data.title);
          }
        })
        .catch(err => console.error("Title generation error:", err));
      }

      // 2. Fetch conversational response from backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: currentSession.messages,
          model: currentSession.model,
          searchGrounding: searchGrounding
        })
      });

      const data = await response.json();

      if (!response.ok || data.isError) {
        throw new Error(data.error || "Failed to communicate with server");
      }

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        sources: data.sources,
        queries: data.queries
      };

      const finalSession = { ...updatedSession, messages: [...updatedMessages, assistantMsg] };
      const finalChats = chats.map(c => c.id === sessionId ? finalSession : c);
      saveChats(finalChats);
    } catch (error: any) {
      console.error("Chat failure:", error);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `❌ **Error**: ${error.message || "An unexpected error occurred. Please verify your GEMINI_API_KEY in the Secrets panel."}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      const finalSession = { ...updatedSession, messages: [...updatedMessages, errorMsg] };
      const finalChats = chats.map(c => c.id === sessionId ? finalSession : c);
      saveChats(finalChats);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateMessage = async () => {
    const currentSession = getActiveSession();
    if (!currentSession || currentSession.messages.length < 2) return;

    // Pop the last assistant message and retrieve the preceding user message
    const messagesCopy = [...currentSession.messages];
    const lastMsg = messagesCopy[messagesCopy.length - 1];
    if (lastMsg.role !== 'assistant') return;

    messagesCopy.pop(); // Remove the last assistant message
    const userPromptMsg = messagesCopy[messagesCopy.length - 1];
    if (userPromptMsg.role !== 'user') return;

    // Save history minus last assistant reply
    const updatedSession = { ...currentSession, messages: messagesCopy };
    const nextChats = chats.map(c => c.id === activeChatId ? updatedSession : c);
    saveChats(nextChats);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPromptMsg.content,
          history: messagesCopy.slice(0, -1), // History up to before this user prompt
          model: currentSession.model,
          searchGrounding: currentSession.searchGrounding
        })
      });

      const data = await response.json();

      if (!response.ok || data.isError) {
        throw new Error(data.error || "Failed to communicate with server");
      }

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        sources: data.sources,
        queries: data.queries
      };

      const finalSession = { ...updatedSession, messages: [...messagesCopy, assistantMsg] };
      const finalChats = chats.map(c => c.id === activeChatId ? finalSession : c);
      saveChats(finalChats);
    } catch (error: any) {
      console.error("Chat regeneration failure:", error);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `❌ **Error**: ${error.message || "Failed to regenerate response."}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      const finalSession = { ...updatedSession, messages: [...messagesCopy, errorMsg] };
      const finalChats = chats.map(c => c.id === activeChatId ? finalSession : c);
      saveChats(finalChats);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSession = getActiveSession();

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans`}>
      {/* Sidebar collapsible */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onOpenSettings={() => setSettingsIsOpen(true)}
        isOpen={sidebarIsOpen}
        onToggleSidebar={() => setSidebarIsOpen(!sidebarIsOpen)}
        settings={settings}
      />

      {/* Main Conversation viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Absolute floating panel open trigger on desktop */}
        {!sidebarIsOpen && (
          <div className="absolute top-3 left-4 z-40 hidden md:block">
            <button
              id="sidebar-expand-btn-abs"
              onClick={() => setSidebarIsOpen(true)}
              className={`p-2.5 rounded-lg transition-colors border shadow-sm ${
                settings.theme === 'dark'
                  ? 'border-zinc-800 bg-[#212121] text-zinc-400 hover:text-white hover:bg-[#2f2f2f]'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Open sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Small screen mobile sidebar menu overlay */}
        <div className="md:hidden absolute top-3.5 left-3 z-40">
          <button
            id="mobile-sidebar-toggle"
            onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
            className={`p-1.5 rounded-lg border transition-colors ${
              settings.theme === 'dark'
                ? 'bg-[#212121] border-zinc-800 text-zinc-400 hover:text-white'
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        <ChatWindow
          activeSession={activeSession}
          onSendMessage={handleSendMessage}
          onRegenerateMessage={handleRegenerateMessage}
          isLoading={isLoading}
          onToggleSidebar={() => setSidebarIsOpen(!sidebarIsOpen)}
          sidebarIsOpen={sidebarIsOpen}
          settings={settings}
          onChangeModel={handleChangeModel}
          onChangeSearchGrounding={handleChangeSearchGrounding}
        />
      </div>

      {/* Global Settings Modal */}
      <SettingsDialog
        isOpen={settingsIsOpen}
        onClose={() => setSettingsIsOpen(false)}
        settings={settings}
        onChangeSettings={saveSettings}
        onClearAllChats={handleClearAllChats}
      />
    </div>
  );
}
