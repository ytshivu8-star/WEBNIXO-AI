/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Moon, Sun, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  onClearAllChats: () => void;
  onResetCredits?: () => void;
}

export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  onClearAllChats,
  onResetCredits,
}: SettingsDialogProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  if (!isOpen) return null;

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onChangeSettings({ ...settings, theme: newTheme });
  };

  return (
    <div id="settings-dialog-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div 
        id="settings-dialog-box" 
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 transform scale-100 backdrop-blur-2xl ${
          settings.theme === 'dark' 
            ? 'bg-[#1a1a1a]/95 border-white/10 text-zinc-100' 
            : 'bg-white/95 border-zinc-200/80 text-zinc-800'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold font-display">Settings</h2>
          </div>
          <button 
            id="close-settings-btn"
            onClick={onClose} 
            className={`p-1.5 rounded-full transition-colors ${
              settings.theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Account Info */}
          <div className={`p-4 rounded-xl border ${
            settings.theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
          }`}>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60">Connected User</span>
            <p className="text-sm font-medium mt-1 select-all">{settings.userEmail || "guest@webnixo.ai"}</p>
          </div>

          {/* Settings Options */}
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium block">Color theme</span>
                <span className="text-xs opacity-60">Switch between light and dark display modes</span>
              </div>
              <button
                id="toggle-theme-btn"
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  settings.theme === 'dark' 
                    ? 'bg-white/5 text-emerald-400 border border-white/10 hover:bg-white/10 backdrop-blur-md' 
                    : 'bg-black/5 text-emerald-600 border border-black/5 hover:bg-black/10 backdrop-blur-md'
                }`}
              >
                {settings.theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Credits Reset for testing */}
            {onResetCredits && (
              <div className="flex items-center justify-between py-2 border-t border-zinc-700/20 pt-4">
                <div>
                  <span className="text-sm font-medium block">Testing Tools</span>
                  <span className="text-xs opacity-60">Instantly refill your credit balance back to the plan limit</span>
                </div>
                <button
                  onClick={onResetCredits}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    settings.theme === 'dark' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Refill Credits</span>
                </button>
              </div>
            )}

            {/* Clear conversations */}
            <div className="flex items-center justify-between py-2 border-t border-zinc-700/20 pt-4">
              <div>
                <span className="text-sm font-medium block text-red-500">Delete chats</span>
                <span className="text-xs opacity-60">Permanently clear all chat sessions from your history</span>
              </div>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500 font-bold uppercase tracking-wider animate-pulse">Are you sure?</span>
                  <button
                    id="confirm-clear-all-btn"
                    onClick={() => {
                      onClearAllChats();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Yes, clear</span>
                  </button>
                  <button
                    id="cancel-clear-all-btn"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-600 hover:bg-zinc-700 text-white transition-all"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <button
                  id="clear-all-chats-btn"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear history</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 flex justify-between items-center text-xs opacity-50 border-t border-zinc-700/20 ${
          settings.theme === 'dark' ? 'bg-black/40' : 'bg-zinc-50/50'
        }`}>
          <span>WEBNIXO AI v1.0.0</span>
          <div className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Secure Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
