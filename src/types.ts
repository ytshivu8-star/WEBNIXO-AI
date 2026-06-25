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
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  searchGrounding: boolean;
  createdAt: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export const MODELS: ModelOption[] = [
  {
    id: 'gemini-3.5-flash',
    name: 'WEBNIXO 1.0 (Flash)',
    description: 'Fast, responsive, and ideal for everyday tasks.',
    badge: 'Standard'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'WEBNIXO Pro (Pro)',
    description: 'Advanced reasoning, coding, and highly complex logic.',
    badge: 'Pro'
  }
];

export interface AppSettings {
  theme: 'dark' | 'light';
  clearOnNewChat: boolean;
  userEmail: string;
}
