/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SearchSource {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SearchSource[];
  queries?: string[];
  isError?: boolean;
  compares?: Record<string, {
    modelName: string;
    content: string;
    isLoading?: boolean;
    error?: string;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  searchGrounding: boolean;
  createdAt: string;
  compareModelIds?: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge: string;
  logoUrl?: string;
}

export const MODELS: ModelOption[] = [
  {
    id: 'gemini-3.5-flash',
    name: 'WEBNIXO 1.0 (Flash)',
    description: 'Our default high-speed intelligent multi-model router.',
    badge: 'Router',
    logoUrl: 'https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'WEBNIXO Pro (Pro)',
    description: 'Advanced reasoning, deep coding, and complex mathematical logic.',
    badge: 'Pro',
    logoUrl: 'https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Mode',
    description: 'Conversational excellence tuned with ChatGPT style outputs.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'claude',
    name: 'Claude Mode',
    description: 'Highly articulate, beautifully structured, and code-optimized.',
    badge: 'Anthropic',
    logoUrl: 'https://lh3.googleusercontent.com/d/1och2V-ulECH9ujFptpnQulpdfN288JLr'
  },
  {
    id: 'gemini',
    name: 'Gemini Core',
    description: 'Google’s native core intelligence optimized for large contexts.',
    badge: 'Gemini',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ'
  },
  {
    id: 'grok',
    name: 'Grok Mode',
    description: 'Witty, real-time, highly direct, and unfiltered intelligence.',
    badge: 'xAI Grok',
    logoUrl: 'https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Core',
    description: 'Deep reasoning, lightning fast responses, and clean coding syntax.',
    badge: 'DeepSeek',
    logoUrl: 'https://lh3.googleusercontent.com/d/13_MWI7R7km1HMxQ2HLMvKKqvebFPqy7K'
  },
  {
    id: 'mistral',
    name: 'Mistral Large',
    description: 'High autonomy, European open philosophy, and direct phrasing.',
    badge: 'Mistral',
    logoUrl: 'https://lh3.googleusercontent.com/d/1flRFYCw1WYFvyoYttJTWlZTj78nJCtUd'
  },
  {
    id: 'perplexity',
    name: 'Perplexity Mode',
    description: 'Search-first model with full real-time grounding forced on.',
    badge: 'Perplexity',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-Qopm9dETsfDxmyv-5-kZN5QmGGsPgaJ'
  },
  {
    id: 'compare-all',
    name: 'Compare All Models',
    description: 'Enter a single prompt to compare ChatGPT, Claude, Gemini, Grok, and DeepSeek side-by-side!',
    badge: 'Multi-Engine',
    logoUrl: 'https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512'
  }
];

export interface AppSettings {
  theme: 'dark' | 'light';
  clearOnNewChat: boolean;
  userEmail: string;
}
