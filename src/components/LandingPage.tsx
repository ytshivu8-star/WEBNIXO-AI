import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Sparkle,
  Globe, 
  Terminal, 
  PenTool, 
  Lightbulb, 
  Lock, 
  ArrowRight, 
  User, 
  Mail, 
  Cpu, 
  Layers, 
  Shield, 
  Activity,
  TrendingUp,
  Check,
  Zap,
  TrendingDown
} from 'lucide-react';
import { 
  WebnixoLogo, 
  ChatGPTLogo, 
  AnthropicLogo, 
  GeminiLogo, 
  GrokLogo, 
  DeepSeekLogo, 
  MistralLogo, 
  PerplexityLogo 
} from './ChatWindow';
import { AppSettings } from '../types';
import { supabase } from '../lib/supabaseClient';

interface LandingPageProps {
  settings: AppSettings;
  onLogin: (email: string, name: string) => void;
  onOpenLegal?: (tab: 'faq' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'contact') => void;
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.6-4.53-5.84-4.53z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LandingPage({ settings, onLogin, onOpenLegal }: LandingPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [selectedCalculatedModels, setSelectedCalculatedModels] = useState<string[]>(['chatgpt', 'claude', 'grok']);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setIsSubmitting(true);

      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      });

      if (authError) throw authError;

      if (!data.url) {
        throw new Error('Could not generate secure Google authorization link.');
      }

      console.log('[Google Auth] Opening OAuth popup directly:', data.url);

      const width = 550;
      const height = 655;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('Popup blocked! Please allow popups to sign in with Google.');
      }

      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setIsSubmitting(false);
        }
      }, 1000);

    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'An error occurred during Google Authentication.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between overflow-y-auto overflow-x-hidden ${
      settings.theme === 'dark' 
        ? 'bg-neutral-950 text-zinc-100 selection:bg-emerald-500/30' 
        : 'bg-zinc-50 text-zinc-800 selection:bg-emerald-500/20'
    }`}>
      {/* Decorative Blur Blobs and Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-96 h-96 md:w-[40vw] md:h-[40vw] bg-emerald-500/10 rounded-full blur-[4rem]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 -right-32 w-96 h-96 md:w-[35vw] md:h-[35vw] bg-violet-500/10 rounded-full blur-[4rem]" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 left-1/4 w-96 h-96 md:w-[30vw] md:h-[30vw] bg-sky-500/10 rounded-full blur-[4rem]" 
        />
      </div>
      
      {/* Upper Navigation Bar */}
      <header className={`w-full py-4 px-6 md:px-12 flex items-center justify-between border-b backdrop-blur-md relative z-10 ${
        settings.theme === 'dark' ? 'border-white/5 bg-black/40' : 'border-zinc-200 bg-white/60'
      }`}>
        <div className="flex items-center gap-2.5">
          <WebnixoLogo className="w-8 h-8 text-emerald-400" />
          <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 font-display">
            WEBNIXO AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="hidden md:inline text-red-400 text-xs font-medium mr-2 max-w-xs truncate">
              {error}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLogin('demo@webnixo.ai', 'Demo User')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              settings.theme === 'dark'
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 shadow-xs'
            }`}
          >
            Try Demo
          </motion.button>
          
          <motion.button
            id="google-signin-btn"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Connecting...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </>
            )}
          </motion.button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16 flex flex-col items-center justify-center relative z-10">
        
        {/* Left Side: Pitch and Visuals */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl text-center space-y-8 flex flex-col items-center justify-center"
        >
          <div className="space-y-6 flex flex-col items-center relative z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="tracking-widest uppercase">THE ULTIMATE AI FIESTA IS HERE</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black font-display tracking-tight leading-tight text-center drop-shadow-sm">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-800 via-zinc-600 to-zinc-800 dark:from-white dark:via-zinc-200 dark:to-zinc-400">
                Meet the Next Gen
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 drop-shadow-md">
                WEBNIXO AI Workspace
              </span>
            </h1>
            
            <p className={`text-base md:text-xl max-w-2xl leading-relaxed text-center font-medium ${
              settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              A premium, elite workspace designed for multi-model workflows, live web-grounding intelligence, and seamless high-speed failovers.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center w-full sm:w-auto gap-4 pt-4 mb-4"
            >
              <button 
                onClick={handleGoogleSignIn}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider text-sm bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
                <span>Get Started Free</span>
              </button>
              <button 
                onClick={() => onLogin('demo@webnixo.ai', 'Demo User')}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider text-sm border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer flex justify-center items-center ${
                  settings.theme === 'dark' 
                    ? 'border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-700' 
                    : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                Try Live Demo
              </button>
            </motion.div>
          </div>

          {/* Model Showroom Row */}
          <div className="space-y-3 w-full">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${
              settings.theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              Powered by Elite Engines (AI Fiesta Hub)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><ChatGPTLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">ChatGPT Mode</span>
                  <span className="text-[10px] opacity-60">GPT-4o Excellence</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><AnthropicLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">Claude Mode</span>
                  <span className="text-[10px] opacity-60">3.5 Sonnet Precision</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><GeminiLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">Gemini Core</span>
                  <span className="text-[10px] opacity-60">Ultra Smart Logic</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><GrokLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">Grok Mode</span>
                  <span className="text-[10px] opacity-60">Witty & Direct</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><DeepSeekLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">DeepSeek Core</span>
                  <span className="text-[10px] opacity-60">Lightning Math</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><MistralLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">Mistral Large</span>
                  <span className="text-[10px] opacity-60">Open Philosophy</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><PerplexityLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">Perplexity Mode</span>
                  <span className="text-[10px] opacity-60">Search Grounds</span>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-3 ${
                  settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-200 shadow-2xs'
                }`}
              >
                <div className="flex justify-center w-full"><WebnixoLogo className="w-8 h-8" /></div>
                <div>
                  <span className="text-xs font-bold block">WEBNIXO AI</span>
                  <span className="text-[10px] opacity-60">Multi-Model Router</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono opacity-80 pt-2">
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-emerald-400" /> REDUNDANCY BUFFER</span>
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-sky-400" /> GOOGLE SEARCH GROUNDING</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-violet-400" /> END-TO-END SECURE</span>
          </div>
        </motion.div>

        {/* Why Choose WEBNIXO AI Section -> Replaced with beautifully animated Advantages & ROI section */}
        <div className="col-span-1 lg:col-span-12 mt-12 md:mt-20 pt-12 md:pt-20 border-t border-zinc-500/10 w-full">
          {/* Main Visual Campaign Banner: Get 8+ Premium AI Models for Half the Price of One */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`max-w-5xl mx-auto mb-16 p-4 sm:p-8 md:p-12 rounded-3xl border relative overflow-hidden ${
              settings.theme === 'dark' 
                ? 'bg-radial from-emerald-500/10 via-zinc-900/40 to-black border-emerald-500/10 shadow-emerald-900/10 shadow-2xl' 
                : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200/50 shadow-xl'
            }`}
          >
            {/* Ambient Background Glow Loops */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-400/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div className="text-center space-y-4 w-full max-w-4xl mx-auto relative z-10">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
                <span>SUPERCHARGED UNIFIED AI LICENSE</span>
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight font-display leading-[1.2] md:leading-[1.15] max-w-3xl mx-auto break-words pb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-emerald-400 to-sky-400 box-decoration-clone">
                  Get 8+ Premium AI Models{' '}
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 block sm:inline mt-1 sm:mt-0 box-decoration-clone">
                  for Half the Price of One!
                </span>
              </h2>
              
              <p className={`text-xs md:text-base leading-relaxed max-w-2xl mx-auto px-2 ${
                settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                Stop stacking redundant $20/month AI subscriptions. Webnixo bundles every elite model (GPT-4o, Claude 3.5 Sonnet, Perplexity, Grok, and more) into one single fluid interface with absolute lightning speeds.
              </p>
            </div>

            {/* High-Animation Dual Campaign Grid (The Old Way vs. The Webnixo Way) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 items-stretch relative z-10">
              {/* Card A: The Old Way (Red / Dispersed) */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`p-6 md:p-8 rounded-2xl border flex flex-col justify-between ${
                  settings.theme === 'dark' 
                    ? 'bg-zinc-950/60 border-red-950/40' 
                    : 'bg-white border-red-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-500/10">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">THE OLD WAY</span>
                    <span className="text-xs font-mono text-zinc-500 line-through">₹11,400 / month</span>
                  </div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="text-red-500">❌</span> Dispersed Subscriptions
                  </h3>
                  
                  {/* Subscription Grid List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { name: "ChatGPT Plus", cost: "₹1,999", color: "bg-emerald-500/10 border-emerald-500/20" },
                      { name: "Claude Pro", cost: "₹1,999", color: "bg-orange-500/10 border-orange-500/20" },
                      { name: "Perplexity Pro", cost: "₹1,999", color: "bg-sky-500/10 border-sky-500/20" },
                      { name: "Grok 2 Premium", cost: "₹1,299", color: "bg-purple-500/10 border-purple-500/20" },
                      { name: "Gemini Advanced", cost: "₹1,999", color: "bg-blue-500/10 border-blue-500/20" },
                      { name: "Mistral Paid", cost: "₹1,299", color: "bg-amber-500/10 border-amber-500/20" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-zinc-500/5 bg-zinc-500/5 opacity-60">
                        <span className="truncate">{item.name}</span>
                        <span className="font-mono text-[10px] text-zinc-400">{item.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-500/10 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Total Fatigue:</span>
                  <span className="font-extrabold text-red-400 uppercase tracking-wider">Infinite Logins & Waste</span>
                </div>
              </motion.div>

              {/* Card B: The Webnixo Way (Emerald / Glowing) */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`p-6 md:p-8 rounded-2xl border relative flex flex-col justify-between overflow-hidden shadow-2xl ${
                  settings.theme === 'dark' 
                    ? 'bg-neutral-900 border-emerald-500/30 shadow-emerald-500/5' 
                    : 'bg-white border-emerald-300 shadow-emerald-100'
                }`}
              >
                {/* Micro Animated Glow Ring */}
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded-bl-xl shadow-lg">
                  SAVINGS CHAMPION
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-500/10">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">WEBNIXO PLATINUM</span>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">SAVE 98%</span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span className="text-emerald-500">✨</span> Unified Super License
                  </h3>
                  
                  <p className="text-xs text-zinc-400 mb-4">
                    Access all 8+ frontier neural networks with zero switching latency. Real-time web-lookup, full markdown output support, and instant code terminals.
                  </p>

                  {/* Visual Cluster of Logo Avatars with Floating/Bouncing Motion */}
                  <div className="flex flex-wrap items-center gap-3 py-1.5">
                    {[
                      { icon: <ChatGPTLogo className="w-4 h-4" />, name: "GPT-4o" },
                      { icon: <AnthropicLogo className="w-4 h-4" />, name: "Claude" },
                      { icon: <GeminiLogo className="w-4 h-4 text-sky-400" />, name: "Gemini" },
                      { icon: <GrokLogo className="w-4 h-4" />, name: "Grok" },
                      { icon: <DeepSeekLogo className="w-4 h-4 text-cyan-400" />, name: "DeepSeek" },
                      { icon: <PerplexityLogo className="w-4 h-4 text-emerald-400" />, name: "Perplexity" },
                      { icon: <MistralLogo className="w-4 h-4 text-orange-400" />, name: "Mistral" }
                    ].map((avatar, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.15, y: -2 }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[11px] font-medium ${
                          settings.theme === 'dark'
                            ? 'bg-zinc-800/80 border-zinc-700/50 hover:border-emerald-400'
                            : 'bg-zinc-50 border-zinc-200 hover:border-emerald-400'
                        }`}
                      >
                        {avatar.icon}
                        <span className="opacity-90">{avatar.name}</span>
                      </motion.div>
                    ))}
                    <div className="text-[11px] font-bold text-sky-400 animate-pulse px-1">
                      + More
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-500/10 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Unified Cost:</span>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 line-through block leading-none mr-1">₹11,400/mo</span>
                    <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 leading-none block">
                      Just ₹49/mo
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400 block mt-1 animate-pulse">
                      Use affiliate coupon/referral code for extra discounts!
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Micro Interactivity: Sliding Carousel of Animated Model Cards */}
            <div className="mt-10 overflow-hidden relative">
              <div className="flex gap-4 animate-marquee whitespace-nowrap py-1">
                {[
                  "OpenAI GPT-4o Elite", "Anthropic Claude 3.5 Sonnet", "Google Gemini 1.5 Pro", 
                  "xAI Grok 2 Reasoning", "Perplexity Deep Pro Search", "DeepSeek R1 Frontier", 
                  "Mistral Large v2", "Meta Llama 3 405B"
                ].map((tag, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold cursor-default ${
                      settings.theme === 'dark'
                        ? 'bg-zinc-900/60 border-white/5 text-zinc-300'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>{tag}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="text-center space-y-3 w-full max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-spin text-amber-400" />
              <span>Interactive ROI Metrics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 break-words leading-tight pb-2 box-decoration-clone">
              The Smart Way to Access Elite AI
            </h2>
            <p className={`text-xs md:text-base leading-relaxed max-w-2xl mx-auto ${
              settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Compare your costs interactively below and discover how much you stand to save with Webnixo AI.
            </p>
          </div>

          {/* Interactive Cost-Savings Calculator & Unified Superpowers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-6xl mx-auto mb-20">
            {/* ROI Cost Calculator (Left Column - Made slightly narrower to accommodate robust advantages) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`col-span-1 lg:col-span-5 p-6 md:p-8 rounded-3xl border h-full flex flex-col justify-between ${
                settings.theme === 'dark'
                  ? 'bg-neutral-900/40 border-white/5 shadow-inner'
                  : 'bg-white border-zinc-200/80 shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-amber-500/15 rounded-xl border border-amber-500/20 text-amber-400">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold">Instant Savings Calculator</h3>
                    <p className="text-[11px] opacity-60">Select services you currently pay for or plan to use</p>
                  </div>
                </div>

                {/* Calculator checkbox checklist */}
                <div className="space-y-2.5 mb-6">
                  {[
                    { id: 'chatgpt', name: 'ChatGPT Plus (GPT-4o)', cost: 1650, logo: <ChatGPTLogo className="w-5 h-5" /> },
                    { id: 'claude', name: 'Claude Pro (Sonnet 3.5)', cost: 1650, logo: <AnthropicLogo className="w-5 h-5" /> },
                    { id: 'grok', name: 'X Premium+ (Grok 2)', cost: 1320, logo: <GrokLogo className="w-5 h-5" /> },
                    { id: 'perplexity', name: 'Perplexity Pro (Search)', cost: 1650, logo: <PerplexityLogo className="w-5 h-5" /> },
                    { id: 'mistral', name: 'Mistral Large Paid tier', cost: 1650, logo: <MistralLogo className="w-5 h-5" /> },
                  ].map((item) => {
                    const isChecked = selectedCalculatedModels.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedCalculatedModels(selectedCalculatedModels.filter(id => id !== item.id));
                          } else {
                            setSelectedCalculatedModels([...selectedCalculatedModels, item.id]);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 hover:scale-[1.01] ${
                          isChecked
                            ? settings.theme === 'dark'
                              ? 'bg-emerald-500/10 border-emerald-500/35 text-white'
                              : 'bg-emerald-50/60 border-emerald-200 text-zinc-950'
                            : settings.theme === 'dark'
                              ? 'bg-zinc-900/20 border-white/5 text-zinc-400 hover:bg-zinc-800/20'
                              : 'bg-zinc-50/50 border-zinc-100 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-zinc-500/40'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.logo}
                            <span className="text-[11px] font-bold">{item.name}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold opacity-80">₹{item.cost}/mo</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live calculations */}
              <div className={`p-4 rounded-2xl border ${
                settings.theme === 'dark' ? 'bg-black/30 border-white/5' : 'bg-zinc-50 border-zinc-100'
              }`}>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-[9px] block uppercase font-bold opacity-50 tracking-wider">Isolated Accounts</span>
                    <span className="text-lg font-black font-mono text-rose-400">
                      ₹{selectedCalculatedModels.reduce((acc, id) => {
                        const costMap: { [key: string]: number } = { chatgpt: 1650, claude: 1650, grok: 1320, perplexity: 1650, mistral: 1650 };
                        return acc + (costMap[id] || 0);
                      }, 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[8px] block opacity-45">per month</span>
                  </div>
                  <div className="border-l border-zinc-700/25">
                    <span className="text-[9px] block uppercase font-bold text-emerald-400 tracking-wider">Webnixo AI Plan</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      ₹49
                    </span>
                    <span className="text-[8px] block opacity-45 text-emerald-500/70">per month</span>
                  </div>
                </div>

                {/* Savings bar */}
                <div className="mt-3.5 pt-3 border-t border-zinc-700/10">
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400 fill-amber-400/20" /> Monthly Savings</span>
                    <span className="text-emerald-400 font-mono">
                      {(() => {
                        const original = selectedCalculatedModels.reduce((acc, id) => {
                          const costMap: { [key: string]: number } = { chatgpt: 1650, claude: 1650, grok: 1320, perplexity: 1650, mistral: 1650 };
                          return acc + (costMap[id] || 0);
                        }, 0);
                        if (original === 0) return '0%';
                        const savingsPercent = Math.round(((original - 49) / original) * 100);
                        return `Save ${savingsPercent}% (₹${(original - 49).toLocaleString('en-IN')}/mo)`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800/40 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${(() => {
                          const original = selectedCalculatedModels.reduce((acc, id) => {
                            const costMap: { [key: string]: number } = { chatgpt: 1650, claude: 1650, grok: 1320, perplexity: 1650, mistral: 1650 };
                            return acc + (costMap[id] || 0);
                          }, 0);
                          if (original === 0) return 0;
                          return ((original - 49) / original) * 100;
                        })()}%` 
                      }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Advantages Showcase (Right Column - Enlarged and organized as a stunning bento grid) */}
            <div className="col-span-1 lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Advantage 1: Thread-Model Sync */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex gap-3.5 ${
                    settings.theme === 'dark'
                      ? 'bg-neutral-900/40 border-white/5 hover:border-emerald-500/20 hover:bg-neutral-900/60 shadow-inner'
                      : 'bg-white border-zinc-200/80 hover:shadow-md hover:border-emerald-500/10'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black mb-1.5 uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                      Context-Preserved Model Swaps
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Switch between ChatGPT-4o, Claude 3.5, and Grok 2 in the middle of your active chat. The context carries over automatically, enabling instantaneous cross-validation.
                    </p>
                  </div>
                </motion.div>

                {/* Advantage 2: Built-in Prompt Engineering */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex gap-3.5 ${
                    settings.theme === 'dark'
                      ? 'bg-neutral-900/40 border-white/5 hover:border-amber-500/20 hover:bg-neutral-900/60 shadow-inner'
                      : 'bg-white border-zinc-200/80 hover:shadow-md hover:border-amber-500/10'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                    <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black mb-1.5 uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                      One-Tap Prompt Optimizer
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Stop struggling with instructions. Our integrated prompt engineering tool instantly restructures raw queries into perfectly framed instructions for professional AI outcomes.
                    </p>
                  </div>
                </motion.div>

                {/* Advantage 3: Congestion Bypass */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex gap-3.5 ${
                    settings.theme === 'dark'
                      ? 'bg-neutral-900/40 border-white/5 hover:border-sky-500/20 hover:bg-neutral-900/60 shadow-inner'
                      : 'bg-white border-zinc-200/80 hover:shadow-md hover:border-sky-500/10'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
                    <Cpu className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black mb-1.5 uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
                      Queue Congestion Bypass
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Tired of global rate limit throttling? Webnixo balances traffic automatically across corporate server pipelines to route your queries instantly without delays.
                    </p>
                  </div>
                </motion.div>

                {/* Advantage 4: Web Grounding */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex gap-3.5 ${
                    settings.theme === 'dark'
                      ? 'bg-neutral-900/40 border-white/5 hover:border-violet-500/20 hover:bg-neutral-900/60 shadow-inner'
                      : 'bg-white border-zinc-200/80 hover:shadow-md hover:border-violet-500/10'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20 shrink-0">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black mb-1.5 uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
                      Real-Time Web Grounding
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Inject live internet intelligence into reasoning models. Integrated factual grounding validation feeds up-to-the-minute resources and citations directly to your chats.
                    </p>
                  </div>
                </motion.div>

                {/* Advantage 5: Zero-Password SSO */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex gap-3.5 ${
                    settings.theme === 'dark'
                      ? 'bg-neutral-900/40 border-white/5 hover:border-blue-500/20 hover:bg-neutral-900/60 shadow-inner'
                      : 'bg-white border-zinc-200/80 hover:shadow-md hover:border-blue-500/10'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black mb-1.5 uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                      Zero-Password Google SSO
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Protected by Google OAuth protocol. Log in instantly with absolute credential safety, knowing your confidential sessions and prompts are fully encrypted.
                    </p>
                  </div>
                </motion.div>

                {/* Advantage 6: Extreme Budget Efficiency */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  whileHover={{ y: -4 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex gap-3.5 ${
                    settings.theme === 'dark'
                      ? 'bg-neutral-900/40 border-white/5 hover:border-rose-500/20 hover:bg-neutral-900/60 shadow-inner'
                      : 'bg-white border-zinc-200/80 hover:shadow-md hover:border-rose-500/10'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black mb-1.5 uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">
                      Unparalleled Subscription ROI
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Access every premier AI model under a single unified plan at ₹49/month. Reclaim over ₹7,900/month of subscription overhead while accessing superior performance.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Quick action button to force purchase section scroll */}
              <motion.button
                onClick={() => {
                  const el = document.getElementById('pricing-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Unlock All Elite AI Brains Now</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Dynamic & Simple-English Pricing Section */}
        <div id="pricing-section" className="col-span-1 lg:col-span-12 mt-16 md:mt-24 pt-16 border-t border-zinc-500/10 w-full">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>SIMPLE PRICING</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display">
              Plans built for everyone. No surprise bills.
            </h2>
            <p className={`text-sm leading-relaxed ${
              settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Sign up at the top of the page first to unlock your favorite workspace plan. Free users can read and write with our flash speed model instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
            {/* Free Plan */}
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative backdrop-blur-xl overflow-hidden group ${
                settings.theme === 'dark'
                  ? 'bg-zinc-900/60 border-white/10 hover:border-zinc-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]'
                  : 'bg-white/80 border-zinc-200 hover:border-zinc-300 hover:shadow-2xl shadow-sm'
              }`}
            >
              {/* Card background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="space-y-5 relative z-10">
                <h3 className="text-2xl font-black tracking-tight">Standard Pass</h3>
                <p className={`text-xs font-medium leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Great for basic questions and everyday brainstorming.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-black text-zinc-400 font-display drop-shadow-sm">₹0</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60"> / forever</span>
                </div>
                <hr className={`border-t ${settings.theme === 'dark' ? 'border-white/10' : 'border-zinc-200'}`} />
                <ul className="space-y-3 pt-2 text-xs font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Webnixo 1.0 (Flash) access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Fast basic answers</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                    <span className="line-through">Elite models (Claude/GPT-4o)</span>
                  </li>
                  <li className="flex items-center gap-2 opacity-40">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                    <span className="line-through">Google Web Search Grounding</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => onLogin('demo@webnixo.ai', 'Demo User')}
                className={`w-full py-3.5 mt-8 rounded-xl font-black text-xs transition-all duration-300 cursor-pointer text-center uppercase tracking-wider relative z-10 overflow-hidden group/btn ${
                  settings.theme === 'dark'
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                }`}
              >
                <span className="relative z-10">Join Free Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              </button>
            </motion.div>

            {/* Pro Monthly Plan */}
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative backdrop-blur-xl overflow-hidden group ${
                settings.theme === 'dark'
                  ? 'bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]'
                  : 'bg-gradient-to-b from-emerald-50/80 to-white/80 border-emerald-500/30 hover:shadow-2xl shadow-sm hover:border-emerald-400'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[2rem] -z-10 rounded-full group-hover:bg-emerald-500/30 transition-all duration-500" />
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-emerald-500 to-emerald-400 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-bl-xl shadow-lg z-10 flex items-center gap-1.5 border-b border-l border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Most Popular
              </div>
              <div className="space-y-5 relative z-10">
                <h3 className="text-2xl font-black tracking-tight">Monthly Pass</h3>
                <p className={`text-xs font-medium leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Unlock all premium AI brains month-by-month. Cancel anytime.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-black text-emerald-400 font-display drop-shadow-sm">₹49</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60"> / mo</span>
                </div>
                <hr className={`border-t ${settings.theme === 'dark' ? 'border-emerald-500/20' : 'border-emerald-500/10'}`} />
                <ul className="space-y-3 pt-2 text-xs font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>GPT-4o & Claude 3.5 Sonnet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>DeepSeek, Grok & Mistral</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Real-time Google Grounding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>High-priority fast response servers</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={handleGoogleSignIn}
                className="w-full py-3 mt-8 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white transition-all duration-300 shadow-lg shadow-emerald-500/20 cursor-pointer text-center relative z-10"
              >
                Sign In & Upgrade
              </button>
            </motion.div>

            {/* Pro Yearly Plan */}
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative backdrop-blur-xl overflow-hidden group ${
                settings.theme === 'dark'
                  ? 'bg-sky-950/40 border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]'
                  : 'bg-gradient-to-b from-sky-50/80 to-white/80 border-sky-500/30 hover:shadow-2xl shadow-sm hover:border-sky-400'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-[2rem] -z-10 rounded-full group-hover:bg-sky-500/30 transition-all duration-500" />
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-sky-500 to-sky-400 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-bl-xl shadow-lg z-10 flex items-center gap-1.5 border-b border-l border-sky-400/30">
                <Sparkle className="w-3.5 h-3.5 animate-pulse" />
                Best Value (Save 15%)
              </div>
              <div className="space-y-5 relative z-10">
                <h3 className="text-2xl font-black tracking-tight">Yearly Elite</h3>
                <p className={`text-xs font-medium leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Ultimate non-stop premium access. Locked-in discount.
                </p>
                <div className="pt-2">
                  <span className="text-4xl font-black text-sky-400 font-display drop-shadow-sm">₹499</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60"> / yr</span>
                </div>
                <hr className={`border-t ${settings.theme === 'dark' ? 'border-sky-500/20' : 'border-sky-500/10'}`} />
                <ul className="space-y-3 pt-2 text-xs font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>All Monthly premium features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>No subscription gap guarantees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>Priority Beta engine previews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>Elite priority VIP support</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={handleGoogleSignIn}
                className="w-full py-3 mt-8 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white transition-all duration-300 shadow-lg shadow-sky-500/20 cursor-pointer text-center relative z-10"
              >
                Sign In & Get Elite
              </button>
            </motion.div>
          </div>
        </div>

        {/* Dedicated FAQ Section on Main Page */}
        <div className="col-span-1 lg:col-span-12 mt-16 md:mt-24 pt-16 border-t border-zinc-500/10 w-full max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-10 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              <span>ANSWERS &amp; HELP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 break-words leading-tight pb-2 box-decoration-clone">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed max-w-2xl mx-auto px-2 ${
              settings.theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              Quick answers to help you understand our secure gateway, elite routing models, and payment channels.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What is WEBNIXO AI Fiesta Hub?",
                a: "WEBNIXO AI is an elite multi-model routing gateway designed to bridge state-of-the-art Large Language Models (including ChatGPT-4o, Claude 3.5 Sonnet, Google Gemini, DeepSeek R1, xAI Grok, etc.) under a unified, high-performance interface. We provide automatic redundant failovers and direct Live Google Search web-grounding integration."
              },
              {
                q: "How does the pricing and subscription work?",
                a: "We offer two clear passes: a Monthly Pass (₹49/month) and a Yearly Elite Pass (₹499/year). Both passes grant you full, high-speed access to all models, bypass active throttling, and enable live Google Search web-grounding queries."
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Click 'Join Free Now' on our landing page to access our standard model routing engine instantly without making any payment. Demo mode is fully functional with minor rate quotas."
              },
              {
                q: "Which payment gateways do you support?",
                a: "We use Cashfree Payments India as our exclusive primary checkout partner. All transactions are fully secured, PCI-DSS compliant, and support UPI, Netbanking, Credit Cards, and major Indian wallets with immediate merchant settlement."
              },
              {
                q: "How secure is my data on WEBNIXO?",
                a: "Extremely secure. We use Supabase Auth coupled with SSL/TLS 1.3 encryption. Your prompt history is stored securely, and we never sell, share, or analyze your personal information. We also do not employ third-party ad trackers."
              },
              {
                q: "Why can't I get a refund after upgrading?",
                a: "Because our service provides immediate, real-time access to premium API tokens, cloud routing instances, and high-performance computation servers upon activation, we have a strict no-refund policy. All sales are absolute and final once paid."
              },
              {
                q: "Who should I contact if a transaction fails?",
                a: "If a transaction fails or your subscription does not activate automatically, contact our high-priority support desk immediately at support@webnixo.in or visit our Contact & Support portal in the footer below. We resolve all billing discrepancies within 24 hours."
              }
            ].map((faq, index) => {
              const isOpen = expandedFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? settings.theme === 'dark' 
                        ? 'bg-emerald-500/[0.03] border-emerald-500/25 shadow-sm' 
                        : 'bg-emerald-50/20 border-emerald-200/80 shadow-3xs'
                      : settings.theme === 'dark'
                        ? 'bg-neutral-900/40 border-white/5 hover:bg-neutral-900/60'
                        : 'bg-white border-zinc-200/80 hover:bg-zinc-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-xs md:text-sm select-none cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      {faq.q}
                    </span>
                    <span className={`text-lg transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-45 text-emerald-400' : 'text-zinc-500'}`}>
                      &oplus;
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-200 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-60 opacity-100 border-t' : 'max-h-0 opacity-0 border-t-0'
                    } ${settings.theme === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}
                  >
                    <p className={`px-5 py-4 text-xs leading-relaxed ${settings.theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className={`w-full py-8 px-6 text-center text-xs opacity-80 border-t ${
        settings.theme === 'dark' ? 'border-white/5 bg-black/20 text-zinc-400' : 'border-zinc-200 bg-zinc-100/50 text-zinc-500'
      }`}>
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="font-medium">&copy; {new Date().getFullYear()} WEBNIXO AI Fiesta Suite. Dedicated high-performance multi-model router.</p>
          
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px] font-bold">
            <button 
              type="button"
              onClick={() => onOpenLegal?.('terms')} 
              className="hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span className="opacity-30">&bull;</span>
            <button 
              type="button"
              onClick={() => onOpenLegal?.('refund')} 
              className="hover:text-rose-400 hover:underline transition-colors cursor-pointer font-extrabold"
            >
              Refund Policy
            </button>
            <span className="opacity-30">&bull;</span>
            <button 
              type="button"
              onClick={() => onOpenLegal?.('privacy')} 
              className="hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="opacity-30">&bull;</span>
            <button 
              type="button"
              onClick={() => onOpenLegal?.('cookies')} 
              className="hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <span className="opacity-30">&bull;</span>
            <button 
              type="button"
              onClick={() => onOpenLegal?.('contact')} 
              className="hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
            >
              Contact &amp; Corporate Support
            </button>
          </div>
          <p className="text-[10px] opacity-40 font-mono mt-1">SECURED BY CASHFREE PAYMENTS INDIA. ALL DATA SECURED VIA SUPABASE AUTHENTICATION.</p>
        </div>
      </footer>
    </div>
  );
}
