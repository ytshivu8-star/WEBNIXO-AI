/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SearchSource {
  title: string;
  url: string;
}

export interface Attachment {
  name: string;
  mimeType: string;
  size?: number;
  base64?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SearchSource[];
  queries?: string[];
  isError?: boolean;
  attachments?: Attachment[];
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
    name: 'Gemini 3.5 Flash',
    description: 'Our default high-speed intelligent multi-model router.',
    badge: 'Router',
    logoUrl: 'https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512'
  },
  {
    id: 'gemini-3.5-pro',
    name: 'Gemini 3.5 Pro',
    description: 'Advanced reasoning, deep coding, and complex mathematical logic.',
    badge: 'Pro',
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
    id: 'chatgpt-4o',
    name: 'ChatGPT 4o',
    description: 'Conversational excellence tuned with ChatGPT style outputs.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-4-4',
    name: 'ChatGPT 4.4',
    description: 'Conversational excellence tuned with ChatGPT style outputs.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Mode',
    description: 'Conversational excellence tuned with ChatGPT style outputs.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Highly articulate, beautifully structured, and code-optimized.',
    badge: 'Anthropic',
    logoUrl: 'https://lh3.googleusercontent.com/d/1och2V-ulECH9ujFptpnQulpdfN288JLr'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Highly articulate, beautifully structured, and code-optimized.',
    badge: 'Anthropic',
    logoUrl: 'https://lh3.googleusercontent.com/d/1och2V-ulECH9ujFptpnQulpdfN288JLr'
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
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    description: 'Deep reasoning, lightning fast responses, and clean coding syntax.',
    badge: 'DeepSeek',
    logoUrl: 'https://lh3.googleusercontent.com/d/13_MWI7R7km1HMxQ2HLMvKKqvebFPqy7K'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Deep reasoning, lightning fast responses, and clean coding syntax.',
    badge: 'DeepSeek',
    logoUrl: 'https://lh3.googleusercontent.com/d/13_MWI7R7km1HMxQ2HLMvKKqvebFPqy7K'
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
    id: 'chatgpt-5-4-nano',
    name: 'GPT-5.4 nano',
    description: 'GPT-5.4 nano Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-5-4-mini',
    name: 'GPT-5.4 mini',
    description: 'GPT-5.4 mini Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-5-mini',
    name: 'GPT-5 mini',
    description: 'GPT-5 mini Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-5-nano',
    name: 'GPT-5 nano',
    description: 'GPT-5 nano Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-4-1-nano',
    name: 'GPT-4.1 nano',
    description: 'GPT-4.1 nano Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-4o-mini',
    name: 'GPT-4o mini',
    description: 'GPT-4o mini Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-5-4',
    name: 'GPT-5.4',
    description: 'GPT-5.4 Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-5-2',
    name: 'GPT-5.2',
    description: 'GPT-5.2 Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-5-1',
    name: 'GPT-5.1',
    description: 'GPT-5.1 Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-5',
    name: 'GPT-5',
    description: 'GPT-5 Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-image-1',
    name: 'GPT Image 1',
    description: 'GPT Image 1 Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-image-1-5',
    name: 'GPT Image 1.5',
    description: 'GPT Image 1.5 Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-image-2',
    name: 'GPT Image 2',
    description: 'GPT Image 2 Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'chatgpt-o4-mini',
    name: 'o4 mini',
    description: 'o4 mini Advanced AI model.',
    badge: 'ChatGPT',
    logoUrl: 'https://lh3.googleusercontent.com/d/1kloRqgJ5jSwAJhzlxwwhq0DRPWRcjhlN'
  },
  {
    id: 'gemini-3-1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Gemini 3.1 Flash Lite Advanced AI model.',
    badge: 'Gemini',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ'
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    description: 'Gemini 3 Flash Advanced AI model.',
    badge: 'Gemini',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ'
  },
  {
    id: 'gemini-2-5-lite',
    name: 'Gemini 2.5 Lite',
    description: 'Gemini 2.5 Lite Advanced AI model.',
    badge: 'Gemini',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ'
  },
  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Gemini 2.5 Flash Advanced AI model.',
    badge: 'Gemini',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ'
  },
  {
    id: 'gemini-3-1-pro',
    name: 'Gemini 3.1 Pro',
    description: 'Gemini 3.1 Pro Advanced AI model.',
    badge: 'Gemini',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ'
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Gemini 2.5 Pro Advanced AI model.',
    badge: 'Gemini',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-_8VTk_qQkd2qfMdvpUeCLumvg9v5dXJ'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek Chat Advanced AI model.',
    badge: 'DeepSeek',
    logoUrl: 'https://lh3.googleusercontent.com/d/13_MWI7R7km1HMxQ2HLMvKKqvebFPqy7K'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    description: 'DeepSeek Reasoner Advanced AI model.',
    badge: 'DeepSeek',
    logoUrl: 'https://lh3.googleusercontent.com/d/13_MWI7R7km1HMxQ2HLMvKKqvebFPqy7K'
  },
  {
    id: 'perplexity-sonar',
    name: 'Perplexity Sonar',
    description: 'Perplexity Sonar Advanced AI model.',
    badge: 'Perplexity',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-Qopm9dETsfDxmyv-5-kZN5QmGGsPgaJ'
  },
  {
    id: 'perplexity-sonar-pro',
    name: 'Perplexity Sonar Pro',
    description: 'Perplexity Sonar Pro Advanced AI model.',
    badge: 'Perplexity',
    logoUrl: 'https://lh3.googleusercontent.com/d/1-Qopm9dETsfDxmyv-5-kZN5QmGGsPgaJ'
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    description: 'Claude Haiku 4.5 Advanced AI model.',
    badge: 'Anthropic',
    logoUrl: 'https://lh3.googleusercontent.com/d/1och2V-ulECH9ujFptpnQulpdfN288JLr'
  },
  {
    id: 'claude-sonnet-4-0',
    name: 'Claude Sonnet 4.0',
    description: 'Claude Sonnet 4.0 Advanced AI model.',
    badge: 'Anthropic',
    logoUrl: 'https://lh3.googleusercontent.com/d/1och2V-ulECH9ujFptpnQulpdfN288JLr'
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    description: 'Claude Sonnet 4.6 Advanced AI model.',
    badge: 'Anthropic',
    logoUrl: 'https://lh3.googleusercontent.com/d/1och2V-ulECH9ujFptpnQulpdfN288JLr'
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    description: 'Grok 3 Mini Advanced AI model.',
    badge: 'xAI Grok',
    logoUrl: 'https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo'
  },
  {
    id: 'grok-4-fast',
    name: 'Grok 4 Fast',
    description: 'Grok 4 Fast Advanced AI model.',
    badge: 'xAI Grok',
    logoUrl: 'https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo'
  },
  {
    id: 'grok-4-1-fast',
    name: 'Grok 4.1 Fast',
    description: 'Grok 4.1 Fast Advanced AI model.',
    badge: 'xAI Grok',
    logoUrl: 'https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo'
  },
  {
    id: 'grok-4',
    name: 'Grok 4',
    description: 'Grok 4 Advanced AI model.',
    badge: 'xAI Grok',
    logoUrl: 'https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo'
  },
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    description: 'Grok Imagine Advanced AI model.',
    badge: 'xAI Grok',
    logoUrl: 'https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo'
  },
  {
    id: 'grok-imagine-pro',
    name: 'Grok Imagine Pro',
    description: 'Grok Imagine Pro Advanced AI model.',
    badge: 'xAI Grok',
    logoUrl: 'https://lh3.googleusercontent.com/d/1z4zahWz8TaUmq-SDCi-6-OxNEG9jfddo'
  },
  {
    id: 'nanobanana',
    name: 'Nano Banana',
    description: 'Nano Banana Image model.',
    badge: 'Nano Banana',
    logoUrl: 'https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512'
  },
  {
    id: 'nanobanana-pro',
    name: 'Nano Banana Pro',
    description: 'Nano Banana Pro Image model.',
    badge: 'Nano Banana',
    logoUrl: 'https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512'
  },
  {
    id: 'nanobanana-2',
    name: 'Nano Banana 2',
    description: 'Nano Banana 2 Image model.',
    badge: 'Nano Banana',
    logoUrl: 'https://lh3.googleusercontent.com/d/11yuTE40NZx1imt0DARVHUfIPTrgtrJA6=s512'
  },
  {
    id: 'codestral',
    name: 'Codestral',
    description: 'Codestral Advanced AI model.',
    badge: 'Mistral',
    logoUrl: 'https://lh3.googleusercontent.com/d/1flRFYCw1WYFvyoYttJTWlZTj78nJCtUd'
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    description: 'Mistral Small Advanced AI model.',
    badge: 'Mistral',
    logoUrl: 'https://lh3.googleusercontent.com/d/1flRFYCw1WYFvyoYttJTWlZTj78nJCtUd'
  },
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    description: 'Mistral Medium Advanced AI model.',
    badge: 'Mistral',
    logoUrl: 'https://lh3.googleusercontent.com/d/1flRFYCw1WYFvyoYttJTWlZTj78nJCtUd'
  },
  {
    id: 'magistral-small',
    name: 'Magistral Small',
    description: 'Magistral Small Advanced AI model.',
    badge: 'Mistral',
    logoUrl: 'https://lh3.googleusercontent.com/d/1flRFYCw1WYFvyoYttJTWlZTj78nJCtUd'
  },
  {
    id: 'magistral-medium',
    name: 'Magistral Medium',
    description: 'Magistral Medium Advanced AI model.',
    badge: 'Mistral',
    logoUrl: 'https://lh3.googleusercontent.com/d/1flRFYCw1WYFvyoYttJTWlZTj78nJCtUd'
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
