/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChatSession, Message, MODELS, AppSettings } from './types';

export const MODEL_CREDIT_COSTS: Record<string, number> = {
  'gemini-3.5-flash': 1,
  'deepseek': 1,
  'mistral': 2,
  'grok': 4,
  'perplexity': 4,
  'chatgpt': 5,
  'claude': 5,
  'gemini': 5,
  'gemini-3.1-pro-preview': 5,
};
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsDialog from './components/SettingsDialog';
import LandingPage from './components/LandingPage';
import PaymentVerificationPage from './components/PaymentVerificationPage';
import PricingModal from './components/PricingModal';
import LegalCenter, { LegalTab } from './components/LegalCenter';
import { Menu, PanelLeftOpen, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const LOCAL_STORAGE_CHATS_KEY = 'webnixo_ai_chats';
const LOCAL_STORAGE_SETTINGS_KEY = 'webnixo_ai_settings';

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);

  // Custom High-Fidelity SPA Path Router
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
    }
  };

  const settingsIsOpen = currentPath === '/settings';

  const handleCloseModal = () => {
    if (activeChatId) {
      navigate(`/chat/${activeChatId}`);
    } else {
      navigate('/');
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    clearOnNewChat: false,
    userEmail: 'ytshivu8@gmail.com' // Connected user email from runtime context
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('webnixo_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      return localStorage.getItem('webnixo_premium_user') === 'true';
    } catch {
      return false;
    }
  });

  const [userPlan, setUserPlan] = useState<'free' | 'starter' | 'pro'>(() => {
    try {
      return (localStorage.getItem('webnixo_user_plan') as 'free' | 'starter' | 'pro') || 'free';
    } catch {
      return 'free';
    }
  });

  const [creditsLimit, setCreditsLimit] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('webnixo_credits_limit')) || 20;
    } catch {
      return 20;
    }
  });

  const [creditsRemaining, setCreditsRemaining] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`webnixo_credits_remaining_${settings.userEmail || 'default'}`);
      if (stored !== null) return Number(stored);
      const plan = localStorage.getItem('webnixo_user_plan') || 'free';
      return plan === 'pro' ? 3000 : plan === 'starter' ? 1000 : 20;
    } catch {
      return 20;
    }
  });

  const updateCredits = (remaining: number, limit?: number) => {
    setCreditsRemaining(remaining);
    const emailStr = (settings.userEmail || 'default').toLowerCase();
    localStorage.setItem(`webnixo_credits_remaining_${emailStr}`, String(remaining));
    if (limit !== undefined) {
      setCreditsLimit(limit);
      localStorage.setItem('webnixo_credits_limit', String(limit));
    }
  };

  const updatePlan = (plan: 'free' | 'starter' | 'pro') => {
    setUserPlan(plan);
    localStorage.setItem('webnixo_user_plan', plan);
    setIsPremium(plan !== 'free');
    localStorage.setItem('webnixo_premium_user', plan !== 'free' ? 'true' : 'false');
    const limit = plan === 'pro' ? 3000 : plan === 'starter' ? 1000 : 20;
    updateCredits(limit, limit);
  };

  const handleResetCredits = () => {
    const limit = userPlan === 'pro' ? 3000 : userPlan === 'starter' ? 1000 : 20;
    updateCredits(limit, limit);
  };

  const checkPremiumStatus = async (email: string) => {
    try {
      const res = await fetch(`/api/payment/status?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        const emailStr = email.toLowerCase();
        if (data.isPremium) {
          setIsPremium(true);
          localStorage.setItem('webnixo_premium_user', 'true');
          
          const planId = data.plan?.plan_id || '';
          if (planId.includes('pro')) {
            setUserPlan('pro');
            localStorage.setItem('webnixo_user_plan', 'pro');
            setCreditsLimit(3000);
            localStorage.setItem('webnixo_credits_limit', '3000');
            const key = `webnixo_credits_remaining_${emailStr}`;
            if (localStorage.getItem(key) === null) {
              setCreditsRemaining(3000);
              localStorage.setItem(key, '3000');
            }
          } else {
            setUserPlan('starter');
            localStorage.setItem('webnixo_user_plan', 'starter');
            setCreditsLimit(1000);
            localStorage.setItem('webnixo_credits_limit', '1000');
            const key = `webnixo_credits_remaining_${emailStr}`;
            if (localStorage.getItem(key) === null) {
              setCreditsRemaining(1000);
              localStorage.setItem(key, '1000');
            }
          }
        } else {
          setIsPremium(false);
          localStorage.removeItem('webnixo_premium_user');
          setUserPlan('free');
          localStorage.setItem('webnixo_user_plan', 'free');
          setCreditsLimit(20);
          localStorage.setItem('webnixo_credits_limit', '20');
          const key = `webnixo_credits_remaining_${emailStr}`;
          if (localStorage.getItem(key) === null) {
            setCreditsRemaining(20);
            localStorage.setItem(key, '20');
          }
        }
      }
    } catch (e) {
      console.error('[Premium Status Check] Error:', e);
    }
  };

  const handleLogin = (email: string, name: string) => {
    setIsLoggedIn(true);
    sessionStorage.setItem('webnixo_logged_in', 'true');
    const updatedSettings = { ...settings, userEmail: email };
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updatedSettings));
    
    // Check premium status on login
    checkPremiumStatus(email);

    // Sync user profile to backend database asynchronously
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: name || "Anonymous User",
        theme: settings.theme,
        credits: creditsRemaining
      })
    }).catch(err => console.error("Profile DB sync skipped:", err));

    // Auto-create a chat if there's none
    if (chats.length === 0) {
      const newId = `chat-${Date.now()}`;
      const newSession: ChatSession = {
        id: newId,
        title: "New Chat",
        createdAt: new Date().toISOString(),
        model: "gemini-3.5-flash",
        searchGrounding: false,
        messages: []
      };
      saveChats([newSession]);
      setActiveChatId(newId);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(false);
    setIsPremium(false);
    sessionStorage.removeItem('webnixo_logged_in');
    localStorage.removeItem('webnixo_premium_user');
  };

  // Google OAuth Session Check & Message Event Listener
  useEffect(() => {
    const isPopup = window.opener || window.name === 'google_oauth_popup';
    if (isPopup) {
      const checkAndClose = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            console.log('[Popup Auto-Close] Logged in user detected inside popup. Closing window.');
            try {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            } catch (e) {
              console.error('[Popup Auto-Close] Failed to message opener:', e);
            }
            window.close();
          }
        } catch (err) {
          console.error('[Popup Auto-Close] Error checking session:', err);
        }
      };
      
      checkAndClose();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          console.log('[Popup Auto-Close] Auth state change logged in inside popup. Closing window.');
          try {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          } catch (e) {
            console.error('[Popup Auto-Close] Failed to message opener:', e);
          }
          window.close();
        }
      });
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Google OAuth Session Check & Message Event Listener
  useEffect(() => {
    // Check current active session on boot
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        const email = session.user.email || 'user@example.com';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Google User';
        handleLogin(email, name);
      }
    });

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        const email = session.user.email || 'user@example.com';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Google User';
        handleLogin(email, name);
      } else {
        setIsLoggedIn(false);
        setIsPremium(false);
      }
    });

    // Listen to messaging from popup auth flow
    const handleMessage = (event: MessageEvent) => {
      // Validate origin format safely for developers
      if (!event.origin.includes('.run.app') && !event.origin.includes('localhost') && !event.origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        console.log('[Parent Frame] OAuth Login succeeded signal received from popup.');
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session && session.user) {
            const email = session.user.email || 'user@example.com';
            const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Google User';
            handleLogin(email, name);
          }
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Popup Auth Callback listener (runs when this page is loaded inside popup frame)
  useEffect(() => {
    if (window.location.pathname.startsWith('/auth/callback')) {
      const handlePopupCallback = async () => {
        try {
          const isPopup = window.opener || window.name === 'google_oauth_popup';
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            console.log('[Popup Callbacks] Session established. Posting message to opener.');
            if (window.opener) {
              try {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              } catch (e) {
                console.error('[Popup Callback] Failed to message opener:', e);
              }
            }
            if (isPopup) {
              window.close();
            } else {
              window.location.href = '/';
            }
          } else {
            // Wait brief moment for auth state to populate
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
              if (session && session.user) {
                if (window.opener) {
                  try {
                    window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  } catch (e) {
                    console.error('[Popup Callback] Failed to message opener on state change:', e);
                  }
                }
                if (isPopup) {
                  window.close();
                } else {
                  window.location.href = '/';
                }
                subscription.unsubscribe();
              }
            });
            setTimeout(() => {
              subscription.unsubscribe();
              if (isPopup) {
                window.close();
              } else {
                window.location.href = '/';
              }
            }, 6000);
          }
        } catch (e) {
          console.error('[Popup Callback] Error finishing session:', e);
          window.close();
        }
      };
      handlePopupCallback();
    }
  }, []);

  // Load chats and settings on mount with dynamic initial routing fallback
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem(LOCAL_STORAGE_CHATS_KEY);
      let loadedChats: ChatSession[] = [];
      if (savedChats) {
        loadedChats = JSON.parse(savedChats);
        setChats(loadedChats);
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
        loadedChats = [initialSession];
        setChats(loadedChats);
      }

      // Check current URL for deep link to a specific chat session
      const currentPathName = window.location.pathname;
      let activeIdToSet: string | null = null;
      if (currentPathName.startsWith('/chat/')) {
        const pathId = currentPathName.substring(6);
        if (loadedChats.some(c => c.id === pathId)) {
          activeIdToSet = pathId;
        }
      }

      if (!activeIdToSet && loadedChats.length > 0) {
        activeIdToSet = loadedChats[0].id;
      }

      if (activeIdToSet) {
        setActiveChatId(activeIdToSet);
        if (currentPathName === '/' || currentPathName === '/chat') {
          window.history.replaceState(null, '', `/chat/${activeIdToSet}`);
          setCurrentPath(`/chat/${activeIdToSet}`);
        }
      }

      const savedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error("Error loading localStorage data:", e);
    }
  }, []);

  // Sync back/forward navigation state to load appropriate active chat session
  useEffect(() => {
    if (currentPath.startsWith('/chat/')) {
      const id = currentPath.substring(6);
      if (id && chats.some(c => c.id === id)) {
        if (activeChatId !== id) {
          setActiveChatId(id);
        }
      }
    }
  }, [currentPath, chats]);

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
    navigate(`/chat/${newId}`);
    
    // Auto-open sidebar on mobile when creating a new chat to make sure they see it
    if (window.innerWidth < 768) {
      setSidebarIsOpen(false);
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    navigate(`/chat/${id}`);
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
        navigate(`/chat/${updated[0].id}`);
      } else {
        setActiveChatId(null);
        navigate('/');
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
    navigate('/');
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

  const handleChangeCompareModels = (modelIds: string[]) => {
    if (!activeChatId) return;
    const updated = chats.map(c => c.id === activeChatId ? { ...c, compareModelIds: modelIds } : c);
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

    // 1. Calculate and verify credit costs first
    let cost = 1;
    if (currentSession.model === 'compare-all') {
      const compareModels = currentSession.compareModelIds && currentSession.compareModelIds.length > 0
        ? currentSession.compareModelIds
        : ['chatgpt', 'claude', 'gemini', 'grok', 'deepseek'];
      cost = compareModels.reduce((sum, m) => sum + (MODEL_CREDIT_COSTS[m] || 1), 0);
    } else {
      cost = MODEL_CREDIT_COSTS[currentSession.model] || 1;
    }

    if (creditsRemaining < cost) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `⚠️ **Insufficient Credits**: This request requires **${cost} credit${cost > 1 ? 's' : ''}** using **${MODELS.find(m => m.id === currentSession?.model)?.name || currentSession?.model}**, but you only have **${creditsRemaining} credit${creditsRemaining === 1 ? '' : 's'}** remaining.\n\n[Please click here to upgrade your plan or reset your credits.](pricing)`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      const finalSession = { ...currentSession, messages: [...currentSession.messages, errorMsg] };
      saveChats(chats.map(c => c.id === sessionId ? finalSession : c));
      navigate('/pricing');
      return;
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
      // Deduct credits on successful start/prep of the message invocation
      updateCredits(Math.max(0, creditsRemaining - cost));

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
      if (currentSession.model === 'compare-all') {
        const compareModels = currentSession.compareModelIds && currentSession.compareModelIds.length > 0
          ? currentSession.compareModelIds
          : ['chatgpt', 'claude', 'gemini', 'grok', 'deepseek'];
        
        // Initial compares state
        const initialCompares: Record<string, any> = {};
        compareModels.forEach(m => {
          const modelObj = MODELS.find(x => x.id === m);
          const mName = modelObj ? modelObj.name : m;

          initialCompares[m] = {
            modelName: mName,
            content: '',
            isLoading: true
          };
        });

        const assistantMsg: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          compares: initialCompares
        };

        const finalSession = { ...updatedSession, messages: [...updatedMessages, assistantMsg] };
        saveChats(chats.map(c => c.id === sessionId ? finalSession : c));

        // Call each model in parallel
        await Promise.all(
          compareModels.map(async (m) => {
            try {
              const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: text,
                  history: currentSession!.messages,
                  model: m,
                  searchGrounding: searchGrounding
                })
              });

              const data = await res.json();

              if (!res.ok || data.isError) {
                throw new Error(data.error || "Generation failed");
              }

              setChats(prev => {
                const updatedChats = prev.map(c => {
                  if (c.id === sessionId) {
                    const msgs = [...c.messages];
                    const lastMsg = { ...msgs[msgs.length - 1] };
                    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.compares) {
                      lastMsg.compares = {
                        ...lastMsg.compares,
                        [m]: {
                          ...lastMsg.compares[m],
                          content: data.content,
                          isLoading: false
                        }
                      };
                      msgs[msgs.length - 1] = lastMsg;
                    }
                    return { ...c, messages: msgs };
                  }
                  return c;
                });
                localStorage.setItem(LOCAL_STORAGE_CHATS_KEY, JSON.stringify(updatedChats));
                return updatedChats;
              });

            } catch (err: any) {
              console.error(`Comparison failed for ${m}:`, err);
              setChats(prev => {
                const updatedChats = prev.map(c => {
                  if (c.id === sessionId) {
                    const msgs = [...c.messages];
                    const lastMsg = { ...msgs[msgs.length - 1] };
                    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.compares) {
                      lastMsg.compares = {
                        ...lastMsg.compares,
                        [m]: {
                          ...lastMsg.compares[m],
                          content: `❌ **Error**: ${err.message || "Failed to respond. Please ensure GEMINI_API_KEY is configured."}`,
                          isLoading: false,
                          error: err.message
                        }
                      };
                      msgs[msgs.length - 1] = lastMsg;
                    }
                    return { ...c, messages: msgs };
                  }
                  return c;
                });
                localStorage.setItem(LOCAL_STORAGE_CHATS_KEY, JSON.stringify(updatedChats));
                return updatedChats;
              });
            }
          })
        );

        setIsLoading(false);
        return;
      }

      // 2. Fetch conversational response from backend (for normal single-model chat)
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

    // Verify credits for regeneration
    const cost = MODEL_CREDIT_COSTS[currentSession.model] || 1;
    if (creditsRemaining < cost) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `⚠️ **Insufficient Credits**: This request requires **${cost} credit${cost > 1 ? 's' : ''}**, but you only have **${creditsRemaining} credit${creditsRemaining === 1 ? '' : 's'}** remaining.\n\n[Please click here to upgrade your plan or reset your credits.](pricing)`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      const finalSession = { ...currentSession, messages: [...messagesCopy, errorMsg] };
      saveChats(chats.map(c => c.id === activeChatId ? finalSession : c));
      navigate('/pricing');
      return;
    }

    // Save history minus last assistant reply
    const updatedSession = { ...currentSession, messages: messagesCopy };
    const nextChats = chats.map(c => c.id === activeChatId ? updatedSession : c);
    saveChats(nextChats);
    setIsLoading(true);

    try {
      // Deduct credits
      updateCredits(Math.max(0, creditsRemaining - cost));

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

  const pricingIsOpen = currentPath === '/pricing';
  const legalIsOpen = currentPath.startsWith('/legal');
  
  let legalActiveTab: LegalTab = 'faq';
  if (currentPath === '/legal/privacy') legalActiveTab = 'privacy';
  else if (currentPath === '/legal/terms') legalActiveTab = 'terms';
  else if (currentPath === '/legal/refund') legalActiveTab = 'refund';
  else if (currentPath === '/legal/contact') legalActiveTab = 'contact';

  const handleOpenLegal = (tab: LegalTab = 'faq') => {
    navigate(`/legal/${tab}`);
  };

  const activeSession = getActiveSession();

  // Intercept special routes
  const isAuthCallbackPath = window.location.pathname.startsWith('/auth/callback');
  const isPaymentVerifyPath = window.location.pathname.startsWith('/payment-verify');

  if (isAuthCallbackPath) {
    return (
      <div className="min-h-screen bg-[#212121] flex flex-col items-center justify-center text-zinc-100 p-6 text-center select-none font-sans">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
          <h2 className="text-xl font-bold tracking-tight">Authenticating Secure Workspace...</h2>
          <p className="text-xs text-zinc-400">Verifying session keys with Google. This window will close automatically.</p>
        </div>
      </div>
    );
  }

  if (isPaymentVerifyPath) {
    return (
      <PaymentVerificationPage 
        theme={settings.theme} 
        onReturn={() => { window.location.href = '/'; }} 
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LandingPage settings={settings} onLogin={handleLogin} onOpenLegal={handleOpenLegal} />
        <LegalCenter
          isOpen={legalIsOpen}
          onClose={handleCloseModal}
          initialTab={legalActiveTab}
          theme={settings.theme}
        />
      </>
    );
  }

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
        onOpenSettings={() => navigate('/settings')}
        isOpen={sidebarIsOpen}
        onToggleSidebar={() => setSidebarIsOpen(!sidebarIsOpen)}
        settings={settings}
        onLogout={handleLogout}
        isPremium={isPremium}
        onOpenPricing={() => navigate('/pricing')}
        onOpenLegal={handleOpenLegal}
        userPlan={userPlan}
        creditsRemaining={creditsRemaining}
        creditsLimit={creditsLimit}
      />

      {/* Mobile Sidebar backdrop overlay */}
      {sidebarIsOpen && (
        <div 
          onClick={() => setSidebarIsOpen(false)} 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in cursor-pointer"
        />
      )}

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
          isPremium={isPremium}
          onOpenPricing={() => navigate('/pricing')}
          onChangeCompareModels={handleChangeCompareModels}
          onOpenLegal={handleOpenLegal}
          userPlan={userPlan}
        />
      </div>

      {/* Global Settings Modal */}
      <SettingsDialog
        isOpen={settingsIsOpen}
        onClose={handleCloseModal}
        settings={settings}
        onChangeSettings={saveSettings}
        onClearAllChats={handleClearAllChats}
        onResetCredits={handleResetCredits}
      />

      {/* Cashfree PG Pricing modal */}
      <PricingModal
        isOpen={pricingIsOpen}
        onClose={handleCloseModal}
        userEmail={settings.userEmail}
        theme={settings.theme}
        onOpenLegal={handleOpenLegal}
        userPlan={userPlan}
      />

      {/* Help & Legal Center Modal */}
      <LegalCenter
        isOpen={legalIsOpen}
        onClose={handleCloseModal}
        initialTab={legalActiveTab}
        theme={settings.theme}
      />
    </div>
  );
}
