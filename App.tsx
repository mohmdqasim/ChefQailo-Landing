
import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from './constants.tsx';
import { chatWithChef, analyzeFoodImage } from './geminiService.ts';
import { FeatureCard, PricingPlan, NavItem, Message } from './types.ts';

// --- Intersection Observer Component ---
const RevealOnScroll: React.FC<{ children: React.ReactNode; delay?: string }> = ({ children, delay = "0s" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    const current = domRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

// --- Real-time Graph Components ---

const LiveAreaChart: React.FC = () => {
  const [points, setPoints] = useState<number[]>(Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 20));

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 60) + 20];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const maxValue = 100;
  const height = 160;
  const width = 300;
  const step = width / (points.length - 1);

  const pathData = points.reduce((acc, p, i) => {
    const x = i * step;
    const y = height - (p / maxValue) * height;
    return acc + `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }, "");

  const areaData = pathData + `L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full h-40 relative group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(211, 96, 10, 0.4)" />
            <stop offset="100%" stopColor="rgba(211, 96, 10, 0)" />
          </linearGradient>
        </defs>
        <path d={areaData} fill="url(#gradArea)" className="transition-all duration-1000" />
        <path d={pathData} fill="none" stroke="rgba(211, 96, 10, 1)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
        {points.map((p, i) => (
          <circle key={i} cx={i * step} cy={height - (p / maxValue) * height} r="4" fill="white" stroke="rgba(211, 96, 10, 1)" strokeWidth="2" className="transition-all duration-1000 opacity-0 group-hover:opacity-100" />
        ))}
      </svg>
    </div>
  );
};

const LiveBarChart: React.FC = () => {
  const [bars, setBars] = useState<number[]>(Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 10));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(b => Math.min(100, Math.max(10, b + (Math.random() * 20 - 10)))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end justify-between h-40 w-full px-2">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-2 group/bar">
          <div 
            className="w-8 bg-primary/20 dark:bg-primary/10 rounded-t-xl relative overflow-hidden transition-all duration-1000"
            style={{ height: `${h}%` }}
          >
            <div className="absolute inset-0 bg-primary opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Day {i + 1}</span>
        </div>
      ))}
    </div>
  );
};

// --- FAQ Component (Redesigned) ---

const FAQItem: React.FC<{ question: string, answer: string, index: number }> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`group transition-all duration-500 rounded-[2rem] border overflow-hidden ${
      isOpen 
      ? 'bg-white dark:bg-dark-card border-primary/30 shadow-[0_20px_40px_-15px_rgba(211,96,10,0.1)]' 
      : 'bg-transparent border-gray-100 dark:border-white/5 hover:border-primary/20 hover:bg-white/50 dark:hover:bg-white/5'
    }`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-7 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-6">
          <span className={`text-sm font-display font-bold transition-colors ${isOpen ? 'text-primary' : 'text-gray-300 dark:text-white/20'}`}>
            0{index + 1}
          </span>
          <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
            {question}
          </span>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary text-white rotate-180 shadow-lg shadow-primary/20' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </button>
      <div className={`px-8 transition-all duration-500 ease-in-out ${isOpen ? 'max-h-64 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
        <div className="pl-14">
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- New Sections ---

const WhyChooseQailo: React.FC = () => {
  const comparison = [
    { label: "Meal Planning", without: "Hours of scrolling for recipes", with: "Automated, AI-tailored weekly menus" },
    { label: "Inventory", without: "Buying duplicates you already have", with: "Real-time pantry sync & expiry alerts" },
    { label: "Cooking Guidance", without: "Confusing text instructions", with: "Real-time voice & visual assistance" },
    { label: "Sustainability", without: "High food waste from expired items", with: "Optimized usage & waste reduction" },
    { label: "Nutrition", without: "Manual calorie counting & guesswork", with: "Automatic tracking & expert insights" }
  ];

  return (
    <section id="why-choose" className="py-32 px-6 bg-cream dark:bg-dark-bg/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <RevealOnScroll>
            <h2 className="text-4xl lg:text-6xl font-display font-bold dark:text-white">The <span className="text-primary italic">Evolution</span> of <br />Home Cooking</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mt-6 font-medium">Why settle for traditional when you can have intelligent?</p>
          </RevealOnScroll>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex w-20 h-20 bg-primary rounded-full items-center justify-center text-white font-display font-bold text-2xl shadow-xl z-20 border-8 border-cream dark:border-dark-bg">
            VS
          </div>

          {/* Traditional Side */}
          <RevealOnScroll delay="0.1s">
            <div className="p-10 rounded-[3.5rem] bg-gray-100/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 h-full opacity-80 hover:opacity-100 transition-opacity">
              <h3 className="text-2xl font-display font-bold mb-10 text-gray-400 uppercase tracking-widest text-center">Traditional Kitchen</h3>
              <div className="space-y-8">
                {comparison.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <ICONS.X />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.label}</h4>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 italic">{item.without}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {/* Qailo Side */}
          <RevealOnScroll delay="0.2s">
            <div className="p-10 rounded-[3.5rem] bg-white dark:bg-dark-card border-2 border-primary/20 shadow-[0_40px_100px_-20px_rgba(211,96,10,0.1)] h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-2xl font-display font-bold mb-10 text-primary uppercase tracking-widest text-center">Qailo Powered</h3>
              <div className="space-y-8 relative z-10">
                {comparison.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      <ICONS.Check />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.label}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 font-medium">{item.with}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

const PreferencesSection: React.FC = () => {
  const dietaryItems = [
    { name: "Vegan", icon: "🌱" },
    { name: "Keto", icon: "🥓" },
    { name: "Gluten-Free", icon: "🌾" },
    { name: "Nut-Free", icon: "🚫" },
    { name: "Halal", icon: "🌙" },
    { name: "Low Carb", icon: "🥦" },
    { name: "Dairy-Free", icon: "🥛" },
    { name: "Pescatarian", icon: "🐟" }
  ];

  return (
    <section className="py-32 px-6 bg-white dark:bg-dark-bg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <RevealOnScroll>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest border border-secondary/20">
                Your Health, Your Way
              </div>
              <h2 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                No compromise on <br /><span className="text-secondary italic">Preferences</span>.
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Whether it's an allergy, a religious restriction, or a lifestyle choice, Qailo understands. Our AI adapts every recipe in real-time to fit your unique nutritional blueprint.
              </p>
              <div className="pt-6 grid grid-cols-2 gap-4">
                {dietaryItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-secondary transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay="0.3s">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/20 blur-[100px] rounded-full -z-10 animate-pulse-slow"></div>
              <div className="p-10 rounded-[4rem] bg-gray-900 shadow-2xl border border-gray-800">
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-white pb-6 border-b border-white/10">
                    <h3 className="font-display font-bold text-xl">Dietary Profile</h3>
                    <button className="text-secondary text-sm font-bold">Edit</button>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-white font-medium">Primary Restriction</span>
                      <span className="px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-xs font-bold uppercase">Gluten-Free</span>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="text-white font-medium">Allergies</span>
                      <div className="flex gap-2">
                        <span className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-tight">Peanuts</span>
                        <span className="px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-tight">Shellfish</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-8">
                     <p className="text-white/40 text-xs italic mb-4">"Qailo will automatically filter all 5,000+ recipes to match your profile."</p>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-secondary w-3/4 rounded-full"></div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

const LanguageSupportSection: React.FC = () => {
  const languages = ["English", "Español", "Français", "Deutsch", "日本語", "한국어", "Italiano", "Português", "中文"];
  
  return (
    <section className="py-24 bg-gray-50 dark:bg-dark-bg/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <RevealOnScroll>
          <div className="mb-12">
            <h2 className="text-3xl lg:text-5xl font-display font-bold mb-4 dark:text-white">A Global <span className="text-primary italic">Flavor</span> Palette</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Chef Qailo speaks the world's most popular languages, fluently.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
            {languages.map((lang, i) => (
              <span key={lang} className="px-6 py-3 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 shadow-sm font-bold text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary transition-all duration-300 cursor-default">
                {lang}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

const ReferralSection: React.FC = () => {
  return (
    <section className="py-32 px-6 bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <div className="relative p-12 lg:p-20 rounded-[4rem] bg-gray-900 dark:bg-black overflow-hidden group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                  Referal Program
                </div>
                <h2 className="text-4xl lg:text-6xl font-display font-bold text-white leading-tight">
                  Share the <span className="text-primary italic">Flavor</span>, <br />Earn the Rewards.
                </h2>
                <p className="text-xl text-white/50 leading-relaxed font-medium">
                  Invite your friends to Chef Qailo and get 1 month of Pro membership free for every referral. They get a special welcome gift, too!
                </p>
                <div className="flex gap-4">
                  <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    Invite Friends
                  </button>
                  <button className="bg-white/10 text-white px-8 py-4 rounded-2xl font-bold border border-white/10 hover:bg-white/20 transition-all">
                    How it works
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl mb-4 font-display">1</div>
                  <h4 className="text-white font-bold">Share Link</h4>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center translate-y-8">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl mb-4 font-display">2</div>
                  <h4 className="text-white font-bold">They Join</h4>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl mb-4 font-display">3</div>
                  <h4 className="text-white font-bold">Get Pro</h4>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: "Sync Your Pantry",
      desc: "Connect your digital life. Scan receipts, snap fridge photos, or auto-sync your grocery orders. Qailo creates a living map of your available ingredients.",
      icon: <ICONS.Box />,
      bg: "from-blue-500/10 to-transparent",
      iconColor: "text-blue-500",
      accent: "blue"
    },
    {
      title: "AI Guided Curation",
      desc: "Tell Qailo your mood, cravings, or dietary goals. Our AI engine builds a weekly menu that minimizes waste and maximizes flavor based on what you own.",
      icon: <ICONS.Calendar />,
      bg: "from-primary/10 to-transparent",
      iconColor: "text-primary",
      accent: "primary"
    },
    {
      title: "Master the Flame",
      desc: "Start cooking with hands-free voice guidance. Qailo offers pro tips, adjusts on the fly for missing items, and ensures every plate is a masterpiece.",
      icon: <ICONS.Zap />,
      bg: "from-amber-500/10 to-transparent",
      iconColor: "text-amber-500",
      accent: "amber"
    }
  ];

  return (
    <section id="how-it-works" className="py-40 px-6 bg-white dark:bg-dark-bg relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-3xl mb-32">
          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-8">
              Seamless Workflow
            </div>
            <h2 className="text-5xl lg:text-7xl font-display font-bold text-gray-900 dark:text-white leading-[1.1]">
              The Path to <br />
              <span className="text-primary italic">Kitchen Mastery</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mt-8 font-medium leading-relaxed">
              We've simplified the complex. Three intelligent stages designed to transform your relationship with food from stressful to sublime.
            </p>
          </RevealOnScroll>
        </div>

        <div className="space-y-24">
          {steps.map((step, idx) => (
            <RevealOnScroll key={idx} delay={`${idx * 0.15}s`}>
              <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Visual Side */}
                <div className="w-full lg:w-1/2 relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.bg} rounded-[4rem] blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700`}></div>
                  <div className="relative aspect-[16/10] bg-white dark:bg-dark-card rounded-[3.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex items-center justify-center p-12 transition-transform duration-700 group-hover:scale-[1.02]">
                    <div className={`text-[12rem] lg:text-[18rem] font-display font-black text-gray-50 dark:text-white/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none`}>
                      0{idx + 1}
                    </div>
                    <div className={`w-32 h-32 lg:w-48 lg:h-48 rounded-[3rem] bg-white dark:bg-dark-bg shadow-xl flex items-center justify-center ${step.iconColor} relative z-10 transition-all duration-700 group-hover:rotate-[15deg] group-hover:shadow-primary/20`}>
                      <div className="scale-[2.5] lg:scale-[3.5]">{step.icon}</div>
                    </div>
                    
                    {/* Floating Accent Shapes */}
                    <div className={`absolute top-12 left-12 w-6 h-6 rounded-full bg-${step.accent}-500 opacity-20 animate-pulse`}></div>
                    <div className={`absolute bottom-12 right-12 w-10 h-10 rounded-xl border-4 border-${step.accent}-500 opacity-10 rotate-12`}></div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 space-y-8">
                   <div className="flex items-center gap-4">
                     <span className="w-12 h-0.5 bg-primary/30"></span>
                     <span className="text-primary font-display font-bold tracking-widest uppercase text-sm">Stage {idx + 1}</span>
                   </div>
                   <h3 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                     {step.title}
                   </h3>
                   <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
                     {step.desc}
                   </p>
                   <div className="pt-4">
                     <button className="flex items-center gap-3 text-gray-900 dark:text-white font-bold group-hover:text-primary transition-colors">
                       <span className="text-sm border-b-2 border-primary/20 group-hover:border-primary transition-all pb-1">Learn about this stage</span>
                       <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                     </button>
                   </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

const WeeklyMenuPreview: React.FC = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const meals = [
    { title: "Miso Glazed Salmon", time: "25 min", cal: "450", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400" },
    { title: "Quinoa Buddha Bowl", time: "15 min", cal: "380", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
    { title: "Lemon Garlic Chicken", time: "30 min", cal: "520", img: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=400" },
    { title: "Truffle Pasta", time: "20 min", cal: "610", img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=400" },
    { title: "Mediterranean Salad", time: "10 min", cal: "310", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400" },
    { title: "Seafood Paella", time: "45 min", cal: "580", img: "https://images.unsplash.com/photo-1534080564607-c9295478493b?auto=format&fit=crop&q=80&w=400" },
    { title: "Green Pesto Pasta", time: "15 min", cal: "420", img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=400" }
  ];

  return (
    <section id="menu" className="py-32 px-6 bg-gray-50 dark:bg-dark-bg/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <RevealOnScroll>
            <h2 className="text-4xl lg:text-5xl font-display font-bold dark:text-white">Your Weekly <br /><span className="text-primary italic">Inspiration</span></h2>
          </RevealOnScroll>
          <RevealOnScroll delay="0.2s">
            <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
              Explore 5,000+ Recipes <ICONS.Send />
            </button>
          </RevealOnScroll>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6">
          {meals.map((meal, i) => (
            <div key={i} className="flex-shrink-0 w-72 group">
              <RevealOnScroll delay={`${i * 0.1}s`}>
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl">
                  <img src={meal.img} alt={meal.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                    {days[i]}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h4 className="font-bold text-lg mb-2">{meal.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] font-medium opacity-80 uppercase tracking-tighter">
                      <span className="flex items-center gap-1"><ICONS.Clock /> {meal.time}</span>
                      <span className="flex items-center gap-1"><ICONS.Zap /> {meal.cal} cal</span>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Futuristic Modal Component ---

const FuturisticModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-500"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(211,96,10,0.3)] border border-primary/20 overflow-hidden animate-scale-in">
        {/* Futuristic Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 p-12 text-center space-y-8">
        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-primary/20 animate-float overflow-hidden p-4">
          <img src="/logo.png" alt="Chef Qailo Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white leading-tight">
              Coming <span className="text-primary italic">Soon</span>
            </h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              We’re currently building something great. The application will be available soon.
            </p>
          </div>
          
          <div className="pt-4">
            <button 
              onClick={onClose}
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Got it, thanks!
            </button>
          </div>
          
          <div className="flex justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse delay-150"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse delay-300"></div>
          </div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary transition-colors"
        >
          <ICONS.X />
        </button>
      </div>
    </div>
  );
};

// --- Main Components ---

const Navbar: React.FC<{ isDark: boolean; toggleDark: () => void; onGetApp: () => void }> = ({ isDark, toggleDark, onGetApp }) => {
  const navItems: NavItem[] = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Inventory', href: '#inventory' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl glass rounded-[2rem] px-8 py-4 shadow-xl border border-white/20 dark:border-white/5 animate-fade-in flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <img src="/logo.png" alt="Chef Qailo Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
      </div>

      <div className="hidden md:flex items-center gap-10">
        {navItems.map((item) => (
          <a 
            key={item.label} 
            href={item.href} 
            className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full tracking-tight"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDark}
          className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>

        <button 
          onClick={onGetApp}
          className="bg-primary text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-opacity-95 transition-all shadow-lg shadow-primary/30 active:scale-95"
        >
          Get App
        </button>
      </div>
    </nav>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="relative pt-52 pb-24 px-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 dark:bg-primary/10 -skew-x-12 translate-x-1/4 -z-10"></div>
      <div className="absolute top-1/4 left-10 w-4 h-4 rounded-full bg-primary/20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-20 w-8 h-8 rounded-full bg-primary/10 animate-float"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 shadow-sm text-primary text-xs font-bold uppercase tracking-widest">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Meet Your New Kitchen Companion
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-8xl font-display font-bold text-gray-900 dark:text-white leading-[1] tracking-tight">
              Your Personal <br />
              <span className="text-primary italic relative">
                AI Chef.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                </svg>
              </span>
            </h1>
            <p className="text-2xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
              Plan meals, cook smarter, and eat better with <span className="text-primary font-bold">Chef Qailo</span> — the intelligence your kitchen was missing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <button className="bg-primary text-white px-10 py-5 rounded-2xl text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-primary/40 active:scale-95 flex items-center justify-center gap-2">
              Get Started Free
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            <button className="bg-white dark:bg-dark-card text-gray-900 dark:text-white border-2 border-gray-100 dark:border-white/5 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
              </div>
              How It Works
            </button>
          </div>
        </div>

        <div className="relative lg:h-[700px] flex items-center justify-center animate-scale-in">
          <div className="relative z-10 w-[320px] h-[650px] bg-gray-900 rounded-[3.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-gray-800 animate-float">
            <div className="w-full h-full bg-white dark:bg-dark-bg rounded-[2.8rem] overflow-hidden relative flex flex-col">
              <div className="h-10 flex items-center justify-between px-8 pt-2">
                <span className="text-[10px] font-bold dark:text-white/50">9:41</span>
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-black/10 dark:bg-white/10"></div>
                   <div className="w-3 h-3 rounded-full bg-black/10 dark:bg-white/10"></div>
                </div>
              </div>
              
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Chef Qailo Logo" className="h-6 w-auto object-contain" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div className="px-6 space-y-4 flex-1">
                <div className="relative rounded-3xl overflow-hidden aspect-square bg-gray-900 border-4 border-primary/20 shadow-lg">
                  <img 
                    src="/logo.png" 
                    className="w-full h-full object-contain p-8"
                    alt="Chef Qailo"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-sm">Chef Qailo</p>
                    <p className="text-white/60 text-[10px]">AI Personal Assistant</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-primary/10 dark:bg-primary/20 space-y-2">
                    <h4 className="font-bold text-xs text-primary">Chef's Recommendation</h4>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">
                      "I noticed you have fresh basil and tomatoes. Shall we make a 15-minute Margherita pasta today?"
                    </p>
                </div>
              </div>
            </div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-full z-20"></div>
          </div>
          <div className="absolute inset-0 bg-primary/10 blur-[120px] -z-10 scale-150 animate-pulse-slow"></div>
        </div>
      </div>
    </section>
  );
};

const ElegantFeaturedCard: React.FC<FeatureCard & { index: number }> = ({ title, description, icon, index }) => (
  <div className={`group relative p-10 rounded-[3rem] bg-white dark:bg-dark-card transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(211,96,10,0.15)] border border-gray-50 dark:border-white/5 overflow-hidden ${index === 1 ? 'lg:translate-y-12' : ''}`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
    <div className="absolute bottom-0 left-0 w-16 h-16 border-2 border-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
    
    <div className="relative z-10">
      <div className="w-20 h-20 mb-10 rounded-[2rem] bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-[10deg] shadow-inner">
        <div className="scale-125">{icon}</div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const ChefChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Chef Qailo. What are we cooking today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await chatWithChef(userMsg);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="w-full bg-white dark:bg-dark-card rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-50 dark:border-white/5 group hover:shadow-primary/5 transition-shadow">
      <div className="bg-primary p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden p-2 border-2 border-white/20 flex items-center justify-center">
             <img src="/logo.png" alt="Chef Avatar" className="w-full h-full object-contain" />
          </div>
          <div>
            <h4 className="font-bold text-base">Chef Qailo</h4>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-white/70 font-medium">Available for advice</p>
            </div>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="h-[400px] overflow-y-auto p-8 space-y-6 bg-cream/30 dark:bg-dark-bg/30 scroll-smooth">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm transition-all hover:scale-[1.01] ${
              m.role === 'user' 
              ? 'bg-primary text-white rounded-br-none shadow-primary/20' 
              : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-white/10'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white dark:bg-dark-card px-5 py-4 rounded-2xl rounded-bl-none border border-gray-100 dark:border-white/10">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-primary/20 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-dark-card border-t border-gray-50 dark:border-white/5">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What's for dinner tonight?" 
              className="w-full bg-gray-50 dark:bg-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm transition-all focus:bg-white dark:focus:bg-white/10 border border-transparent focus:border-primary/20 dark:text-white"
            />
          </div>
          <button onClick={handleSend} className="bg-primary text-white p-4 rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20">
            <ICONS.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

const InventorySection: React.FC = () => {
  return (
    <section id="inventory" className="py-32 px-6 bg-gray-50 dark:bg-dark-bg/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <div className="space-y-10">
            <RevealOnScroll>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                Pantry Intelligence
              </div>
              <h2 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-[1.1] mt-6">
                Your Kitchen, <br />
                <span className="text-primary italic">Fully Synced</span>.
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium mt-6">
                Never buy duplicate ingredients again. Chef Qailo tracks your inventory in real-time and auto-generates shopping lists before you even know you're out.
              </p>
            </RevealOnScroll>

            <div className="space-y-6">
              {[
                { title: "Smart Expiry Alerts", desc: "Get notified before ingredients go bad to minimize food waste.", icon: <ICONS.Box /> },
                { title: "One-Tap Shopping List", desc: "Missing a recipe ingredient? Add it to your list with a single click.", icon: <ICONS.Check /> }
              ].map((item, i) => (
                <RevealOnScroll key={i} delay={`${0.2 + (i * 0.1)}s`}>
                  <div className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="relative">
            <RevealOnScroll delay="0.3s">
              <div className="bg-white dark:bg-dark-card rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50 dark:border-white/5 overflow-hidden relative group">
                <div className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-xl dark:text-white">My Pantry</h3>
                    <div className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">24 Items</div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { name: "Organic Spinach", qty: "200g", status: "Expires in 2 days", color: "text-primary", bg: "bg-primary/5" },
                      { name: "Greek Yogurt", qty: "500ml", status: "Fresh", color: "text-green-500", bg: "bg-green-50/50 dark:bg-green-500/5" },
                      { name: "Whole Wheat Pasta", qty: "1kg", status: "Low Stock", color: "text-amber-500", bg: "bg-amber-50/50 dark:bg-amber-500/5" }
                    ].map((item, i) => (
                      <div key={item.name} className={`p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 flex items-center justify-between hover:scale-[1.02] transition-transform duration-500 cursor-default ${item.bg}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-card shadow-sm flex items-center justify-center border border-gray-100 dark:border-white/10">
                             <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10"></div>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{item.qty}</p>
                          </div>
                        </div>
                        <div className={`text-[10px] font-bold ${item.color} uppercase tracking-tighter`}>{item.status}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-900 dark:bg-black rounded-[2rem] p-6 text-white relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/50 mb-1">Upcoming Shopping</p>
                        <h4 className="font-bold text-lg leading-tight">12 Missing <br /> Ingredients</h4>
                      </div>
                      <button className="bg-primary text-white p-3 rounded-xl hover:rotate-6 transition-transform shadow-lg shadow-primary/20">
                        <ICONS.Send />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </div>
    </section>
  );
};

const SocialSection: React.FC = () => {
  return (
    <section id="social" className="py-32 px-6 bg-white dark:bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-bold text-gray-50 dark:text-white/[0.02] select-none -z-10 tracking-tighter opacity-50">
        COMMUNITY
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          <div className="relative order-2 lg:order-1">
            <RevealOnScroll delay="0.2s">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative group rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cooking" />
                  </div>
                  <div className="relative group rounded-3xl overflow-hidden aspect-square shadow-xl">
                    <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Dish" />
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                   <div className="relative group rounded-3xl overflow-hidden aspect-square shadow-xl">
                    <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Salad" />
                  </div>
                  <div className="relative group rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Family" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <div className="space-y-10 order-1 lg:order-2">
            <RevealOnScroll>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                Connected Cooking
              </div>
              <h2 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-[1.1] mt-6">
                A Kitchen Without <br />
                <span className="text-primary italic">Boundaries</span>.
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium mt-6">
                Food tastes better when shared. Chef Qailo connects you with a global community of home chefs, enabling collaborative planning and real-time inspiration.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

const MeetChefSection: React.FC = () => {
  return (
    <section id="ai-chef" className="py-32 px-6 bg-cream dark:bg-dark-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 order-2 lg:order-1">
            <RevealOnScroll>
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-tight mb-2">
                Your Digital Sous-Chef
              </div>
              <h2 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-[1.1]">
                Say Hello to <span className="text-primary italic">Chef Qailo</span>
              </h2>
            </RevealOnScroll>

            <div className="space-y-6 pt-4">
              {[
                { label: "Voice Interactions", desc: "Hands-free cooking with real-time audio guidance." },
                { label: "Taste Memory", desc: "Qailo remembers your feedback to perfect future recipes." },
                { label: "Smart Adjustments", desc: "Missing an ingredient? Qailo suggests the perfect sub." }
              ].map((item, i) => (
                <RevealOnScroll key={i} delay={`${0.2 + (i * 0.1)}s`}>
                  <div className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ICONS.Check />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{item.label}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <RevealOnScroll delay="0.2s">
               <div className="relative">
                 <div className="relative z-10 flex flex-col gap-8">
                    <ChefChat />
                 </div>
               </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

const ChefFeedback: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setAnalysis(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await analyzeFoodImage(base64);
      setAnalysis(res);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-white space-y-6">
          <RevealOnScroll>
            <h2 className="text-4xl lg:text-5xl font-display font-bold">Chef's Visual Feedback</h2>
            <p className="text-xl text-white/80 leading-relaxed mt-4">
              Not sure if your steak is medium-rare? Snap a photo and let Chef Qailo analyze your cooking.
            </p>
          </RevealOnScroll>
          <div className="flex gap-4">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <RevealOnScroll delay="0.4s">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 hover:scale-105 transition-all active:scale-95 shadow-lg"
              >
                <ICONS.Camera />
                {loading ? 'Analyzing...' : 'Scan Your Meal'}
              </button>
            </RevealOnScroll>
          </div>
        </div>
        <RevealOnScroll delay="0.4s">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 min-h-[300px] flex flex-col items-center justify-center group hover:bg-white/10 transition-colors">
            {loading ? (
              <div className="text-white text-center">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              </div>
            ) : analysis ? (
              <div className="text-white animate-scale-in p-6">
                <p className="text-lg leading-relaxed italic">"{analysis}"</p>
              </div>
            ) : (
              <div className="text-white/60 text-center animate-fade-in">
                <ICONS.Camera />
                <p className="mt-4 text-sm">Upload a photo to get AI feedback</p>
              </div>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

const KitchenInsights: React.FC = () => {
  return (
    <section id="insights" className="py-32 px-6 bg-white dark:bg-dark-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <RevealOnScroll>
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-6">
              Analytics & Data
            </div>
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-[1.1]">
              Insights for a <span className="text-primary italic">Smarter Life</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mt-6 font-medium leading-relaxed">
              Chef Qailo doesn't just help you cook; it helps you understand your habits. Track nutrition, optimize your budget, and reduce waste with real-time analytics.
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Nutrition Graph */}
          <RevealOnScroll delay="0.1s">
            <div className="p-10 rounded-[3rem] bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all duration-500 group h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display font-bold text-xl dark:text-white">Nutrition Flow</h3>
                  <p className="text-xs text-gray-400 font-medium">Weekly protein intake (g)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                </div>
              </div>
              <LiveAreaChart />
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Avg/Day</p>
                  <p className="text-lg font-display font-bold text-primary">68g</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target</p>
                  <p className="text-lg font-display font-bold dark:text-white">75g</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Goal</p>
                  <p className="text-lg font-display font-bold text-green-500">91%</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Waste Reduction Graph */}
          <RevealOnScroll delay="0.2s">
            <div className="p-10 rounded-[3rem] bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-white/5 hover:shadow-2xl transition-all duration-500 group h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display font-bold text-xl dark:text-white">Waste Reduction</h3>
                  <p className="text-xs text-gray-400 font-medium">Items saved from expiry</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <ICONS.Box />
                </div>
              </div>
              <LiveBarChart />
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-bg/50 rounded-2xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs font-bold dark:text-gray-200">Live Prediction</span>
                  </div>
                  <span className="text-xs font-bold text-primary">-14% Waste next week</span>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Budget Insight */}
          <RevealOnScroll delay="0.3s">
            <div className="p-10 rounded-[3rem] bg-gray-900 dark:bg-black border border-gray-800 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(211,96,10,0.3)] group h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8 text-white">
                  <div>
                    <h3 className="font-display font-bold text-xl">Wallet Health</h3>
                    <p className="text-xs text-white/40 font-medium">Spend optimization</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-primary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                   <div className="text-center mb-8">
                     <p className="text-4xl font-display font-bold text-white mb-2">$128.50</p>
                     <p className="text-xs font-bold text-primary uppercase tracking-widest">Estimated monthly savings</p>
                   </div>
                   
                   <div className="space-y-4">
                     {[
                       { label: 'Bulk Optimization', val: '+12%', color: 'text-green-400' },
                       { label: 'Smart Substitution', val: '+8%', color: 'text-green-400' },
                       { label: 'Seasonality Factor', val: '+15%', color: 'text-green-400' }
                     ].map(item => (
                       <div key={item.label} className="flex items-center justify-between text-xs font-bold">
                         <span className="text-white/60">{item.label}</span>
                         <span className={item.color}>{item.val}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <button className="mt-10 w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-opacity-90 transition-all">
                  View Full Budget Report
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

const FAQSection: React.FC = () => {
  const faqs = [
    { question: "How does the AI know what's in my fridge?", answer: "You can sync your pantry by scanning grocery receipts, snapping a photo of your fridge, or manually adding items. Our AI vision technology recognizes thousands of ingredients and tracks their shelf life automatically." },
    { question: "Can Qailo handle specific dietary restrictions?", answer: "Absolutely. Whether you're Vegan, Keto, Gluten-Free, or have specific allergies, Qailo learns your profile and only suggests recipes that are safe and delicious for you, adapting ingredients on the fly." },
    { question: "Is my personal data secure?", answer: "We take privacy seriously. Your data is encrypted and used solely to personalize your culinary experience. We never sell your personal information, and all cloud processing is bank-grade secure." },
    { question: "Does it work with smart kitchen appliances?", answer: "Yes! Chef Qailo integrates with most major smart appliance brands (Samsung, LG, Whirlpool) to preheat ovens or monitor cooking times automatically via Wi-Fi sync." }
  ];

  return (
    <section id="faq" className="py-40 px-6 bg-white dark:bg-dark-bg relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr,1.5fr] gap-20">
          <RevealOnScroll>
            <div className="lg:sticky lg:top-32 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                Help Center
              </div>
              <h2 className="text-5xl lg:text-7xl font-display font-bold text-gray-900 dark:text-white leading-[1.1]">
                Common <br />
                <span className="text-primary italic">Questions</span>
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Everything you need to know about the future of your kitchen. Can't find the answer? <span className="text-primary cursor-pointer hover:underline">Contact our support.</span>
              </p>
              
              <div className="hidden lg:block pt-12">
                <div className="w-20 h-20 rounded-[2rem] bg-cream dark:bg-dark-card border border-gray-100 dark:border-white/5 flex items-center justify-center text-primary rotate-[-10deg]">
                  <ICONS.ChefHat />
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <RevealOnScroll key={i} delay={`${i * 0.1}s`}>
                <FAQItem index={i} question={faq.question} answer={faq.answer} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing: React.FC = () => {
  const plans: PricingPlan[] = [
    { name: 'Casual', price: '$0', features: ['AI Chat Advice', '15 Saved Recipes', 'Basic Inventory Sync', 'Standard AI Response'] },
    { name: 'Enthusiast', price: '$12', features: ['Unlimited Recipes', 'Full Pantry Map', 'Ad-Free Experience', 'Personalized Macros', 'Recipe Scaling'] },
    { name: 'Master', price: '$24', features: ['Real-time Voice Guidance', '10 Food Photo Analyses/mo', 'Family Kitchen Sync', 'Smart Home Integration', 'Priority AI Engine'], isPopular: true },
    { name: 'Professional', price: '$59', features: ['Unlimited Visual Analysis', 'Bespoke Sommelier AI', 'Direct Masterclass Stream', 'Custom Nutrition Reports', 'Pro-level Tool Integration'] },
  ];

  return (
    <section id="pricing" className="py-40 px-6 bg-cream dark:bg-dark-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-primary/5 rounded-full blur-[150px] -rotate-12 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-8">
              Membership
            </div>
            <h2 className="text-5xl lg:text-7xl font-display font-bold text-gray-900 dark:text-white leading-[1.1]">
              Elevate Your <br />
              <span className="text-primary italic">Kitchen Journey</span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mt-8 font-medium leading-relaxed">
              Unlock the full potential of your kitchen with tiered intelligence tailored to your culinary ambition.
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <RevealOnScroll key={plan.name} delay={`${idx * 0.1}s`}>
              <div className={`group h-full relative p-12 rounded-[4rem] transition-all duration-700 flex flex-col ${
                plan.isPopular 
                ? 'bg-white dark:bg-dark-card border-2 border-primary shadow-[0_40px_100px_-20px_rgba(211,96,10,0.15)] scale-[1.05] z-10' 
                : 'bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-dark-card hover:scale-[1.02] hover:shadow-2xl'
              }`}>
                
                {plan.isPopular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-8 py-2.5 rounded-full shadow-lg flex items-center gap-2 group-hover:scale-110 transition-transform">
                    <ICONS.Zap /> Chef's Recommendation
                  </div>
                )}

                <div className="mb-12">
                  <h4 className={`text-sm font-display font-bold uppercase tracking-[0.2em] mb-6 transition-colors duration-500 ${plan.isPopular ? 'text-primary' : 'text-gray-400 dark:text-white/20'}`}>
                    {plan.name}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-display font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-400 dark:text-white/30 font-medium text-sm">/mo</span>
                  </div>
                </div>

                <div className="space-y-6 mb-16 flex-1">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-300 font-medium group-hover:translate-x-2 transition-transform duration-500">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${plan.isPopular ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                        <ICONS.Check />
                      </div>
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-6 rounded-[2.5rem] font-bold transition-all duration-500 active:scale-95 text-base flex items-center justify-center gap-2 group/btn ${
                  plan.isPopular 
                  ? 'bg-primary text-white hover:bg-opacity-95 shadow-xl shadow-primary/30' 
                  : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.05]'
                }`}>
                  Select {plan.name}
                  <svg className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-gray-900 dark:bg-black text-white pt-20 pb-10 px-6">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
      <RevealOnScroll>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Chef Qailo Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Making premium kitchen expertise accessible to everyone through AI.
          </p>
        </div>
      </RevealOnScroll>
    </div>
    <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
      <p>© 2024 Chef Qailo Inc.</p>
    </div>
  </footer>
);

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary selection:text-white font-sans overflow-x-hidden transition-colors duration-300">
      <Navbar isDark={isDark} toggleDark={toggleDark} onGetApp={() => setIsModalOpen(true)} />
      
      <main>
        <Hero />

        <section id="features" className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-dot-pattern pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative">
            <div className="max-w-3xl mb-24">
              <RevealOnScroll>
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-tight mb-6">
                  Superior Functionality
                </div>
                <h2 className="text-4xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white leading-[1.1] mb-8">
                  Elevate Your <span className="text-primary italic">Home Cooking</span> Experience
                </h2>
                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  We've combined culinary expertise with AI to provide a companion that knows your kitchen.
                </p>
              </RevealOnScroll>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 pb-12">
              <RevealOnScroll delay="0.1s">
                <ElegantFeaturedCard index={0} title="AI Chef Guru" description="Real-time cooking guidance powered by Gemini." icon={<ICONS.ChefHat />} />
              </RevealOnScroll>
              <RevealOnScroll delay="0.2s">
                <ElegantFeaturedCard index={1} title="Smart Planning" description="Automated meal schedules based on your cravings." icon={<ICONS.Calendar />} />
              </RevealOnScroll>
              <RevealOnScroll delay="0.3s">
                <ElegantFeaturedCard index={2} title="Zero Waste" description="Smart inventory tracking that learns your habits." icon={<ICONS.Box />} />
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <WhyChooseQailo />

        <PreferencesSection />

        <HowItWorks />

        <MeetChefSection />

        <WeeklyMenuPreview />

        <ChefFeedback />

        <InventorySection />

        <KitchenInsights />

        <LanguageSupportSection />

        <SocialSection />

        <FAQSection />

        <Pricing />

        <ReferralSection />

        <section className="py-32 px-6 text-center max-w-4xl mx-auto space-y-8">
           <RevealOnScroll>
             <h2 className="text-4xl lg:text-6xl font-display font-bold dark:text-white">Ready to Cook Smarter?</h2>
             <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Join thousands of home chefs today.</p>
           </RevealOnScroll>
           <RevealOnScroll delay="0.3s">
             <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="bg-primary text-white px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
               >
                 Download on App Store
               </button>
             </div>
           </RevealOnScroll>
        </section>
      </main>

      <Footer />
      <FuturisticModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
