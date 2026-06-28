import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Zap, Loader2, ShieldCheck, CreditCard, Tag, Gift, Database, Plus, RefreshCw, Calendar, Sparkle, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  theme: 'light' | 'dark';
  onOpenLegal?: (tab: 'faq' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'contact') => void;
}

const loadCashfreeSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Cashfree) {
      resolve((window as any).Cashfree);
      return;
    }
    const script = document.createElement('script');
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

export default function PricingModal({ isOpen, onClose, userEmail, theme, onOpenLegal }: PricingModalProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // holds planId during processing
  const [error, setError] = useState('');

  // Coupon state engine
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dynamic Coupon Database Control Center State
  const [dbCoupons, setDbCoupons] = useState<any[]>([]);
  const [couponUsages, setCouponUsages] = useState<any[]>([]);
  const [showDatabasePanel, setShowDatabasePanel] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(50);
  const [newCouponDescription, setNewCouponDescription] = useState('');
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [createCouponMsg, setCreateCouponMsg] = useState('');
  const [createCouponError, setCreateCouponError] = useState('');
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);

  // Fetch Coupons Database Table
  const fetchCouponsFromDB = async () => {
    setIsFetchingCoupons(true);
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        if (data && data.coupons) {
          setDbCoupons(data.coupons);
          return;
        }
      }
      throw new Error("API not responding or returned error");
    } catch (e) {
      console.warn("Failed to load coupons from API. Trying client-side Supabase direct connection...", e);
      try {
        const { data, error } = await supabase
          .from("webnixo_profiles_affilate")
          .select("email, full_name, referral_code, custom_coupon_code, joined_at");
        if (!error && data) {
          const couponsList: any[] = [];
          data.forEach((item: any) => {
            if (item.custom_coupon_code && item.custom_coupon_code.trim()) {
              const codeUpper = item.custom_coupon_code.trim().toUpperCase();
              if (!couponsList.some(c => c.code === codeUpper)) {
                couponsList.push({
                  code: codeUpper,
                  discount_percent: 20,
                  description: `Affiliate promo of ${item.full_name}`,
                  is_active: true,
                  created_at: item.joined_at || new Date().toISOString(),
                  email: item.email
                });
              }
            }
            if (item.referral_code && item.referral_code.trim()) {
              const codeUpper = item.referral_code.trim().toUpperCase();
              if (!couponsList.some(c => c.code === codeUpper)) {
                couponsList.push({
                  code: codeUpper,
                  discount_percent: 20,
                  description: `Referral of ${item.full_name}`,
                  is_active: true,
                  created_at: item.joined_at || new Date().toISOString(),
                  email: item.email
                });
              }
            }
          });
          setDbCoupons(couponsList);
        } else {
          console.error("Supabase client-side direct connection also failed:", error);
        }
      } catch (clientErr) {
        console.error("Client-side direct query exception:", clientErr);
      }
    } finally {
      setIsFetchingCoupons(false);
    }
  };

  // Fetch Coupon Usages Logs Table
  const fetchCouponUsagesFromDB = async () => {
    setIsFetchingLogs(true);
    try {
      const res = await fetch('/api/coupons/usages');
      if (res.ok) {
        const data = await res.json();
        if (data && data.usages) {
          setCouponUsages(data.usages);
          return;
        }
      }
      throw new Error("API not responding or returned error");
    } catch (e) {
      console.warn("Failed to load coupon logs from API. Trying client-side fallback...", e);
    } finally {
      setIsFetchingLogs(false);
    }
  };

  // Create & Sync New Custom Coupon in Database
  const handleCreateCouponInDB = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateCouponError('');
    setCreateCouponMsg('');

    const cleanCode = newCouponCode.trim().toUpperCase();
    if (!cleanCode) {
      setCreateCouponError('Please enter a unique coupon code (e.g. SAVINGS75)');
      return;
    }

    if (newCouponPercent < 1 || newCouponPercent > 99) {
      setCreateCouponError('Discount percentage must be between 1% and 99%');
      return;
    }

    setIsCreatingCoupon(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          discount_percent: Number(newCouponPercent),
          description: newCouponDescription || `${newCouponPercent}% discount promo`
        })
      });
      const data = await res.json();
      if (data.error) {
        setCreateCouponError(data.error);
      } else if (data.success) {
        setCreateCouponMsg(`🎉 Coupon "${cleanCode}" successfully created and saved into Database!`);
        setNewCouponCode('');
        setNewCouponDescription('');
        setNewCouponPercent(50);
        // Refresh local listings and syncing
        fetchCouponsFromDB();
      }
    } catch (err) {
      setCreateCouponError('Network error connecting to coupon database.');
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  // Load coupon definitions on modal open
  useEffect(() => {
    if (isOpen) {
      fetchCouponsFromDB();
      fetchCouponUsagesFromDB();
    }
  }, [isOpen]);

  const getDiscountedPrice = (originalPrice: number) => {
    if (!appliedCoupon) return originalPrice;
    if (appliedCoupon.code === 'FREEPASS') return 1; // Special ₹1 bypass for developer trials and easy tests!
    const discountAmount = 50; // Flat ₹50 discount
    return Math.max(1, originalPrice - discountAmount); // Ensure it is at least ₹1 to satisfy payment validation
  };

  // Server-backed dynamic database Coupon application
  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    setIsApplyingCoupon(true);

    const codeClean = couponInput.trim().toUpperCase();
    if (!codeClean) {
      setCouponError('Please enter a coupon code.');
      setIsApplyingCoupon(false);
      return;
    }

    const targetPlanId = billingInterval === 'monthly' ? plans.pro.monthly.id : plans.pro.yearly.id;
    const targetPlanPrice = billingInterval === 'monthly' ? plans.pro.monthly.price : plans.pro.yearly.price;

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'ytshivu8@gmail.com',
          code: codeClean,
          planId: targetPlanId,
          originalPrice: targetPlanPrice
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        setCouponError(data.error);
      } else if (data.success) {
        setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
        setCouponSuccess(data.message || `🎉 Coupon ${data.code} applied!`);
        setShowConfetti(true);
        // Refresh tables immediately to show newly applied metrics!
        fetchCouponsFromDB();
        fetchCouponUsagesFromDB();

        setTimeout(() => {
          setShowConfetti(false);
        }, 4500);
      } else {
        setCouponError('❌ Invalid coupon response from server.');
      }
    } catch (err) {
      console.warn("Connection error to server coupon database. Falling back to offline match...", err);
      
      // Attempt local offline matching against loaded dbCoupons state
      const matchedLocal = dbCoupons.find(
        (c) => c && String(c.code || '').trim().toUpperCase() === codeClean && c.is_active !== false
      );

      if (matchedLocal) {
        const discountPercent = Number(matchedLocal.discount_percent || matchedLocal.discountPercent) || 20;
        setAppliedCoupon({ code: codeClean, discountPercent });
        setCouponSuccess(`🎉 Coupon ${codeClean} applied offline! Saved ₹50`);
        setCouponError('');
        setShowConfetti(true);
        
        // Log client-side affiliate lead event directly so affiliate partners get their credit
        try {
          const matchedEmail = matchedLocal.email || "";
          if (matchedEmail) {
            const eventId = `aff_evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            await supabase.from("webnixo_events_affilate").insert({
              id: eventId,
              user_email: matchedEmail,
              type: "Coupon Applied",
              details: `Client-side user ${userEmail || 'guest'} applied coupon ${codeClean} (Offline Match)`,
              timestamp: new Date().toISOString(),
              commission: 0,
              created_at: new Date().toISOString()
            });
            console.log("Logged affiliate event client-side successfully.");
          }
        } catch (logErr) {
          console.warn("Failed to log affiliate event client-side:", logErr);
        }

        setTimeout(() => {
          setShowConfetti(false);
        }, 4500);
      } else {
        // Direct query client-side against Supabase
        try {
          const { data: affiliate, error } = await supabase
            .from("webnixo_profiles_affilate")
            .select("*")
            .or(`custom_coupon_code.ilike.${codeClean},referral_code.ilike.${codeClean}`)
            .maybeSingle();

          let foundAffiliate = affiliate;
          if (error || !affiliate) {
            // Scan fallback
            const { data: allAffs } = await supabase
              .from("webnixo_profiles_affilate")
              .select("*");
            if (allAffs) {
              foundAffiliate = allAffs.find((aff: any) => 
                (aff.custom_coupon_code && String(aff.custom_coupon_code).trim().toUpperCase() === codeClean) ||
                (aff.referral_code && String(aff.referral_code).trim().toUpperCase() === codeClean)
              ) || null;
            }
          }

          if (foundAffiliate) {
            const discountPercent = 20; // Default 20%
            setAppliedCoupon({ code: codeClean, discountPercent });
            setCouponSuccess(`🎉 Affiliate coupon ${codeClean} applied directly via Database! Saved ₹50`);
            setCouponError('');
            setShowConfetti(true);

            // Log event directly to webnixo_events_affilate for commission tracking
            try {
              const eventId = `aff_evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
              await supabase.from("webnixo_events_affilate").insert({
                id: eventId,
                user_email: foundAffiliate.email,
                type: "Coupon Applied",
                details: `Client-side user ${userEmail || 'guest'} applied coupon ${codeClean} (Direct DB)`,
                timestamp: new Date().toISOString(),
                commission: 0,
                created_at: new Date().toISOString()
              });
            } catch (evtErr) {
              console.warn("Direct client log error:", evtErr);
            }

            setTimeout(() => {
              setShowConfetti(false);
            }, 4500);
          } else {
            setCouponError('❌ Invalid coupon code or connection error.');
          }
        } catch (clientErr) {
          console.error("Direct client query apply exception:", clientErr);
          setCouponError('❌ Invalid coupon code or database connection error.');
        }
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
    setCouponInput('');
  };

  const [plans, setPlans] = useState({
    starter: {
      name: 'Monthly Pass',
      description: 'Target: Casual users',
      credits: '2,000 Credits/Month',
      monthly: {
        id: 'monthly',
        price: 499,
        label: '₹499 / month',
      },
      yearly: {
        id: 'yearly',
        price: 4990,
        label: '₹4,990 / year',
        savings: 'Save ₹998',
      },
      models: [
        'GPT-5.4 nano', 'GPT-4o mini', 'Gemini 3 Flash', 'DeepSeek Chat', 'Mistral Small'
      ],
      features: [
        '2,000 Credits/Month',
        'Fast responses',
        'Low API cost',
        'Good for everyday chatting, coding, writing, summaries',
        'Image Generation: GPT Image 1, Nano Banana',
        '50 images/month'
      ],
      color: 'emerald',
    },
    pro: {
      name: 'Premium Pass',
      description: 'Target: Power users, developers, students',
      credits: '10,000 Credits/Month',
      monthly: {
        id: 'premium',
        price: 999,
        label: '₹999 / month',
      },
      yearly: {
        id: 'premium_yearly', // Using fallback for yearly premium since it might not be in DB
        price: 9999,
        label: '₹9,999 / year',
        savings: 'Save ₹1,989',
      },
      models: [
        'GPT-5.4', 'GPT-5', 'o4 mini', 'Gemini 3.1 Pro', 'Claude 4.6', 'Grok 4', 'Perplexity Sonar Pro', 'DeepSeek Reasoner'
      ],
      features: [
        '10,000 Credits/Month',
        'Everything in Monthly Pass +',
        'Premium AI Models',
        'Premium Images',
        'GPT Image 1.5 & 2, Nano Banana Pro & 2, Grok Imagine',
        '300 images/month'
      ],
      color: 'sky',
      badge: 'Highly Popular',
    },
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true);
        
        if (planData && planData.length > 0) {
          setPlans(prevPlans => {
            const newPlans = { ...prevPlans };
            
            const monthlyPlan = planData.find(p => p.id === 'monthly');
            if (monthlyPlan) {
              newPlans.starter.monthly.price = Number(monthlyPlan.cost);
              newPlans.starter.monthly.label = `₹${monthlyPlan.cost} / ${monthlyPlan.period}`;
            }

            const yearlyPlan = planData.find(p => p.id === 'yearly');
            if (yearlyPlan) {
              newPlans.starter.yearly.price = Number(yearlyPlan.cost);
              newPlans.starter.yearly.label = `₹${yearlyPlan.cost} / ${yearlyPlan.period}`;
              if (monthlyPlan) {
                const savings = (Number(monthlyPlan.cost) * 12) - Number(yearlyPlan.cost);
                newPlans.starter.yearly.savings = `Save ₹${Math.max(0, savings)}`;
              }
            }

            const premiumPlan = planData.find(p => p.id === 'premium');
            if (premiumPlan) {
              newPlans.pro.monthly.price = Number(premiumPlan.cost);
              newPlans.pro.monthly.label = `₹${premiumPlan.cost} / ${premiumPlan.period}`;
              newPlans.pro.name = premiumPlan.name;
              
              // If there's no premium_yearly, we can just extrapolate it for now or if we added it to the DB we would fetch it
              const premiumYearlyCost = Math.round(Number(premiumPlan.cost) * 10);
              newPlans.pro.yearly.price = premiumYearlyCost;
              newPlans.pro.yearly.label = `₹${premiumYearlyCost} / yr`;
              newPlans.pro.yearly.savings = `Save ₹${Math.max(0, (Number(premiumPlan.cost) * 12) - premiumYearlyCost)}`;
            }

            return newPlans;
          });
        }
      } catch (err) {
        console.error('Error fetching subscription plans for pricing modal:', err);
      }
    };
    
    fetchPrices();
  }, []);

  const handleCheckout = async (planId: string, amount: number) => {
    try {
      setError('');
      setIsProcessing(planId);

      console.log(`[Billing] Initiating Cashfree PG checkout for ${userEmail} Plan: ${planId} Amount: ₹${amount}`);

      // 1. Create order on Express backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          amount: amount,
          planId: planId
        })
      });

      const responseText = await response.text();
      let orderData: any;
      try {
        orderData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('[Billing] Response was not JSON:', responseText);
        throw new Error('Invalid response from server.');
      }

      if (orderData.error) {
        throw new Error(orderData.error || 'Failed to create payment order on the server.');
      }

      const { paymentSessionId } = orderData;
      if (!paymentSessionId) {
        throw new Error('Server did not return a valid Cashfree payment session ID.');
      }

      // 3. Load and initialize Cashfree JS SDK v3
      const CashfreeInstance = await loadCashfreeSDK();
      const cashfree = CashfreeInstance({
        mode: orderData.environment || 'production' // Our production Cashfree API keys starting with cfsk_ma_prod_ or sandbox mode for tests
      });

      console.log('[Billing] Cashfree SDK initialized. Launching checkout...');

      // 4. Launch Checkout
      cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: '_self'
      });

    } catch (err: any) {
      console.error('[Billing] Checkout failed:', err);
      setError(err.message || 'An error occurred while establishing secure connection with Cashfree.');
      setIsProcessing(null);
    }
  };

  if (!isOpen) return null;
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 md:p-6 bg-black/60 backdrop-blur-xs">
      {/* Self-contained high-fidelity hardware-accelerated confetti and bounce animations */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(650px) rotate(720deg); opacity: 0; }
        }
        @keyframes sway {
          0% { margin-left: -35px; }
          100% { margin-left: 35px; }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .coupon-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Backdrop clickable zone */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-transparent transition-opacity" 
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-3xl p-5 md:p-8 mt-6 mb-12 md:my-8 rounded-[2rem] border shadow-2xl transition-all scale-100 z-10 overflow-hidden ${
        isDark 
          ? 'bg-[#121212] border-white/10 text-zinc-100' 
          : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Decorative Internal Blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[3rem]" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-[3rem]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>
        
        {/* Satisfying Confetti Sprinkles on Successful Coupon Application */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50 rounded-3xl">
            {Array.from({ length: 60 }).map((_, i) => {
              const left = `${Math.random() * 100}%`;
              const delay = `${Math.random() * 1.5}s`;
              const duration = `${1.8 + Math.random() * 2.2}s`;
              const colors = ['#10b981', '#0ea5e9', '#ec4899', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];
              const bg = colors[i % colors.length];
              const size = `${6 + Math.random() * 10}px`;
              const shapeClass = i % 3 === 0 ? 'rounded-full' : i % 3 === 1 ? 'rotate-45' : 'rounded-sm';
              return (
                <div
                  key={i}
                  className={`absolute top-0 ${shapeClass}`}
                  style={{
                    left,
                    backgroundColor: bg,
                    width: size,
                    height: size,
                    animation: `fall ${duration} linear ${delay} infinite, sway ${duration} ease-in-out ${delay} infinite alternate`,
                    opacity: 0.9,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:opacity-80 transition-opacity z-10 ${
            isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'
          }`}
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center space-y-3 mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>WEBNIXO CREDIT PLANS</span>
          </div>
          <h3 className="text-xl md:text-3xl font-black tracking-tight leading-tight">Select Your Premium Power</h3>
          <p className={`text-xs md:text-sm max-w-md mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Supercharge your workflows with modular API routing credits. Select a plan below.
          </p>
        </div>

        {/* Selector Toggle & Coupon Code Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5 items-center relative z-10">
          
          {/* Selector Toggle */}
          <div className="col-span-1 md:col-span-5 flex justify-center">
            <div className={`p-1 rounded-2xl flex gap-1 border w-full ${
              isDark ? 'bg-black/40 border-white/5' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  billingInterval === 'monthly'
                    ? (isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm')
                    : (isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900')
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all relative ${
                  billingInterval === 'yearly'
                    ? (isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-sm')
                    : (isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900')
                }`}
              >
                Yearly Billing
                <span className="absolute -top-3.5 -right-2 bg-emerald-500 text-white text-[7px] font-black uppercase px-1 rounded-full shadow-md">
                  Save ~16%
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Coupon Code Field */}
          <div className="col-span-1 md:col-span-7">
            <div className={`p-1.5 rounded-2xl border flex items-center gap-2 ${
              appliedCoupon 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="pl-2 flex items-center text-zinc-400">
                <Tag className={`w-3.5 h-3.5 ${appliedCoupon ? 'text-emerald-400 animate-bounce' : ''}`} />
              </div>
              
              <input
                type="text"
                placeholder={appliedCoupon ? `Active: ${appliedCoupon.code}` : "Enter affiliate coupon or referral code"}
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={!!appliedCoupon || isApplyingCoupon}
                className="bg-transparent border-0 outline-none p-0 text-xs font-bold tracking-wide w-full focus:ring-0 placeholder:text-zinc-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyCoupon();
                  }
                }}
              />

              {appliedCoupon ? (
                <button
                  onClick={handleRemoveCoupon}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                    isApplyingCoupon
                      ? 'bg-zinc-800 text-zinc-500'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  }`}
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Coupon Success / Error Feedbacks */}
        {couponSuccess && (
          <div className="p-2.5 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] text-center font-bold flex items-center justify-center gap-1.5 animate-[popIn_0.3s_ease-out] relative overflow-hidden">
            <span className="relative z-10 flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 animate-bounce shrink-0" />
              {couponSuccess}
            </span>
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-r from-transparent to-emerald-400/5 animate-pulse" />
          </div>
        )}

        {couponError && (
          <div className="p-2.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center font-semibold animate-shake">
            {couponError}
          </div>
        )}



        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Two Plan Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 relative z-10">
          {/* STARTER CARD */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-xl hover:-translate-y-1 group ${
            isDark 
              ? 'bg-zinc-900/60 border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]' 
              : 'bg-white/80 border-zinc-200 hover:border-emerald-500/30 hover:shadow-xl'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {appliedCoupon && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[7px] font-black uppercase px-2 py-0.5 rounded-bl-lg shadow-sm">
                -₹50 OFF
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xl font-black tracking-tight">{plans.starter.name}</h4>
                <p className={`text-[11px] leading-relaxed font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {plans.starter.description}
                </p>
              </div>

              <div className="pt-2">
                <div className="text-4xl font-black text-emerald-400 flex items-baseline flex-wrap gap-1.5 drop-shadow-sm">
                  {appliedCoupon ? (
                    <>
                      <span className="text-zinc-500 line-through text-lg font-bold">
                        ₹{billingInterval === 'monthly' ? plans.starter.monthly.price : plans.starter.yearly.price}
                      </span>
                      <span>
                        ₹{getDiscountedPrice(billingInterval === 'monthly' ? plans.starter.monthly.price : plans.starter.yearly.price)}
                      </span>
                    </>
                  ) : (
                    <span>
                      ₹{billingInterval === 'monthly' ? plans.starter.monthly.price : plans.starter.yearly.price}
                    </span>
                  )}
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest"> / {billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                
                {appliedCoupon && (
                  <span className="inline-block text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-1.5 py-0.5 rounded mt-1.5">
                    Saved ₹{(billingInterval === 'monthly' ? plans.starter.monthly.price : plans.starter.yearly.price) - getDiscountedPrice(billingInterval === 'monthly' ? plans.starter.monthly.price : plans.starter.yearly.price)} with {appliedCoupon.code}!
                  </span>
                )}
                
                {billingInterval === 'yearly' && !appliedCoupon && (
                  <span className="inline-block text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25 mt-1 animate-pulse">
                    {plans.starter.yearly.savings}
                  </span>
                )}
              </div>

              <hr className={isDark ? 'border-white/5' : 'border-zinc-200'} />

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400">Included Engines:</p>
                <div className="flex flex-wrap gap-1">
                  {plans.starter.models.map(m => (
                    <span key={m} className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                      isDark ? 'bg-white/5 border border-white/15' : 'bg-zinc-200 text-zinc-800'
                    }`}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <hr className={isDark ? 'border-white/5' : 'border-zinc-200'} />

              <ul className="space-y-2 text-[11px]">
                {plans.starter.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckout(
                billingInterval === 'monthly' ? plans.starter.monthly.id : plans.starter.yearly.id,
                getDiscountedPrice(billingInterval === 'monthly' ? plans.starter.monthly.price : plans.starter.yearly.price)
              )}
              disabled={isProcessing !== null}
              className={`w-full py-3 mt-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden group/btn ${
                isProcessing === (billingInterval === 'monthly' ? plans.starter.monthly.id : plans.starter.yearly.id)
                  ? 'bg-zinc-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              {isProcessing === (billingInterval === 'monthly' ? plans.starter.monthly.id : plans.starter.yearly.id) ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin relative z-10" />
                  <span className="relative z-10">Connecting...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">Get Starter Pass</span>
                </>
              )}
            </button>
          </div>

          {/* PRO CARD */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-xl hover:-translate-y-1 group ${
            isDark 
              ? 'bg-sky-950/40 border-sky-500/30 hover:border-sky-400 hover:shadow-[0_0_40px_rgba(14,165,233,0.15)]' 
              : 'bg-gradient-to-b from-sky-50/80 to-white/80 border-sky-500/30 hover:border-sky-400 hover:shadow-xl'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[2rem] -z-10 rounded-full group-hover:bg-sky-500/20 transition-all duration-500" />
            
            {appliedCoupon && (
              <div className="absolute top-0 right-0 bg-sky-500 text-black text-[7px] font-black uppercase px-2 py-0.5 rounded-bl-lg shadow-sm z-10">
                -₹50 OFF
              </div>
            )}

            <div className="space-y-4 relative z-10">
              <div className="flex justify-start mt-1 mb-2">
                <span className="bg-gradient-to-r from-sky-500 to-sky-400 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider shadow-lg shadow-sky-500/20 flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Most Popular / Ultimate</span>
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black tracking-tight">{plans.pro.name}</h4>
                <p className={`text-[11px] leading-relaxed font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {plans.pro.description}
                </p>
              </div>

              <div className="pt-2">
                <div className="text-4xl font-black text-sky-400 flex items-baseline flex-wrap gap-1.5 drop-shadow-sm">
                  {appliedCoupon ? (
                    <>
                      <span className="text-zinc-500 line-through text-lg font-bold">
                        ₹{billingInterval === 'monthly' ? plans.pro.monthly.price : plans.pro.yearly.price}
                      </span>
                      <span>
                        ₹{getDiscountedPrice(billingInterval === 'monthly' ? plans.pro.monthly.price : plans.pro.yearly.price)}
                      </span>
                    </>
                  ) : (
                    <span>
                      ₹{billingInterval === 'monthly' ? plans.pro.monthly.price : plans.pro.yearly.price}
                    </span>
                  )}
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest"> / {billingInterval === 'monthly' ? 'mo' : 'yr'}</span>
                </div>

                {appliedCoupon && (
                  <span className="inline-block text-[9px] font-black uppercase text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded mt-1.5">
                    Saved ₹{(billingInterval === 'monthly' ? plans.pro.monthly.price : plans.pro.yearly.price) - getDiscountedPrice(billingInterval === 'monthly' ? plans.pro.monthly.price : plans.pro.yearly.price)} with {appliedCoupon.code}!
                  </span>
                )}

                {billingInterval === 'yearly' && !appliedCoupon && (
                  <span className="inline-block text-[9px] font-black uppercase bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/25 mt-1 animate-pulse">
                    {plans.pro.yearly.savings}
                  </span>
                )}
              </div>

              <hr className={isDark ? 'border-white/5' : 'border-zinc-200'} />

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-zinc-400">Included Engines:</p>
                <div className="flex flex-wrap gap-1">
                  {plans.pro.models.map(m => (
                    <span key={m} className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                      isDark ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <hr className={isDark ? 'border-white/5' : 'border-zinc-200'} />

              <ul className="space-y-2 text-[11px]">
                {plans.pro.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckout(
                billingInterval === 'monthly' ? plans.pro.monthly.id : plans.pro.yearly.id,
                getDiscountedPrice(billingInterval === 'monthly' ? plans.pro.monthly.price : plans.pro.yearly.price)
              )}
              disabled={isProcessing !== null}
              className={`w-full py-3 mt-6 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden group/btn ${
                isProcessing === (billingInterval === 'monthly' ? plans.pro.monthly.id : plans.pro.yearly.id)
                  ? 'bg-zinc-600 text-white'
                  : 'bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white shadow-lg shadow-sky-500/20'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
              {isProcessing === (billingInterval === 'monthly' ? plans.pro.monthly.id : plans.pro.yearly.id) ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin relative z-10" />
                  <span className="relative z-10">Connecting...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">Get Pro Elite Pass</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legal Consent & Refund warning */}
        <div className={`text-center text-[10px] leading-relaxed mb-4 font-medium px-2 relative z-10 ${
          isDark ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          By proceeding, you agree to our{' '}
          <button 
            type="button"
            onClick={() => { onClose(); onOpenLegal?.('terms'); }} 
            className="text-emerald-400 hover:underline font-bold inline-block cursor-pointer"
          >
            Terms of Service
          </button>{' '}
          and acknowledge the{' '}
          <button 
            type="button"
            onClick={() => { onClose(); onOpenLegal?.('refund'); }} 
            className="text-rose-400 hover:underline font-bold inline-block cursor-pointer"
          >
            Refund Policy (No Refunds once paid)
          </button>.
        </div>

        {/* Secure badge footer */}
        <div className="flex items-center gap-2 justify-center pt-4 mt-4 border-t border-zinc-500/10 text-[10px] opacity-50 relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured by Cashfree Payments India. PCI-DSS Certified.</span>
        </div>
      </div>
    </div>
  );
}
