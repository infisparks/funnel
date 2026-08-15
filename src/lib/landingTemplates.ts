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
    id: 'consulting-growth-agency',
    name: 'Executive B2B Growth & Consulting Agency',
    category: 'Consulting',
    badge: 'Popular • High Converting',
    accentColor: '#6366F1',
    description: 'Designed for consulting firms, digital agencies, and B2B service providers looking to book high-ticket strategy calls.',
    triggerButtons: ['Get Started Free →', 'Claim Your 1-on-1 Growth Consultation', 'CONTINUE TO SELECT SLOT', 'Access Funnel Workspace →'],
    features: ['30-Sec Fast Booking', 'Social Proof Grid', 'Pain-to-Outcome Roadmap', 'Trust Badges'],
    html: `<!DOCTYPE html>
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
