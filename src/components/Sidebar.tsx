/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Settings, 
  PanelLeftClose, 
  Sparkles,
  ChevronRight,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { ChatSession, AppSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { WebnixoLogo, renderModelLogo } from './ChatWindow';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  settings: AppSettings;
  onLogout?: () => void;
  isPremium?: boolean;
  onOpenPricing?: () => void;
  onOpenLegal?: (tab: 'faq' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'contact') => void;
  userPlan?: 'free' | 'starter' | 'pro';
  creditsRemaining?: number;
  creditsLimit?: number;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  isOpen,
  onToggleSidebar,
  settings,
  onLogout,
  isPremium,
  onOpenPricing,
  onOpenLegal,
  userPlan,
  creditsRemaining,
  creditsLimit,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Group chats by age
  const groupChats = (chatList: ChatSession[]) => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const pastWeek: ChatSession[] = [];
    const older: ChatSession[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfSevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Sort by createdAt descending
    const sorted = [...chatList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sorted.forEach(chat => {
      const chatDate = new Date(chat.createdAt);
      if (chatDate >= startOfToday) {
        today.push(chat);
      } else if (chatDate >= startOfYesterday) {
        yesterday.push(chat);
      } else if (chatDate >= startOfSevenDaysAgo) {
        pastWeek.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { today, yesterday, pastWeek, older };
  };

  const { today, yesterday, pastWeek, older } = groupChats(chats);

  const startEditing = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleValue(chat.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitleValue.trim()) {
      onRenameChat(id, editTitleValue.trim());
    }
    setEditingChatId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      if (editTitleValue.trim()) {
        onRenameChat(id, editTitleValue.trim());
      }
      setEditingChatId(null);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const renderChatItem = (chat: ChatSession) => {
    const isActive = chat.id === activeChatId;
    const isEditing = chat.id === editingChatId;

    return (
      <div
        id={`chat-item-${chat.id}`}
        key={chat.id}
        onClick={() => !isEditing && onSelectChat(chat.id)}
        className={`group relative flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg cursor-pointer text-sm font-medium transition-all duration-150 ${
          isActive 
            ? settings.theme === 'dark' ? 'bg-white/10 text-white border border-white/10 backdrop-blur-lg shadow-sm' : 'bg-black/5 text-zinc-900 border border-black/5 backdrop-blur-md shadow-xs' 
            : settings.theme === 'dark' ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-zinc-600 hover:bg-black/5 hover:text-zinc-900'
        }`}
      >
        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
          {renderModelLogo(chat.model || 'gemini-3.5-flash', "w-4.5 h-4.5")}
        </div>
        
        {isEditing ? (
          <input
            id={`rename-input-${chat.id}`}
            type="text"
            value={editTitleValue}
            onChange={(e) => setEditTitleValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, chat.id)}
            onClick={(e) => e.stopPropagation()}
            className={`w-full bg-transparent border-0 outline-none p-0 text-sm focus:ring-0 ${
              settings.theme === 'dark' ? 'text-white' : 'text-zinc-900'
            }`}
            autoFocus
          />
        ) : (
          <span className="truncate pr-16 block flex-1">{chat.title}</span>
        )}

        {/* Hover / Active Actions */}
        <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 ${
          isEditing || confirmDeleteId === chat.id ? 'flex' : 'hidden group-hover:flex'
        }`}>
          {isEditing ? (
            <>
              <button 
                id={`save-rename-btn-${chat.id}`}
                onClick={(e) => saveRename(chat.id, e)} 
                className="p-1 hover:text-emerald-500 rounded transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button 
                id={`cancel-rename-btn-${chat.id}`}
                onClick={cancelRename} 
                className="p-1 hover:text-red-500 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : confirmDeleteId === chat.id ? (
            <div className="flex items-center gap-1 bg-red-500/10 dark:bg-red-500/20 px-1 py-0.5 rounded border border-red-500/20">
              <button 
                id={`confirm-delete-btn-${chat.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                  setConfirmDeleteId(null);
                }} 
                className="p-1 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all"
                title="Confirm delete"
              >
                <Check className="w-3 h-3" />
              </button>
              <button 
                id={`cancel-delete-btn-${chat.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(null);
                }} 
                className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition-all"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <button 
                id={`edit-chat-btn-${chat.id}`}
                onClick={(e) => startEditing(chat, e)} 
                className={`p-1 rounded hover:opacity-100 opacity-65 ${
                  settings.theme === 'dark' ? 'hover:bg-zinc-800 hover:text-white' : 'hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                id={`delete-chat-btn-${chat.id}`}
                onClick={(e) => handleDelete(chat.id, e)} 
                className={`p-1 rounded hover:opacity-100 opacity-65 ${
                  settings.theme === 'dark' ? 'hover:bg-zinc-800 hover:text-red-400' : 'hover:bg-zinc-200 hover:text-red-500'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (title: string, list: ChatSession[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1 py-2">
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 select-none">
          {title}
        </h3>
        <div className="space-y-0.5">
          {list.map(renderChatItem)}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id="sidebar-container"
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`h-full shrink-0 flex flex-col border-r fixed md:relative md:left-auto left-0 top-0 bottom-0 z-50 w-[270px] md:w-[260px] h-screen md:h-full overflow-hidden select-none shadow-2xl md:shadow-none ${
            settings.theme === 'dark' 
              ? 'bg-black border-white/5 text-zinc-100' 
              : 'bg-zinc-100 border-zinc-200/80 text-zinc-800 backdrop-blur-md'
          }`}
        >
          {/* Brand header branding */}
          <div className={`p-3.5 flex items-center gap-2 select-none border-b shrink-0 ${
            settings.theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-zinc-200/50 bg-black/5'
          }`}>
            <WebnixoLogo className="w-6 h-6 text-emerald-400 shrink-0 animate-pulse" />
            <span className="font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 font-display">
              WEBNIXO AI
            </span>
          </div>

          {/* Main Navigation Tabs */}
          <div className={`px-3 pt-3 pb-1.5 flex flex-col gap-1 shrink-0 border-b ${
            settings.theme === 'dark' ? 'border-white/5' : 'border-zinc-200/50'
          }`}>
            <button
              onClick={() => {
                if (activeChatId) {
                  onSelectChat(activeChatId);
                } else if (chats.length > 0) {
                  onSelectChat(chats[0].id);
                } else {
                  onNewChat();
                }
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 text-left cursor-pointer ${
                location.pathname !== '/image-generator'
                  ? settings.theme === 'dark' ? 'bg-white/5 text-white' : 'bg-black/5 text-zinc-900 font-extrabold'
                  : settings.theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>AI Chat Workspace</span>
            </button>

            <button
              onClick={() => {
                navigate('/image-generator');
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 text-left cursor-pointer ${
                location.pathname === '/image-generator'
                  ? settings.theme === 'dark' ? 'bg-white/5 text-white' : 'bg-black/5 text-zinc-900 font-extrabold'
                  : settings.theme === 'dark' ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Imagen Studio</span>
              </div>
              <span className="text-[8px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                Premium
              </span>
            </button>
          </div>

          {/* Top Panel Actions */}
          <div className="p-3 flex items-center justify-between gap-2 border-b border-white/5 shrink-0">
            <button
              id="new-chat-btn-sidebar"
              onClick={onNewChat}
              className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 text-left ${
                settings.theme === 'dark'
                  ? 'border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white'
                  : 'border-black/10 bg-white/45 backdrop-blur-sm hover:bg-white/80 text-zinc-900 shadow-xs'
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="truncate">New chat</span>
            </button>

            <button
              id="collapse-sidebar-btn"
              onClick={onToggleSidebar}
              className={`p-2.5 rounded-lg transition-colors border ${
                settings.theme === 'dark'
                  ? 'border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white'
                  : 'border-black/10 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 bg-white/50 backdrop-blur-xs'
              }`}
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation History List */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
            {chats.length === 0 ? (
              <div className="text-center py-8 px-4 text-zinc-500 space-y-1.5 select-none">
                <MessageSquare className="w-8 h-8 mx-auto stroke-1 opacity-40" />
                <p className="text-xs">No chat history yet</p>
              </div>
            ) : (
              <>
                {renderSection('Today', today)}
                {renderSection('Yesterday', yesterday)}
                {renderSection('Previous 7 Days', pastWeek)}
                {renderSection('Older', older)}
              </>
            )}
          </div>

          {/* Premium Billing Section */}
          <div className="mx-3 mb-2 flex flex-col gap-1.5">
            <div className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
              isPremium 
                ? (settings.theme === 'dark' 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                : (settings.theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    : 'bg-zinc-100 border-zinc-200 text-zinc-600')
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate capitalize">{(userPlan || 'free')} Plan</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${
                  userPlan === 'pro' 
                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {userPlan === 'pro' ? 'PRO' : userPlan === 'starter' ? 'STARTER' : 'FREE'}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] opacity-75">
                  <span>Usage Credits:</span>
                  <span className="font-mono">{creditsRemaining ?? 30} / {creditsLimit ?? 30}</span>
                </div>
                {/* Visual indicator bar */}
                <div className="w-full h-1 bg-zinc-700/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      userPlan === 'pro' ? 'bg-sky-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, ((creditsRemaining ?? 30) / (creditsLimit ?? 30)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {!isPremium && onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className={`p-2.5 rounded-2xl border text-left text-xs font-bold transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  settings.theme === 'dark' 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border-white/5 text-zinc-200 hover:border-emerald-500/25' 
                    : 'bg-gradient-to-r from-emerald-50/70 to-sky-50/70 border-zinc-200 text-zinc-800 hover:border-emerald-500/35 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold tracking-tight text-xs">Upgrade to Pro</p>
                    <p className="text-[10px] font-medium opacity-60 mt-0.5 truncate">Gain 3,000 Credits & Claude/GPT</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Profile / Connection section */}
          <div className={`p-3 border-t flex flex-col gap-2.5 ${
            settings.theme === 'dark' ? 'border-white/5' : 'border-zinc-200/50'
          }`}>
            <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
              settings.theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-zinc-300 backdrop-blur-md hover:bg-white/10 transition-colors' 
                : 'bg-white/50 border-black/5 text-zinc-700 backdrop-blur-sm hover:bg-white/80 transition-colors'
            }`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                  {(settings.userEmail || "G").charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold truncate leading-none text-zinc-400">Connected</p>
                  <p className="text-xs font-medium truncate mt-0.5" title={settings.userEmail}>
                    {settings.userEmail || "Guest User"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="open-settings-btn-sidebar"
                  onClick={onOpenSettings}
                  className={`p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg transition-colors ${
                    settings.theme === 'dark' ? 'hover:bg-white/15 text-zinc-400 hover:text-white' : 'hover:bg-black/10 text-zinc-500 hover:text-zinc-800'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {onLogout && (
                  <button
                    id="logout-btn-sidebar"
                    onClick={onLogout}
                    className={`p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg transition-colors ${
                      settings.theme === 'dark' ? 'hover:bg-red-500/15 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                    }`}
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
