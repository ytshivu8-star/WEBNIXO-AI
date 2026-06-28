/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Moon, Sun, Trash2, ShieldAlert, Sparkles, Check, Database, Loader2, Info, Search } from 'lucide-react';
import { AppSettings, MODELS } from '../types';
import { renderModelLogo } from './ChatWindow';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  onClearAllChats: () => void;
  onResetCredits?: () => void;
  modelCosts?: Record<string, number>;
}

const loadCashfree = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('cashfree-sdk')) {
      resolve((window as any).Cashfree);
      return;
    }
    const script = document.createElement('script');
    script.id = 'cashfree-sdk';
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      resolve((window as any).Cashfree);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Cashfree checkout SDK.'));
    };
    document.body.appendChild(script);
  });
};

const refillOptions = [
  { credits: 500, price: 159, id: 'refill_500' },
  { credits: 1500, price: 349, id: 'refill_1500' },
  { credits: 3500, price: 599, id: 'refill_3500' },
  { credits: 8000, price: 999, id: 'refill_8000' },
  { credits: 20000, price: 1999, id: 'refill_20000' }
];

export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  onClearAllChats,
  onResetCredits,
  modelCosts = {},
}: SettingsDialogProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [isProcessingRefill, setIsProcessingRefill] = useState<string | null>(null);
  const [refillError, setRefillError] = useState('');
  const [showRefillOptions, setShowRefillOptions] = useState(false);
  const [showModelCosts, setShowModelCosts] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  if (!isOpen) return null;

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onChangeSettings({ ...settings, theme: newTheme });
  };

  const handleRefillCheckout = async (planId: string, amount: number) => {
    try {
      setRefillError('');
      setIsProcessingRefill(planId);

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: settings.userEmail || 'guest@webnixo.ai',
          amount: amount,
          planId: planId
        })
      });

      const responseText = await response.text();
      let orderData: any;
      try {
        orderData = JSON.parse(responseText);
      } catch (err) {
        throw new Error('Invalid response from server');
      }

      if (orderData.error) {
        throw new Error(orderData.error || `Server returned an error`);
      }

      const paymentSessionId = orderData.paymentSessionId || orderData.payment_session_id;
      if (!paymentSessionId) {
        throw new Error('No payment session ID returned from server.');
      }

      const cashfree: any = await loadCashfree();
      const cashfreeInstance = cashfree({ mode: orderData.environment || 'production' });

      cashfreeInstance.checkout({
        paymentSessionId: paymentSessionId,
        returnUrl: window.location.href,
      }).then((result: any) => {
        if (result.error) {
          setRefillError(result.error.message || 'Payment failed or was cancelled.');
          setIsProcessingRefill(null);
        } else if (result.redirect) {
          console.log("Redirection is happening...");
        } else if (result.paymentDetails) {
          console.log("Payment Details:", result.paymentDetails);
        }
      });

    } catch (err: any) {
      console.error('Refill checkout error:', err);
      setRefillError(err.message || 'Failed to initiate checkout.');
      setIsProcessingRefill(null);
    }
  };

  return (
    <div id="settings-dialog-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div 
        id="settings-dialog-box" 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 transform scale-100 backdrop-blur-2xl ${
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

            {/* Refill Credits Section */}
            <div className="py-4 border-t border-zinc-700/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Top-up Credits</span>
                  <span className="text-xs opacity-60">Buy extra credits if you run out</span>
                </div>
                <button
                  onClick={() => setShowRefillOptions(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    settings.theme === 'dark' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Refill Credits</span>
                </button>
              </div>
            </div>

            {/* Model Costs Section */}
            <div className="py-4 border-t border-zinc-700/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium block">Model Credit Costs</span>
                  <span className="text-xs opacity-60">See how many credits each AI model uses</span>
                </div>
                <button
                  onClick={() => setShowModelCosts(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    settings.theme === 'dark' 
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>View Costs</span>
                </button>
              </div>
            </div>

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
      
      {/* Refill Credits Modal Overlay */}
      {showRefillOptions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden transition-all duration-200 transform scale-100 backdrop-blur-2xl p-6 ${
            settings.theme === 'dark' 
              ? 'bg-[#1a1a1a]/95 border-white/10 text-zinc-100' 
              : 'bg-white/95 border-zinc-200/80 text-zinc-800'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                <Database className="w-3.5 h-3.5" />
                <span>INSTANT TOP-UP</span>
              </div>
              <button
                onClick={() => setShowRefillOptions(false)}
                className={`p-2 rounded-full transition-colors ${
                  settings.theme === 'dark' ? 'hover:bg-white/10 text-zinc-400 hover:text-white' : 'hover:bg-black/5 text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center space-y-3 mb-8">
              <h3 className="text-xl md:text-3xl font-black tracking-tight leading-tight">Refill Your Balance</h3>
              <p className={`text-xs md:text-sm max-w-md mx-auto ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Running low on credits? Top up instantly and keep building without interruptions.
              </p>
            </div>
            
            {refillError && (
              <div className="text-xs text-red-500 bg-red-500/10 p-3 mb-6 rounded-xl border border-red-500/20 text-center font-medium">
                {refillError}
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {refillOptions.map((opt) => (
                <div key={opt.id} className={`p-4 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-xl hover:-translate-y-1 group cursor-pointer ${
                  settings.theme === 'dark' 
                    ? 'bg-zinc-900/60 border-white/10 hover:border-emerald-500/30' 
                    : 'bg-white/80 border-zinc-200 hover:border-emerald-500/30 hover:shadow-xl'
                }`} onClick={() => handleRefillCheckout(opt.id, opt.price)}>
                  <div className="text-center space-y-2 mb-4">
                    <div className="text-xl font-black text-emerald-400 drop-shadow-sm">
                      {opt.credits.toLocaleString()} <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-widest mt-1">Credits</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold">₹{opt.price}</span>
                  </div>
                  <button className={`w-full py-2 mt-4 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    isProcessingRefill === opt.id
                      ? 'bg-zinc-600 text-white'
                      : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
                  }`}>
                    {isProcessingRefill === opt.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Model Costs Modal Overlay */}
      {showModelCosts && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className={`w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl border overflow-hidden flex flex-col transition-all duration-200 transform scale-100 backdrop-blur-2xl ${
            settings.theme === 'dark' 
              ? 'bg-[#1a1a1a]/95 border-white/10 text-zinc-100' 
              : 'bg-white/95 border-zinc-200/80 text-zinc-800'
          }`}>
            <div className="p-6 border-b border-zinc-700/20 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
              <div className="inline-flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-bold tracking-tight flex items-center justify-between">
                    Model Credit Costs
                    <button
                      onClick={() => setShowModelCosts(false)}
                      className={`sm:hidden p-2 -mr-2 rounded-full transition-colors ${
                        settings.theme === 'dark' ? 'hover:bg-white/10 text-zinc-400 hover:text-white' : 'hover:bg-black/5 text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </h3>
                  <p className={`text-xs ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>See how many credits each AI model uses per request.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 sm:w-64 transition-colors ${
                  settings.theme === 'dark' 
                    ? 'bg-zinc-900/50 border-white/10 focus-within:border-emerald-500/50' 
                    : 'bg-zinc-100 border-zinc-200 focus-within:border-emerald-500/50'
                }`}>
                  <Search className={`w-4 h-4 ${settings.theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
                  <input 
                    type="text" 
                    placeholder="Search models..." 
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                  />
                  {modelSearchQuery && (
                    <button onClick={() => setModelSearchQuery('')} className="opacity-50 hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowModelCosts(false)}
                  className={`hidden sm:flex p-2 rounded-full transition-colors ${
                    settings.theme === 'dark' ? 'hover:bg-white/10 text-zinc-400 hover:text-white' : 'hover:bg-black/5 text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MODELS.filter(m => m.id !== 'compare-all' && (m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) || m.id.toLowerCase().includes(modelSearchQuery.toLowerCase()))).map((model) => {
                  const cost = modelCosts?.[model.id] || 1;
                  return (
                    <div key={model.id} className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                      settings.theme === 'dark' 
                        ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60' 
                        : 'bg-zinc-50/50 border-zinc-200 hover:bg-zinc-100'
                    }`}>
                      <div className="w-10 h-10 rounded-xl bg-black/5 border border-white/10 flex items-center justify-center shrink-0">
                        {renderModelLogo(model.id, "w-6 h-6")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{model.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Database className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-500">
                            {cost} {cost === 1 ? 'Credit' : 'Credits'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
