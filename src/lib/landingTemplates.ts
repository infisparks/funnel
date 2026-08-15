export interface LandingTemplate {
  id: string;
  name: string;
  category: 'Consulting' | 'SaaS' | 'Coaching' | 'Real Estate' | 'Healthcare' | 'E-Commerce';
  badge: string;
  accentColor: string;
  description: string;
  triggerButtons: string[];
  features: string[];
  html: string;
}

export const LANDING_PAGE_TEMPLATES: LandingTemplate[] = [
  {
    id: 'selflance-growth-engine',
    name: 'Selflance – Digital Growth Engine & Tech Agency',
    category: 'Consulting',
    badge: 'Featured • Agency Scale',
    accentColor: '#DF7626',
    description: 'High-converting digital growth engine template engineered for tech consulting agencies, software partners, and automation systems.',
    triggerButtons: [
      'Book Your Business Technology Strategy Session',
      'Book My Strategy Session',
      'Claim Your 1-on-1 Growth Consultation',
      'WhatsApp Us',
    ],
    features: [
      'Animated Growth Metric Tickers',
      'Client Satisfaction Trust Badges',
      'Mobile First Hero & Fast Slot Picker',
      'High-Ticket Enterprise Positioning',
    ],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Selflance – Digital Growth Engine for Scaling Businesses</title>
    <meta name="description" content="Selflance builds Technology, Automation & Strategy systems to transform manual hustle into scalable growth engines. Book your free strategy session today.">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Poppins', 'sans-serif'] },
                    colors: {
                        brand: {
                            blue:        '#1c4a8f',
                            orange:      '#df7626',
                            lightOrange: '#fbeedb',
                            cardBg:      '#fcf7ef',
                            appBg:       '#f6f9fc',
                            darkText:    '#1a1d20',
                            mutedText:   '#64748b'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        html, body {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
            position: relative;
        }
        html { scroll-behavior: smooth; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes float {
            0%   { transform: translateY(0px)   scale(1);    opacity: 0.3; }
            50%  { transform: translateY(-20px) scale(1.05); opacity: 0.5; }
            100% { transform: translateY(0px)   scale(1);    opacity: 0.3; }
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes ticker {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        .mesh-glow    { animation: float 8s ease-in-out infinite; }
        .ticker-track { display: flex; gap: 8px; animation: ticker 18s linear infinite; width: max-content; }
        .ticker-track:hover { animation-play-state: paused; }
    </style>
</head>
<body class="font-sans text-white bg-[#0B1121] antialiased selection:bg-brand-orange selection:text-white relative overflow-x-hidden w-full max-w-full">

    <!-- FIXED HEADER -->
    <div class="fixed top-0 inset-x-0 z-50 flex justify-center">
        <header class="w-full flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 bg-[#0B1121]/90 backdrop-blur-md border-b border-gray-800/50 max-w-5xl mx-auto">
            <div class="text-[20px] sm:text-2xl font-extrabold text-white tracking-tight cursor-pointer">
                Selflance<span class="text-brand-orange">.</span>
            </div>
        </header>
    </div>

    <!-- MAIN HERO -->
    <main class="w-full max-w-5xl mx-auto min-h-screen pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-12 relative px-4 sm:px-6 z-10 flex flex-col justify-start items-center text-center gap-y-2 sm:gap-y-3 overflow-hidden">

        <!-- Ambient glows -->
        <div class="absolute top-[20%] left-1/2 -translate-x-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-blue-900/20 blur-[90px] rounded-full pointer-events-none -z-10"></div>
        <div class="absolute top-[45%] left-1/2 -translate-x-1/2 w-[220px] h-[220px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -z-10 mesh-glow"></div>

        <!-- UPPER CONTENT -->
        <div class="flex flex-col items-center w-full gap-y-2 sm:gap-y-3 pt-1.5 sm:pt-2">

            <!-- TOP BADGES ROW -->
            <div class="flex items-center justify-center flex-wrap gap-2">
                <div class="inline-flex items-center gap-2 bg-[#121A2F]/80 backdrop-blur-sm border border-[#2A3552] rounded-full px-3 py-1 sm:px-4 sm:py-1.5 shadow-sm">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                    </span>
                    <span class="text-[10px] sm:text-[11px] font-bold text-gray-300 tracking-widest uppercase">Top-Rated Agency</span>
                </div>

                <div class="group relative inline-flex items-center gap-1.5 bg-[#121A2F]/90 backdrop-blur-md border border-[#2A3552] hover:border-[#6366F1]/80 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 transition-all duration-300 shadow-md overflow-hidden cursor-pointer">
                    <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <svg class="w-3.5 h-3.5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    <span class="text-[10px] sm:text-[11px] font-bold text-gray-200 group-hover:text-white transition-colors">Client Satisfaction</span>
                    <svg class="w-3.5 h-3.5 text-yellow-400 fill-current transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span class="bg-[#1E293B] border border-gray-700/60 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-yellow-400 tracking-tight">4.9/5</span>
                </div>
            </div>

            <!-- HEADLINE -->
            <h1 id="hero-headline" class="text-[22.5px] sm:text-4xl md:text-[50px] font-extrabold leading-[1.2] tracking-tight text-white drop-shadow-lg px-1 w-full max-w-[345px] md:max-w-4xl mx-auto">
                Your Business Needs More Than a Website. It Needs a
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A855F7]"> Digital Growth Engine</span>
                That Helps You
                <span class="text-brand-orange relative inline-block">Scale.
                    <svg class="absolute -bottom-1 sm:-bottom-2 left-0 w-full text-brand-orange h-[6px] sm:h-3" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none">
                        <path d="M0,15 Q50,25 100,5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                </span>
            </h1>

            <!-- SUB-HEADLINE -->
            <p id="hero-subheadline" class="text-[#94A3B8] text-[12px] sm:text-[13.5px] md:text-base leading-snug sm:leading-relaxed max-w-[335px] sm:max-w-2xl mx-auto font-medium px-1">
                Business scale karne ke liye manual hustle nahi, smart systems chahiye. Hum <strong class="text-gray-200">Technology, Automation & Strategy</strong> ke through high-performing growth engines build karte hain.
            </p>

            <!-- LIVE RESULTS TICKER -->
            <div class="w-full overflow-hidden relative" style="mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent);-webkit-mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent);">
                <div class="ticker-track" id="ticker-track">
                    <div class="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                        <span class="text-green-400 text-[10px] sm:text-xs font-bold">&#8593; 3.2x</span>
                        <span class="text-gray-400 text-[9px] sm:text-[11px]">Revenue Growth</span>
                    </div>
                    <div class="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                        <span class="text-[#6366F1] text-[10px] sm:text-xs font-bold">50+</span>
                        <span class="text-gray-400 text-[9px] sm:text-[11px]">Businesses Scaled</span>
                    </div>
                    <div class="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                        <span id="ticker-revenue-val" class="text-brand-orange text-[10px] sm:text-xs font-bold">&#8377;40Cr+</span>
                        <span id="ticker-revenue-lbl" class="text-gray-400 text-[9px] sm:text-[11px]">Revenue Generated</span>
                    </div>
                    <div class="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                        <span class="text-yellow-400 text-[10px] sm:text-xs font-bold">&#9733; 4.9/5</span>
                        <span class="text-gray-400 text-[9px] sm:text-[11px]">Client Rating</span>
                    </div>
                </div>
            </div>

            <!-- FEATURE PILLS -->
            <div class="flex flex-row flex-wrap justify-center gap-1.5 sm:gap-3 w-full max-w-[330px] md:max-w-xl mx-auto">
                <div class="border border-[#2A3552]/80 bg-[#0F1629]/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5">
                    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span class="text-[10px] sm:text-[11px] text-gray-300 font-semibold">Fast Delivery</span>
                </div>
                <div class="border border-[#2A3552]/80 bg-[#0F1629]/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5">
                    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    <span class="text-[10px] sm:text-[11px] text-gray-300 font-semibold">Secure & Scalable</span>
                </div>
                <div class="border border-[#2A3552]/80 bg-[#0F1629]/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5">
                    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    <span class="text-[10px] sm:text-[11px] text-gray-300 font-semibold">Future-Ready</span>
                </div>
            </div>

            <!-- CTA BUTTON -->
            <button id="book-session-btn"
                    class="group relative w-full max-w-[92%] sm:max-w-md mx-auto bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[13px] sm:text-[15px] flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_8px_20px_-5px_rgba(109,40,217,0.5)] border-t border-white/20 border-b-[3px] border-b-[#4c1d95] active:border-b-0 active:translate-y-0 overflow-hidden px-3 mt-4">
                <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span class="text-base drop-shadow-md">&#128197;</span>
                <span class="relative z-10 drop-shadow-sm tracking-wide text-center leading-tight">Book Your Business Technology Strategy Session</span>
            </button>

            <!-- TRUST FOOTER -->
            <div class="flex flex-row justify-between items-center w-full max-w-[96%] sm:max-w-4xl mx-auto pt-4 border-t border-gray-800/80 mt-2">
                <div class="flex items-center gap-2">
                    <span class="text-yellow-400 text-sm">★★★★★</span>
                    <span class="text-xs text-gray-400 font-semibold">50+ Happy Businesses</span>
                </div>
                <div class="text-xs text-gray-400 font-bold">
                    ISO27001 • GDPR • PCI DSS
                </div>
            </div>

        </div>
    </main>

    <footer class="w-full border-t border-gray-800/80 bg-[#070B16] py-8 px-4 text-center">
        <div class="text-xl font-extrabold text-white tracking-tight mb-1">
            Selflance<span class="text-brand-orange">.</span>
        </div>
        <p class="text-[#818CF8] text-xs font-semibold">
            We Engineer Technology That Helps Businesses Scale Faster.
        </p>
    </footer>
</body>
</html>\`,
  },
  {
    id: 'consulting-growth-agency',
    name: 'Executive B2B Growth & Consulting Agency',
    category: 'Consulting',
    badge: 'Popular • High Converting',
    accentColor: '#6366F1',
    description: 'Designed for consulting firms, digital agencies, and B2B service providers looking to book high-ticket strategy calls.',
    triggerButtons: ['Get Started Free →', 'Claim Your 1-on-1 Growth Consultation', 'CONTINUE TO SELECT SLOT', 'Access Funnel Workspace →'],
    features: ['30-Sec Fast Booking', 'Social Proof Grid', 'Pain-to-Outcome Roadmap', 'Trust Badges'],
    html: \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B2B Growth & Revenue Consultation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #F8FAFC; color: #0F172A; line-height: 1.6; }
    .container { max-width: 1150px; margin: 0 auto; padding: 40px 20px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: #EEF2FF; color: #4F46E5; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 24px; border: 1px solid #E0E7FF; }
    .hero { text-align: center; padding: 50px 20px 70px 20px; }
    h1 { font-size: 52px; font-weight: 800; color: #0F172A; line-height: 1.15; margin-bottom: 24px; letter-spacing: -0.02em; }
    h1 span { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { font-size: 19px; color: #475569; max-width: 720px; margin: 0 auto 40px auto; font-weight: 400; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 36px; background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); color: #FFFFFF; font-size: 16px; font-weight: 700; border-radius: 14px; text-decoration: none; border: none; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(79, 70, 229, 0.5); }
    .stats-bar { display: flex; justify-content: center; gap: 48px; margin: 60px 0 30px 0; flex-wrap: wrap; }
    .stat-item { text-align: center; }
    .stat-num { font-size: 32px; font-weight: 800; color: #0F172A; }
    .stat-label { font-size: 13px; color: #64748B; font-weight: 500; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 50px; text-align: left; }
    .card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; padding: 32px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .card:hover { border-color: #C7D2FE; transform: translateY(-3px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.06); }
    .card-icon { width: 50px; height: 50px; background: #EEF2FF; color: #4F46E5; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; font-weight: bold; }
    .card h3 { font-size: 19px; font-weight: 700; color: #0F172A; margin-bottom: 10px; }
    .card p { font-size: 14px; color: #64748B; line-height: 1.6; }
    .trust-badge { margin-top: 60px; padding: 30px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">🚀 B2B Revenue Scaling System</div>
      <h1>Double Your Pipeline & Close <span>High-Value Clients</span> On Autopilot</h1>
      <p class="subtitle">We build and operate custom client acquisition funnels that fill your calendar with pre-qualified decision makers ready to buy.</p>
      <button class="cta-btn">Claim Your 1-on-1 Growth Consultation →</button>

      <div class="stats-bar">
        <div class="stat-item"><div class="stat-num">$14.8M+</div><div class="stat-label">Client Revenue Generated</div></div>
        <div class="stat-item"><div class="stat-num">94.2%</div><div class="stat-label">Show-up Rate</div></div>
        <div class="stat-item"><div class="stat-num">240+</div><div class="stat-label">B2B Agencies Scaled</div></div>
      </div>

      <div class="card-grid">
        <div class="card">
          <div class="card-icon">🎯</div>
          <h3>Precision Lead Qualification</h3>
          <p>Multi-step interactive survey filters tire-kickers and extracts crucial budget information before booking.</p>
        </div>
        <div class="card">
          <div class="card-icon">⚡</div>
          <h3>Automated Multi-Channel Nurturing</h3>
          <p>Instant WhatsApp & email reminders ensure 90%+ show-up rates without manual follow-ups.</p>
        </div>
        <div class="card">
          <div class="card-icon">📈</div>
          <h3>Pipeline CRM Integration</h3>
          <p>Track every conversation from initial click to closed-won revenue in your unified dashboard.</p>
        </div>
      </div>

      <div class="trust-badge">
        <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Ready To Fill Your Calendar Next Week?</h3>
        <p style="color: #64748B; font-size: 14px; margin-bottom: 20px;">Book your 20-minute tailored growth consultation with our senior strategy team.</p>
        <button class="cta-btn">CONTINUE TO SELECT SLOT →</button>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'saas-software-product',
    name: 'Modern SaaS Platform & Product Demo',
    category: 'SaaS',
    badge: 'Tech & Product • Clean Dark Mode',
    accentColor: '#3B82F6',
    description: 'Ideal for software companies, AI products, and tech startups aiming for instant demo bookings and product trials.',
    triggerButtons: ['Book Live Demo ⚡', 'Start 14-Day Free Trial', 'Schedule Interactive Walkthrough', 'Get Instant Access'],
    features: ['Dark Mode Aesthetic', 'Interactive Feature Cards', 'Comparison Table', 'Instant Video Hook'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Next-Gen SaaS CRM Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
    body { background-color: #0B0F19; color: #F8FAFC; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 50px 20px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(59, 130, 246, 0.12); color: #60A5FA; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 24px; border: 1px solid rgba(59, 130, 246, 0.3); }
    .hero { text-align: center; padding: 40px 10px 60px 10px; }
    h1 { font-size: 50px; font-weight: 900; color: #FFFFFF; line-height: 1.15; margin-bottom: 24px; letter-spacing: -0.03em; }
    h1 span { background: linear-gradient(135deg, #60A5FA 0%, #A855F7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { font-size: 18px; color: #94A3B8; max-width: 680px; margin: 0 auto 40px auto; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 15px 34px; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; font-size: 15px; font-weight: 700; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 0 25px rgba(59, 130, 246, 0.4); }
    .cta-btn:hover { background: #1D4ED8; transform: translateY(-2px); box-shadow: 0 0 35px rgba(59, 130, 246, 0.6); }
    .mockup-preview { margin: 50px auto 0 auto; max-width: 850px; background: #1E293B; border: 1px solid #334155; border-radius: 20px; padding: 30px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: left; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 50px; text-align: left; }
    .grid-card { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(51, 65, 85, 0.8); border-radius: 16px; padding: 26px; }
    .grid-card h3 { font-size: 18px; font-weight: 700; color: #F1F5F9; margin-bottom: 8px; }
    .grid-card p { font-size: 14px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">⚡ Powered by AI & Realtime Cloud Engine</div>
      <h1>Automate Your Entire <span>Sales Pipeline</span> in One Single Workspace</h1>
      <p class="subtitle">Experience frictionless customer onboarding, smart pipeline automations, and live deal intelligence in seconds.</p>
      <button class="cta-btn">Book Live Demo ⚡</button>

      <div class="mockup-preview">
        <div style="display: flex; gap: 8px; margin-bottom: 20px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #EF4444;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #F59E0B;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #10B981;"></div>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #F8FAFC; margin-bottom: 10px;">Cloud Workspace Dashboard 🚀</h2>
        <p style="color: #94A3B8; font-size: 14px;">Real-time task synchronization across Google Cloud Tasks, Supabase Realtime, and Evolution WhatsApp API.</p>
      </div>

      <div class="grid">
        <div class="grid-card">
          <div style="font-size: 28px; margin-bottom: 12px;">📊</div>
          <h3>Unified Realtime Dashboard</h3>
          <p>Monitor deal velocity, stages, and customer lifecycle metrics seamlessly.</p>
        </div>
        <div class="grid-card">
          <div style="font-size: 28px; margin-bottom: 12px;">🤖</div>
          <h3>Automated Bot Workflows</h3>
          <p>Trigger scheduled broadcasts and calendar meetings automatically.</p>
        </div>
        <div class="grid-card">
          <div style="font-size: 28px; margin-bottom: 12px;">🔒</div>
          <h3>Enterprise Grade Security</h3>
          <p>Bank-grade data isolation per user with dynamic instance resolution.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'coaching-high-ticket',
    name: 'High-Ticket Coaching & Masterclass Funnel',
    category: 'Coaching',
    badge: 'High Converting • Gold Accent',
    accentColor: '#D97706',
    description: 'Perfect for business coaches, mentors, and online course creators looking to fill masterclasses or enroll 1-on-1 mentees.',
    triggerButtons: ['Reserve My VIP Seat 🏆', 'Apply for Coaching Session', 'Unlock Free Strategy Call', 'Join Masterclass Now'],
    features: ['Urgency Badges', 'Curriculum Highlights', 'Student Transformation Proof', 'Fast Slot Selector'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Masterclass & Mentorship Program</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
    body { background-color: #0F1117; color: #F3F4F6; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 50px 20px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; background: rgba(217, 119, 6, 0.15); color: #FBBF24; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 24px; border: 1px solid rgba(245, 158, 11, 0.3); }
    .hero { text-align: center; padding: 40px 10px; }
    h1 { font-size: 52px; font-weight: 900; color: #FFFFFF; line-height: 1.15; margin-bottom: 20px; letter-spacing: -0.02em; }
    h1 span { color: #F59E0B; }
    .subtitle { font-size: 19px; color: #9CA3AF; max-width: 700px; margin: 0 auto 36px auto; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 18px 40px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #000000; font-size: 17px; font-weight: 800; border-radius: 14px; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3); }
    .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(245, 158, 11, 0.45); }
    .curriculum { margin-top: 60px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; text-align: left; }
    .curr-card { background: #181C26; border: 1px solid #282E3E; border-radius: 20px; padding: 30px; }
    .curr-card h3 { font-size: 20px; font-weight: 700; color: #FBBF24; margin-bottom: 8px; }
    .curr-card p { font-size: 14px; color: #9CA3AF; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">👑 EXCLUSIVE 1-ON-1 MASTERMIND</div>
      <h1>Scale Your Consulting & Coaching To <span>$50k/Month</span> In 90 Days</h1>
      <p class="subtitle">A step-by-step roadmap to productizing your expertise, building authority, and attracting premium high-ticket clients.</p>
      <button class="cta-btn">Reserve My VIP Seat 🏆</button>

      <div class="curriculum">
        <div class="curr-card">
          <h3>Phase 1: Offer Architecture</h3>
          <p>Crafting irresistible $5k–$10k transformation packages that clients eagerly buy on the first call.</p>
        </div>
        <div class="curr-card">
          <h3>Phase 2: Automated Acquisition</h3>
          <p>Leveraging high-converting funnels and WhatsApp workflows to schedule 15+ qualified discovery calls weekly.</p>
        </div>
        <div class="curr-card">
          <h3>Phase 3: High-Ticket Closing</h3>
          <p>Our battle-tested diagnostic sales framework that closes 40%+ of strategy sessions without friction.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'real-estate-property',
    name: 'Real Estate & Luxury Property Showcase',
    category: 'Real Estate',
    badge: 'Luxury • High Conversion',
    accentColor: '#059669',
    description: 'Tailored for real estate brokers, property developers, and agencies to collect verified buyer leads and book private site visits.',
    triggerButtons: ['Book Private VIP Site Visit 🏡', 'Request Property Brochure PDF', 'Get Free Property Valuation', 'Schedule Consultant Call'],
    features: ['Property Showcase', 'Price Breakdown', 'Neighborhood Score', 'WhatsApp Direct Sync'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luxury Real Estate & Villa Consultations</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #F8FAF9; color: #0F172A; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: #ECFDF5; color: #059669; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 20px; border: 1px solid #A7F3D0; }
    .hero { text-align: center; padding: 40px 10px; }
    h1 { font-size: 50px; font-weight: 800; color: #0F172A; line-height: 1.2; margin-bottom: 20px; }
    h1 span { color: #059669; }
    .subtitle { font-size: 18px; color: #475569; max-width: 680px; margin: 0 auto 35px auto; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 36px; background: #059669; color: #FFFFFF; font-size: 16px; font-weight: 700; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3); }
    .cta-btn:hover { background: #047857; transform: translateY(-2px); }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 50px; text-align: left; }
    .feat-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .feat-card h3 { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
    .feat-card p { font-size: 14px; color: #64748B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">🏡 Premium Estates & Investment Opportunities</div>
      <h1>Discover Exclusive <span>Luxury Properties</span> & High-Yield Investments</h1>
      <p class="subtitle">Connect directly with certified property advisors for customized investment portfolios, site tours, and verified ROI forecasts.</p>
      <button class="cta-btn">Book Private VIP Site Visit 🏡</button>

      <div class="features">
        <div class="feat-card">
          <div style="font-size: 28px; margin-bottom: 12px;">🌟</div>
          <h3>Prime Location Properties</h3>
          <p>Hand-picked luxury residences and commercial assets in high-growth corridors.</p>
        </div>
        <div class="feat-card">
          <div style="font-size: 28px; margin-bottom: 12px;">📊</div>
          <h3>Verified 12%+ Rental ROI</h3>
          <p>Comprehensive market reports and guaranteed rental management programs.</p>
        </div>
        <div class="feat-card">
          <div style="font-size: 28px; margin-bottom: 12px;">🤝</div>
          <h3>Zero Brokerage Assistance</h3>
          <p>End-to-end documentation, legal clearance, and mortgage assistance at 0 cost.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'healthcare-clinic-doctor',
    name: 'Healthcare Clinic & Doctor Consultation',
    category: 'Healthcare',
    badge: 'Trust & Medical • High Showup',
    accentColor: '#0284C7',
    description: 'Designed for medical clinics, dental specialists, aesthetic surgeons, and healthcare consultants to book direct appointments.',
    triggerButtons: ['Book Doctor Consultation 🩺', 'Claim Free Dental Assessment', 'Schedule Clinic Visit', 'Get Health Consultation'],
    features: ['Doctor Bio & Credentials', 'Patient Review Stars', 'Service Cards', 'WhatsApp Instant Confirmed Slot'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Specialized Medical Care & Consultation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #F0FDF4; color: #0F172A; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: #E0F2FE; color: #0284C7; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 20px; border: 1px solid #BAE6FD; }
    .hero { text-align: center; padding: 40px 10px; }
    h1 { font-size: 48px; font-weight: 800; color: #0F172A; line-height: 1.2; margin-bottom: 20px; }
    h1 span { color: #0284C7; }
    .subtitle { font-size: 18px; color: #475569; max-width: 680px; margin: 0 auto 35px auto; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 36px; background: #0284C7; color: #FFFFFF; font-size: 16px; font-weight: 700; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3); }
    .cta-btn:hover { background: #0369A1; transform: translateY(-2px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 50px; text-align: left; }
    .card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .card h3 { font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
    .card p { font-size: 14px; color: #64748B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">🩺 Certified Medical Specialists & Diagnostics</div>
      <h1>Personalized Healthcare & <span>Specialist Consultations</span></h1>
      <p class="subtitle">Book your confidential, 1-on-1 health consultation with top certified medical experts with 0 waiting time.</p>
      <button class="cta-btn">Book Doctor Consultation 🩺</button>

      <div class="grid">
        <div class="card">
          <div style="font-size: 28px; margin-bottom: 12px;">👨‍⚕️</div>
          <h3>Senior Board Specialists</h3>
          <p>Consult with certified specialists boasting 15+ years of clinical excellence.</p>
        </div>
        <div class="card">
          <div style="font-size: 28px; margin-bottom: 12px;">🔬</div>
          <h3>Advanced Diagnostic Tech</h3>
          <p>State-of-the-art testing equipment ensuring swift and accurate reports.</p>
        </div>
        <div class="card">
          <div style="font-size: 28px; margin-bottom: 12px;">💬</div>
          <h3>WhatsApp Care Followup</h3>
          <p>Direct prescriptions and follow-up support sent instantly to your phone.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'ecommerce-d2c-growth',
    name: 'E-Commerce & D2C Brand Growth Masterclass',
    category: 'E-Commerce',
    badge: 'Growth & Ads • Vibrant',
    accentColor: '#EC4899',
    description: 'Created for D2C brands, Shopify store owners, and Amazon sellers aiming to scale ad spend and optimize customer LTV.',
    triggerButtons: ['Get Free Store Audit 🛍️', 'Claim My E-Com Growth Plan', 'Schedule 1-on-1 Audit', 'Unlock 7-Figure Playbook'],
    features: ['Store Audit Hook', 'Case Studies & ROAS Proof', 'Scaling Checklist', 'VIP WhatsApp Group'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Commerce & D2C Revenue Scaling</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: #FAFAFA; color: #111827; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: #FDF2F8; color: #DB2777; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 20px; border: 1px solid #FBCFE8; }
    .hero { text-align: center; padding: 40px 10px; }
    h1 { font-size: 50px; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 20px; }
    h1 span { color: #DB2777; }
    .subtitle { font-size: 18px; color: #4B5563; max-width: 680px; margin: 0 auto 35px auto; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 16px 36px; background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); color: #FFFFFF; font-size: 16px; font-weight: 700; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.3); }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(219, 39, 119, 0.4); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 50px; text-align: left; }
    .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 20px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .card h3 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .card p { font-size: 14px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">🛍️ Scale E-Com Brands Beyond 7-Figures</div>
      <h1>Scale Your D2C Brand With <span>High-ROAS Funnels</span> & Retention</h1>
      <p class="subtitle">Stop wasting ad spend. Get a custom audit of your conversion rates, creative strategy, and post-purchase WhatsApp workflows.</p>
      <button class="cta-btn">Get Free Store Audit 🛍️</button>

      <div class="grid">
        <div class="card">
          <div style="font-size: 28px; margin-bottom: 12px;">📊</div>
          <h3>ROAS & Unit Economics Audit</h3>
          <p>Discover conversion leaks and identify high-margin product bundling opportunities.</p>
        </div>
        <div class="card">
          <div style="font-size: 28px; margin-bottom: 12px;">🚀</div>
          <h3>Viral Creative Strategy</h3>
          <p>Frameworks to generate high-converting UGC and TikTok/Meta ad variations.</p>
        </div>
        <div class="card">
          <div style="font-size: 28px; margin-bottom: 12px;">💬</div>
          <h3>WhatsApp Abandoned Cart Engine</h3>
          <p>Recover 25%+ of dropped checkouts automatically via smart messaging.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
];
