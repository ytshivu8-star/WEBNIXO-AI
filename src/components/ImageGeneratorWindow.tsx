/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Lock, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Layout, 
  Sliders, 
  History, 
  Trash2,
  ExternalLink,
  ChevronRight,
  Menu,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings } from '../types';

interface ImageGeneratorWindowProps {
  isPremium: boolean;
  onOpenPricing: () => void;
  settings: AppSettings;
  creditsRemaining: number;
  updateCredits: (remaining: number) => void;
  onToggleSidebar: () => void;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string; // Base64 or object URL
  aspectRatio: string;
  imageSize: string;
  preset: string;
  timestamp: string;
}

const PRESETS = [
  { id: 'none', name: 'None / Raw', description: 'Let the model decide' },
  { id: 'photorealistic', name: 'Photorealistic', description: 'Studio lighting, hyper-detailed lens' },
  { id: 'cinematic', name: 'Cinematic', description: 'Moody color grade, widescreen bokeh' },
  { id: 'digital-art', name: 'Digital Art', description: 'Vibrant neon, sci-fi concept aesthetic' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft pigment washes, hand-drawn paper' },
  { id: 'anime', name: 'Anime / Manga', description: 'Cell-shaded line art, classic Japanese style' },
  { id: 'minimalist', name: 'Minimalist Line Art', description: 'Simple vector lines, clean negative space' },
  { id: 'pixel-art', name: 'Pixel Art', description: 'Retro 8-bit, nostalgic arcade game layout' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', value: '1:1', desc: 'Social & avatars' },
  { id: '16:9', label: 'Landscape', value: '16:9', desc: 'Widescreen & presentations' },
  { id: '9:16', label: 'Portrait', value: '9:16', desc: 'Mobile screens & stories' },
  { id: '4:3', label: 'Classic', value: '4:3', desc: 'Traditional cameras' },
  { id: '3:4', label: 'Standard', value: '3:4', desc: 'Books & portrait shots' },
];

const IMAGE_SIZES = [
  { id: '512px', name: 'Standard (512px)', cost: 5 },
  { id: '1K', name: 'High-Res (1K)', cost: 10 },
  { id: '2K', name: 'Super-Res (2K)', cost: 15 },
  { id: '4K', name: 'Masterpiece (4K)', cost: 25 },
];

export default function ImageGeneratorWindow({
  isPremium,
  onOpenPricing,
  settings,
  creditsRemaining,
  updateCredits,
  onToggleSidebar,
}: ImageGeneratorWindowProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('none');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedSize, setSelectedSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [historyList, setHistoryList] = useState<GeneratedImage[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Playful loading state messages to delight the user
  const [loadingMessage, setLoadingMessage] = useState('Diffusing pixels...');
  
  useEffect(() => {
    if (!isGenerating) return;
    const messages = [
      'Diffusing pixels...',
      'Synthesizing artistic textures...',
      'Refining light arrays and specular shadows...',
      'Polishing structural resolution...',
      'Color grading dynamic ranges...',
      'Finalizing high-fidelity rendering...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMessage(messages[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Load generation history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('webnixo_generated_images');
      if (stored) {
        setHistoryList(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load image history:', err);
    }
  }, []);

  // Save creation history
  const saveToHistory = (newImg: GeneratedImage) => {
    const updated = [newImg, ...historyList];
    setHistoryList(updated);
    localStorage.setItem('webnixo_generated_images', JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem('webnixo_generated_images', JSON.stringify(updated));
    if (currentImage?.id === id) {
      setCurrentImage(null);
    }
  };

  const clearAllHistory = () => {
    setHistoryList([]);
    localStorage.removeItem('webnixo_generated_images');
    setCurrentImage(null);
  };

  const handleCopyPrompt = () => {
    if (!currentImage) return;
    navigator.clipboard.writeText(currentImage.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const getSelectedSizeCost = () => {
    return IMAGE_SIZES.find(s => s.id === selectedSize)?.cost || 10;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setErrorText(null);

    const cost = getSelectedSizeCost();
    if (creditsRemaining < cost) {
      setErrorText(`⚠️ Insufficient Credits: This action requires ${cost} credits. You currently have ${creditsRemaining}. Please reset or upgrade your plan.`);
      return;
    }

    setIsGenerating(true);
    
    // Combine prompt with preset description if preset is chosen
    const presetObj = PRESETS.find(p => p.id === selectedPreset);
    const finalPrompt = selectedPreset !== 'none' && presetObj
      ? `${prompt.trim()}, ${presetObj.description}`
      : prompt.trim();

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio: selectedRatio,
          imageSize: selectedSize,
        })
      });

      const data = await response.json();

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || 'Server rejected image generation');
      }

      // Deduct credits
      updateCredits(Math.max(0, creditsRemaining - cost));

      const newImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt: prompt.trim(),
        url: data.imageUrl,
        aspectRatio: selectedRatio,
        imageSize: selectedSize,
        preset: selectedPreset,
        timestamp: new Date().toISOString()
      };

      setCurrentImage(newImage);
      saveToHistory(newImage);
    } catch (err: any) {
      console.error('Image generation error:', err);
      setErrorText(err.message || 'An unexpected error occurred during image generation. Please verify your Gemini API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Lock Screen for Non-Premium users
  if (!isPremium) {
    return (
      <div className={`h-full w-full flex flex-col items-center justify-center p-6 text-center select-none ${
        settings.theme === 'dark' ? 'bg-[#0f0f11] text-zinc-100' : 'bg-zinc-50 text-zinc-900'
      }`}>
        <div className="md:hidden absolute top-4 left-4 z-40">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg border transition-colors ${
              settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full p-8 rounded-3xl border shadow-xl flex flex-col items-center ${
            settings.theme === 'dark' ? 'bg-zinc-950/80 border-white/5 shadow-black/50' : 'bg-white border-zinc-200 shadow-zinc-200/50'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6 relative animate-pulse">
            <Sparkles className="w-8 h-8" />
            <Lock className="w-4 h-4 text-emerald-300 absolute -bottom-1 -right-1 bg-zinc-950 border border-emerald-500/20 rounded-full p-0.5" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight font-display mb-3">
            Premium Image Studio
          </h2>
          <p className="text-sm opacity-70 mb-6 leading-relaxed">
            Generate state-of-the-art illustrations, avatars, vectors, and digital paintings using Imagen 3. Exclusive for Starter & Pro accounts.
          </p>

          <div className="w-full space-y-3 mb-8 text-left">
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${
              settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'
            }`}>
              <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
              <div>
                <p className="text-xs font-bold">Google Imagen 3 Engine</p>
                <p className="text-[10px] opacity-60">High visual fidelity with advanced prompt compliance.</p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-xl border ${
              settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'
            }`}>
              <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
              <div>
                <p className="text-xs font-bold">Multi-Resolution Output</p>
                <p className="text-[10px] opacity-60">Choose standard size, 1K HD, 2K Super, or pristine 4K canvases.</p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-xl border ${
              settings.theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100'
            }`}>
              <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 text-[10px] font-bold">✓</div>
              <div>
                <p className="text-xs font-bold">Aesthetic Aspect Ratios</p>
                <p className="text-[10px] opacity-60">Fully adjustable ratios (1:1, 16:9 landscape, 9:16 portrait, 4:3, 3:4).</p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenPricing}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm tracking-tight transition-all duration-150 shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Unlock Premium Studio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden ${
      settings.theme === 'dark' ? 'bg-[#0f0f11] text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Top Header Row */}
      <header className={`p-4 flex items-center justify-between border-b shrink-0 relative ${
        settings.theme === 'dark' ? 'border-white/5 bg-zinc-950/40' : 'border-zinc-200 bg-white shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg border transition-colors md:hidden ${
              settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Imagen Studio</h2>
              <p className="text-[10px] opacity-60">Premium High-Fidelity Creation Suite</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className={`flex rounded-xl p-1 border text-xs font-semibold ${
          settings.theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-zinc-100 border-zinc-200/80'
        }`}>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'create'
                ? settings.theme === 'dark' ? 'bg-zinc-800 text-white font-bold' : 'bg-white text-zinc-900 font-bold shadow-xs'
                : 'opacity-65'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? settings.theme === 'dark' ? 'bg-zinc-800 text-white font-bold' : 'bg-white text-zinc-900 font-bold shadow-xs'
                : 'opacity-65'
            }`}
          >
            <span>History</span>
            {historyList.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                {historyList.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body Layout */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'create' ? (
          <div className="h-full w-full flex flex-col md:flex-row overflow-hidden">
            {/* Left Control Panel Column */}
            <aside className={`w-full md:w-[320px] lg:w-[350px] border-b md:border-b-0 md:border-r flex flex-col overflow-y-auto shrink-0 ${
              settings.theme === 'dark' ? 'bg-zinc-950/20 border-white/5' : 'bg-white border-zinc-200/80'
            }`}>
              <div className="p-4 space-y-5">
                {/* 1. Prompt Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 tracking-wide uppercase flex items-center justify-between">
                    <span>Describe your image</span>
                    <span className="text-[10px] font-mono normal-case tracking-normal text-zinc-500">Required</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="An astronaut riding a white horse on Mars, cinematic, award winning art, digital masterpiece..."
                    rows={4}
                    maxLength={1000}
                    disabled={isGenerating}
                    className={`w-full p-3 rounded-xl border text-sm font-medium resize-none focus:outline-none transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-zinc-900/60 border-white/5 text-zinc-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 focus:bg-white'
                    }`}
                  />
                </div>

                {/* 2. Aspect Ratio Choice */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Aspect Ratio</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.id}
                        disabled={isGenerating}
                        onClick={() => setSelectedRatio(ratio.id)}
                        className={`py-2 px-1 rounded-lg border text-center transition-all ${
                          selectedRatio === ratio.id
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold scale-[1.03]'
                            : settings.theme === 'dark'
                              ? 'border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400 text-xs'
                              : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 text-xs'
                        }`}
                        title={ratio.desc}
                      >
                        <div className="font-bold text-xs">{ratio.value}</div>
                        <div className="text-[8px] opacity-60 truncate mt-0.5">{ratio.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Preset Aesthetics */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Art Style Preset</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        disabled={isGenerating}
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          selectedPreset === preset.id
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                            : settings.theme === 'dark'
                              ? 'border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400'
                              : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{preset.name}</div>
                        <div className="text-[8px] opacity-60 truncate mt-0.5">{preset.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Canvas Quality / Size Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 tracking-wide uppercase flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resolution & Credit Cost</span>
                  </label>
                  <div className="space-y-1.5">
                    {IMAGE_SIZES.map((size) => (
                      <button
                        key={size.id}
                        disabled={isGenerating}
                        onClick={() => setSelectedSize(size.id)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                          selectedSize === size.id
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold'
                            : settings.theme === 'dark'
                              ? 'border-white/5 hover:border-white/10 hover:bg-white/5 text-zinc-400'
                              : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        <span className="text-xs">{size.name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          selectedSize === size.id ? 'bg-emerald-500/25 text-emerald-400 font-black' : 'opacity-65'
                        }`}>
                          {size.cost} Credits
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Trigger */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className={`w-full py-3 px-4 rounded-xl font-bold tracking-tight text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      !prompt.trim() || isGenerating
                        ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Studio Canvas...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-100" />
                        <span>Generate (Costs {getSelectedSizeCost()} Credits)</span>
                      </>
                    )}
                  </button>

                  {errorText && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 leading-normal font-medium">
                      {errorText}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] opacity-60 px-1 font-mono">
                    <span>Available Credits:</span>
                    <span>{creditsRemaining} Credits</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Creation Preview Column */}
            <main className="flex-1 flex flex-col p-6 items-center justify-center overflow-y-auto relative">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center space-y-4 max-w-sm text-center"
                  >
                    {/* Pulsing art card spinner overlay */}
                    <div className={`w-64 h-64 rounded-3xl border flex items-center justify-center relative overflow-hidden ${
                      settings.theme === 'dark' ? 'bg-zinc-950/80 border-white/5' : 'bg-white border-zinc-200 shadow-sm'
                    }`}>
                      {/* Gradient background rotating effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-sky-500/20 to-violet-500/20 animate-pulse" />
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin z-10" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold tracking-tight animate-pulse">{loadingMessage}</p>
                      <p className="text-xs opacity-50">This can take up to 10-15 seconds depending on requested resolution.</p>
                    </div>
                  </motion.div>
                ) : currentImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl w-full space-y-4"
                  >
                    <div className={`rounded-3xl border overflow-hidden shadow-2xl relative group ${
                      settings.theme === 'dark' ? 'bg-zinc-950 border-white/5' : 'bg-white border-zinc-200'
                    }`}>
                      <div className="relative w-full aspect-square bg-zinc-900/40">
                        <img
                          src={currentImage.url}
                          alt={currentImage.prompt}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Info bar overlay */}
                      <div className={`p-4 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between ${
                        settings.theme === 'dark' ? 'border-white/5 bg-zinc-900/20' : 'border-zinc-100 bg-zinc-50/50'
                      }`}>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-xs font-bold truncate leading-none" title={currentImage.prompt}>
                            {currentImage.prompt}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] font-mono opacity-65">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-500/10 border border-zinc-500/10">Ratio: {currentImage.aspectRatio}</span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-500/10 border border-zinc-500/10">Size: {currentImage.imageSize}</span>
                            <span className="px-1.5 py-0.5 rounded bg-zinc-500/10 border border-zinc-500/10 capitalize">Style: {currentImage.preset}</span>
                          </div>
                        </div>

                        {/* Interactive tools */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={handleCopyPrompt}
                            className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                              settings.theme === 'dark'
                                ? 'bg-zinc-900 border-white/5 text-zinc-300 hover:bg-zinc-800'
                                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                            }`}
                            title="Copy prompt"
                          >
                            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{copiedPrompt ? 'Copied' : 'Prompt'}</span>
                          </button>

                          <a
                            href={currentImage.url}
                            download={`webnixo-art-${Date.now()}.png`}
                            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs tracking-tight flex items-center gap-1.5 shadow-xs transition-colors"
                            title="Download master image"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center max-w-sm text-center p-8 border border-dashed rounded-3xl border-zinc-700/20"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-400 border border-zinc-500/10 mb-4">
                      <ImageIcon className="w-6 h-6 stroke-1.5" />
                    </div>
                    <h3 className="text-sm font-extrabold tracking-tight mb-1">Pristine Canvas Awaiting</h3>
                    <p className="text-xs opacity-60 leading-normal">
                      Describe an architectural rendering, isometric concept, photographic portrait, or fantasy landscape on the left panel to begin.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        ) : (
          /* History tab list view */
          <div className="h-full w-full overflow-y-auto p-6">
            {historyList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto select-none space-y-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-500/10 flex items-center justify-center text-zinc-400 border border-zinc-500/10">
                  <History className="w-5 h-5 stroke-1.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight mb-1">No Generation History</h3>
                  <p className="text-xs opacity-60 leading-normal">
                    Images you generate in the studio will be securely stored here on your local browser dashboard.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between border-b pb-3 border-zinc-700/10 dark:border-white/5">
                  <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                    Your Historical Masterpieces ({historyList.length})
                  </h3>
                  <button
                    onClick={clearAllHistory}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                      settings.theme === 'dark'
                        ? 'bg-zinc-950/80 border-white/5 text-red-400 hover:bg-red-500/10'
                        : 'bg-white border-zinc-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Studio History</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCurrentImage(item);
                        setActiveTab('create');
                      }}
                      className={`group rounded-2xl border overflow-hidden shadow-xs cursor-pointer hover:scale-[1.01] transition-all relative ${
                        settings.theme === 'dark' ? 'bg-zinc-950 border-white/5 hover:border-emerald-500/20' : 'bg-white border-zinc-200 hover:border-emerald-500/30'
                      }`}
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-square w-full overflow-hidden bg-zinc-900/40">
                        <img
                          src={item.url}
                          alt={item.prompt}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay delete button on hover */}
                        <button
                          onClick={(e) => deleteFromHistory(item.id, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete creation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Info Panel footer */}
                      <div className="p-3 space-y-1">
                        <p className="text-[11px] font-bold truncate leading-none">{item.prompt}</p>
                        <div className="flex items-center justify-between gap-2 text-[8px] font-mono opacity-60">
                          <span>{item.imageSize} • {item.aspectRatio}</span>
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
