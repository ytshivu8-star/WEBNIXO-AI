import React, { useState, useEffect } from 'react';
import { X, HelpCircle, FileText, ShieldAlert, BadgeInfo, Scale, Phone, CheckCircle2, ChevronRight, Check } from 'lucide-react';

export type LegalTab = 'faq' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'contact';

interface LegalCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
  theme: 'light' | 'dark';
}

export default function LegalCenter({ isOpen, onClose, initialTab = 'faq', theme }: LegalCenterProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  // Sync activeTab with initialTab if initialTab changes when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const tabs: { id: LegalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'terms', label: 'Terms & Conditions', icon: <Scale className="w-4 h-4" /> },
    { id: 'refund', label: 'Refund Policy', icon: <ShieldAlert className="w-4 h-4 text-rose-500" /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <FileText className="w-4 h-4" /> },
    { id: 'cookies', label: 'Cookie Policy', icon: <BadgeInfo className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact & Support', icon: <Phone className="w-4 h-4" /> },
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none"
      style={{ contentVisibility: 'auto' }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-5xl h-[85vh] sm:h-[80vh] flex flex-col md:flex-row rounded-3xl border shadow-2xl overflow-hidden transition-all scale-100 ${
          isDark 
            ? 'bg-[#121212] border-zinc-800 text-zinc-100' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Close button (top right) */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full hover:opacity-80 transition-opacity ${
            isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'
          }`}
          title="Close Dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sidebar Tabs (Left Side) */}
        <div className={`w-full md:w-64 flex-shrink-0 p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r ${
          isDark ? 'bg-zinc-950/40 border-zinc-800/80' : 'bg-zinc-50 border-zinc-100'
        }`}>
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2 mt-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                <HelpCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-wide">WEBNIXO Help</h4>
                <p className="text-[10px] opacity-50 font-mono">Compliance & Trust</p>
              </div>
            </div>

            <nav className="space-y-1" aria-label="Legal Center Navigation">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : isDark
                          ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                          : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-zinc-500/10 text-[10px] opacity-40 font-mono">
            <p>&copy; {new Date().getFullYear()} WEBNIXO AI</p>
            <p>v1.2.0 &bull; Secure Gateway</p>
          </div>
        </div>

        {/* Dynamic Content Panel (Right Side) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-text">
          {activeTab === 'faq' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                  Frequently Asked Questions (FAQ)
                </h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Quick answers to help you navigate WEBNIXO AI Fiesta Hub and payment operations.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  {
                    q: "What is WEBNIXO AI Fiesta Hub?",
                    a: "WEBNIXO AI is an elite multi-model routing gateway designed to bridge state-of-the-art Large Language Models (including ChatGPT-4o, Claude 3.5 Sonnet, Google Gemini, DeepSeek R1, xAI Grok, etc.) under a unified, high-performance interface. We provide automatic redundant failovers and direct Live Google Search web-grounding integration."
                  },
                  {
                    q: "How does the pricing and subscription work?",
                    a: "We offer distinct tier passes, including a Monthly Pass and a Yearly Elite Pass. These passes grant you full, high-speed access to all models, bypass active throttling, and enable live Google Search web-grounding queries."
                  },
                  {
                    q: "Is there a free trial?",
                    a: "Yes! Click 'Try Demo' on our landing page to access our standard model routing engine instantly without making any payment. Demo mode is fully functional with minor rate quotas."
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
                    a: "Because our service provides immediate, real-time access to premium API tokens, cloud routing instances, and high-performance computation servers upon activation, we have a strict no-refund policy. Please refer to our Refund Policy tab for complete terms."
                  },
                  {
                    q: "Who should I contact if a transaction fails?",
                    a: "If a transaction fails or your subscription does not activate automatically, contact our high-priority support desk immediately at support@webnixo.in or visit our Contact tab. We resolve all billing discrepancies within 24 hours."
                  }
                ].map((faq, index) => (
                  <div key={index} className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100 shadow-3xs'
                  }`}>
                    <h4 className="text-xs font-black mb-1.5 flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className={`text-xs leading-relaxed pl-5.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fade-in text-xs leading-relaxed">
              <div className="space-y-2">
                <h3 className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                  Terms & Conditions
                </h3>
                <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                  Last Revised: June 25, 2026. Please read these terms carefully before utilizing our services.
                </p>
              </div>

              <div className={`space-y-4 p-5 rounded-2xl border ${
                isDark ? 'bg-white/5 border-white/5 text-zinc-300' : 'bg-zinc-50 border-zinc-100 text-zinc-700 shadow-3xs'
              }`}>
                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">1. Acceptance of Terms</h4>
                <p>
                  By accessing or utilizing WEBNIXO AI Fiesta Hub (&quot;the Service&quot;), you explicitly agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the Service.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">2. Description of Service</h4>
                <p>
                  WEBNIXO AI acts as an API aggregator and routing framework. We facilitate communication with third-party Large Language Model providers (Google, OpenAI, Anthropic, DeepSeek, xAI, etc.). Service speed, uptime, and performance may depend on external API availability. We offer redundancy failovers to keep you online at all times.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">3. User Accounts and Security</h4>
                <p>
                  To unlock premium features, you must sign in via Supabase using your authentic Google credentials. You are solely responsible for maintaining the confidentiality of your account authentication tokens and for all operations performed under your session.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">4. Subscriptions & Billing</h4>
                <p>
                  Premium access is billed on a recurring or upfront basis as per the selected pass. Payments are securely processed via our checkout partner, Cashfree Payments India. By initiating checkout, you authorize Cashfree to process the specified amount.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">5. Prohibited Conduct</h4>
                <p>
                  You agree not to abuse the Service by performing automated scraping, DDoS attacks, reverse engineering, or sending highly malicious/illegal prompts to the underlying LLM models. Any suspicious high-frequency automated usage will trigger immediate automatic account suspension without refund.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">6. Limitation of Liability</h4>
                <p>
                  WEBNIXO AI AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES RESULTING FROM THE USE OR INABILITY TO USE THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, API DOWNTIME, OR FINANCIAL LOSS FROM FAILED TRANSACTIONS.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">7. Governing Law</h4>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  CRITICAL NOTICE
                </div>
                <h3 className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
                  Refund & Cancellation Policy
                </h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Clear terms governing subscription payments, premium activations, and credit finality.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border ${
                isDark ? 'bg-rose-500/[0.03] border-rose-500/20 text-zinc-200' : 'bg-rose-50/30 border-rose-200 text-zinc-800'
              } space-y-4 text-xs leading-relaxed`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-500 mb-1">STRICT NO-REFUND DIRECTIVE</h4>
                    <p className="font-extrabold uppercase tracking-wide text-[11px] text-rose-500">
                      ONCE PAYMENT IS COMPLETED, NO REFUNDS WILL BE ISSUED UNDER ANY CIRCUMSTANCE.
                    </p>
                  </div>
                </div>

                <div className="border-t border-rose-500/10 pt-4 space-y-3">
                  <h5 className="font-extrabold text-zinc-100 dark:text-zinc-100">Why are all transactions final?</h5>
                  <p>
                    Upon payment confirmation via Cashfree PG, our router immediately provisions dedicated high-performance computing resources, reserves API routing queues, and purchases non-retractable tokens on the flagship models (OpenAI, Anthropic, Gemini, etc.) to guarantee your instant high-speed experience. 
                  </p>
                  <p>
                    Because these underlying computations are executed instantly and cannot be returned, we are unable to refund processing fees or token credits.
                  </p>

                  <h5 className="font-extrabold text-zinc-100 dark:text-zinc-100">Double Payments and Network Failures</h5>
                  <p>
                    If your bank account is debited but your subscription status is not active, please <strong>do not file a chargeback</strong>. This is typically a temporary handshake latency between the bank and Cashfree. Our system automatically audits all incomplete transactions:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 opacity-90">
                    <li>Incomplete orders are auto-settled or refunded directly by Cashfree within 3-5 business days.</li>
                    <li>If a duplicate payment is captured for the same subscription period, the secondary charge will be fully reversed back to the original payment source within 24 hours.</li>
                    <li>For manual assistance, notify support@webnixo.in with your Transaction ID.</li>
                  </ul>

                  <h5 className="font-extrabold text-zinc-100 dark:text-zinc-100 font-display">Cancellation</h5>
                  <p>
                    You can stop using the service at any time. If you purchased a recurring monthly subscription, you can cancel future renewals from your billing dashboard. Your active premium status will remain valid until the end of your current paid billing period.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in text-xs leading-relaxed">
              <div className="space-y-2">
                <h3 className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                  Privacy Policy
                </h3>
                <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                  Your privacy is our core mandate. Learn how we secure your identity and data records.
                </p>
              </div>

              <div className={`space-y-4 p-5 rounded-2xl border ${
                isDark ? 'bg-white/5 border-white/5 text-zinc-300' : 'bg-zinc-50 border-zinc-100 text-zinc-700 shadow-3xs'
              }`}>
                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">1. Data We Collect</h4>
                <p>
                  We collect minimal data required to provide and authenticate our service:
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li><strong>Identity:</strong> Email address and profile name provided during Google Auth.</li>
                  <li><strong>Billing:</strong> Transaction IDs, amount, and payment status passed by Cashfree (we <strong>never</strong> store your card numbers or UPI credentials).</li>
                  <li><strong>Logs:</strong> Prompt queries and conversation histories to keep your chat history accessible in your sidebar.</li>
                </ul>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">2. How We Use Data</h4>
                <p>
                  Your data is used strictly to run the model router:
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>To authenticate your session and sync your chat list.</li>
                  <li>To process subscription payments and authorize premium model routes.</li>
                  <li>To trace and fix software errors and API connection failures.</li>
                </ul>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">3. Third-Party API Data Sharing</h4>
                <p>
                  To process your prompts, we transmit your text input securely via SSL to the respective model API providers (Google Cloud Vertex, OpenAI, Anthropic). These providers agree not to use inputs passed via API to train their public models. Your inputs are confidential.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">4. Zero Advertisement Policy</h4>
                <p>
                  We are 100% funded by subscription passes. We do not place ads, integrate marketing trackers, or sell your search history to third-party advertising companies. Your identity remains clean and untracked.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100 font-display">5. User Control & Deletion</h4>
                <p>
                  You have full ownership of your data. You can delete individual chat histories from your sidebar anytime. To request permanent deletion of your complete WEBNIXO user profile and auth credentials, please contact support@webnixo.in.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-6 animate-fade-in text-xs leading-relaxed">
              <div className="space-y-2">
                <h3 className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                  Cookie Policy
                </h3>
                <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                  We use cookies strictly for security, authentication, and core performance purposes.
                </p>
              </div>

              <div className={`space-y-4 p-5 rounded-2xl border ${
                isDark ? 'bg-white/5 border-white/5 text-zinc-300' : 'bg-zinc-50 border-zinc-100 text-zinc-700 shadow-3xs'
              }`}>
                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">What are cookies?</h4>
                <p>
                  Cookies are small text files placed on your device by websites you visit. They are used to make websites work, or work more efficiently, as well as to provide essential session state.
                </p>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">Our Strictly Functional Cookies</h4>
                <p>
                  WEBNIXO AI does not employ any advertising or behavioral targeting cookies. We only set the following essential cookies:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                        <th className="py-2 font-bold">Cookie Name</th>
                        <th className="py-2 font-bold">Purpose</th>
                        <th className="py-2 font-bold">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`border-b ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
                        <td className="py-2 font-mono text-[11px] text-emerald-400">sb-access-token</td>
                        <td className="py-2">Secures your active Supabase user auth session.</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className={`border-b ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
                        <td className="py-2 font-mono text-[11px] text-emerald-400">webnixo-theme</td>
                        <td className="py-2">Persists your light/dark mode UI preferences.</td>
                        <td className="py-2">1 Year</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-[11px] text-emerald-400">cf_checkout_state</td>
                        <td className="py-2">Secures payment routing during Cashfree Checkout checkout handshakes.</td>
                        <td className="py-2">30 Mins</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-extrabold text-sm text-zinc-100 dark:text-zinc-100">How to Manage Cookies</h4>
                <p>
                  You can choose to block or delete cookies in your web browser settings. However, please note that blocking essential auth cookies will prevent you from signing in, accessing your chats, or performing secure checkouts.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                  Contact & Support Info
                </h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Authentic corporate credentials and high-priority escalation contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* 1. Support Email Card */}
                <div className={`p-5 rounded-2xl border text-left ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100 shadow-3xs'
                }`}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono block mb-1">Customer Care</span>
                  <h4 className="text-sm font-bold text-zinc-100 dark:text-zinc-100 mb-1.5">Direct Helpdesk</h4>
                  <p className={`text-xs mb-3 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    For priority subscription activation, dual debit claims, API quota errors, or account deletion:
                  </p>
                  <a 
                    href="mailto:support@webnixo.in" 
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    support@webnixo.in &rarr;
                  </a>
                </div>

                {/* 2. Business Information Card */}
                <div className={`p-5 rounded-2xl border text-left ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-100 shadow-3xs'
                }`}>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 font-mono block mb-1">Corporate Details</span>
                  <h4 className="text-sm font-bold text-zinc-100 dark:text-zinc-100 mb-1.5">WEBNIXO Operating Entity</h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <strong>WEBNIXO AI Suite</strong><br />
                    Outer Ring Road, Bellandur,<br />
                    Bengaluru, Karnataka - 560103, India.<br />
                    <span className="opacity-50 mt-1 block">Reg Number: KA-BLR-2026-WN04</span>
                  </p>
                </div>

                {/* 3. Uptime Standards */}
                <div className={`p-5 rounded-2xl border text-left md:col-span-2 ${
                  isDark ? 'bg-emerald-500/[0.02] border-emerald-500/10' : 'bg-emerald-50/20 border-emerald-100 shadow-3xs'
                }`}>
                  <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Compliance & Uptime Guarantees</span>
                  </h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    Our routing nodes are deployed in highly available Google Cloud Run containers. We guarantee 99.95% API uptime. Merchant operations are fully logged and settled in compliance with RBI guidelines for payment aggregators.
                  </p>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
