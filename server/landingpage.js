/**
 * Production Server-Side Landing Page & Domain Resolver Module (landingpage.js)
 *
 * Responsibilities:
 * 1. Dynamic Domain & Subdomain Resolution directly from Supabase `funnel_workspaces`
 * 2. Secure Server-Side HTML Rendering & interactive 3-Step Funnel Injection
 * 3. Smart Trigger Click Interception (Matching exact button labels)
 * 4. Secure Lead Capture Endpoint (/api/landing/lead) strictly bound to workspace owner (funnel_id & user_id)
 * 5. Automatic WhatsApp Automation Dispatch on Lead Step Progress
 */

const whatsappManager = require('./whatappmanage');

const DEFAULT_LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>High-Converting Sales Funnel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
    body { background-color: #FAFAFC; color: #111827; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; background: #EEF2FF; color: #4F46E5; border-radius: 50px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .hero { text-align: center; padding: 60px 20px; }
    h1 { font-size: 48px; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 20px; }
    h1 span { color: #6366F1; }
    .subtitle { font-size: 18px; color: #4B5563; max-width: 650px; margin: 0 auto 35px auto; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; background: #6366F1; color: #FFFFFF; font-size: 16px; font-weight: 600; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }
    .cta-btn:hover { background: #4F46E5; transform: translateY(-2px); }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 50px; }
    .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 20px; padding: 30px; text-align: left; transition: all 0.2s; }
    .card:hover { border-color: #C7D2FE; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .card-icon { width: 48px; height: 48px; background: #EEF2FF; color: #6366F1; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; font-weight: bold; }
    .card h3 { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .card p { font-size: 14px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">✨ Verified High-Converting Landing Funnel</div>
      <h1>Accelerate Your <span>Customer Growth</span> & Close High-Ticket Deals</h1>
      <p class="subtitle">Join over 2,500+ fast-growing modern businesses using our automated CRM and customer acquisition funnel pipeline.</p>
      <button class="cta-btn">Claim Free Strategy Session →</button>
      <div class="card-grid">
        <div class="card">
          <div class="card-icon">⚡</div>
          <h3>Lightning Lead Capture</h3>
          <p>Instant lead scoring and routing directly into your CRM workspace pipeline stages.</p>
        </div>
        <div class="card">
          <div class="card-icon">📅</div>
          <h3>Automated Calendar Sync</h3>
          <p>Prospects book direct demo calls on your calendar without back-and-forth emails.</p>
        </div>
        <div class="card">
          <div class="card-icon">📊</div>
          <h3>Real-time Deal Analytics</h3>
          <p>Track conversion metrics, pipeline velocity, and won revenue in one dashboard.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

/**
 * Extract subdomain or clean domain from Host header or query param
 */
function extractSubdomain(hostHeader, querySubdomain, queryDomain) {
  if (querySubdomain) {
    let sub = querySubdomain.toLowerCase().trim();
    if (sub.endsWith('.firstoption.cloud')) sub = sub.replace('.firstoption.cloud', '');
    return sub;
  }

  if (queryDomain) {
    let dom = queryDomain.toLowerCase().trim();
    if (dom.endsWith('.firstoption.cloud')) dom = dom.replace('.firstoption.cloud', '');
    return dom;
  }

  if (!hostHeader) return '';
  const host = hostHeader.toLowerCase().split(':')[0]; // strip port if any

  if (host.endsWith('.firstoption.cloud')) {
    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      return parts[0];
    }
  }

  // If host is custom domain (e.g. leads.mybrand.com)
  if (host !== 'localhost' && host !== '127.0.0.1' && !host.includes('vercel.app') && host !== 'firstoption.cloud' && host !== 'www.firstoption.cloud') {
    return host;
  }

  return '';
}

/**
 * Resolve workspace record from Supabase by Subdomain, Custom Domain, or User ID
 */
async function resolveWorkspace(targetIdentifier, supabase) {
  if (!supabase || !targetIdentifier) return null;
  const cleanId = targetIdentifier.toString().toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '').split(':')[0];
  const subPart = cleanId.includes('.') ? cleanId.split('.')[0] : cleanId;

  try {
    if (cleanId) {
      const { data, error } = await supabase
        .from('funnel_workspaces')
        .select('*')
        .or(`custom_domain.eq.${cleanId},subdomain.eq.${cleanId},subdomain.eq.${subPart},custom_domain.ilike.%${cleanId}%,custom_domain.ilike.%${subPart}%,id.eq.${cleanId},user_id.eq.${cleanId}`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        return data;
      }
    }

    return null;
  } catch (err) {
    console.error('[landingpage.js] Error resolving workspace from Supabase:', err.message);
    return null;
  }
}

/**
 * Injects smart popup trigger scripts and interactive modal code into HTML
 */
function buildInteractiveLandingHtml(workspace) {
  const baseHtml = (workspace && workspace.landing_html && workspace.landing_html.trim())
    ? workspace.landing_html
    : DEFAULT_LANDING_HTML;

  const triggerButtons = Array.isArray(workspace?.trigger_buttons)
    ? workspace.trigger_buttons
    : typeof workspace?.trigger_buttons === 'string'
    ? JSON.parse(workspace.trigger_buttons)
    : ['Claim Free Strategy Session', 'Get Started Free', 'Book Strategy Session', 'Book Your Business Technology Strategy Session'];

  const triggersJson = JSON.stringify(triggerButtons.map((t) => (t || '').toLowerCase().trim()));
  const workspaceId = workspace?.id || '';
  const userId = workspace?.user_id || '';
  const popupTheme = workspace?.popup_theme || {};
  const surveyQuestions = workspace?.survey_questions || [
    {
      id: 'q1',
      label: 'Select Your Primary Industry',
      options: ['Service Business', 'E-commerce', 'Consulting / Agency', 'Doctor / Clinic'],
    },
  ];
  const questionsJson = JSON.stringify(surveyQuestions);
  const meetUrl = workspace?.google_meet_url || popupTheme?.googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy';

  const injectedCode = `
<!-- ================= SERVER INJECTED INTERACTIVE LEAD FUNNEL ================= -->
<style>
  #infispark-lead-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(11, 15, 23, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 999999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
    opacity: 0;
    transition: opacity 0.25s ease;
    font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  }
  #infispark-lead-modal-overlay.active {
    display: flex;
    opacity: 1;
  }
  .infi-modal-card {
    width: 100%;
    max-width: 480px;
    background: ${popupTheme?.themeMode === 'light' ? '#FFFFFF' : '#131B2A'};
    color: ${popupTheme?.themeMode === 'light' ? '#111827' : '#FFFFFF'};
    border: 1px solid ${popupTheme?.primaryColor ? popupTheme.primaryColor + '40' : '#8146F040'};
    border-radius: 24px;
    padding: 28px 24px;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
    animation: infiPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes infiPopIn {
    0% { transform: scale(0.94) translateY(12px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  .infi-close-btn {
    position: absolute;
    top: 18px;
    right: 18px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #94A3B8;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    transition: all 0.2s;
  }
  .infi-close-btn:hover { background: rgba(255, 255, 255, 0.2); color: #FFF; }
  .infi-btn-primary {
    width: 100%;
    padding: 14px 20px;
    background: ${popupTheme?.primaryColor || '#8146F0'};
    color: #FFFFFF;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 8px 20px -4px ${popupTheme?.primaryColor ? popupTheme.primaryColor + '60' : 'rgba(129, 70, 240, 0.4)'};
  }
  .infi-btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
  .infi-input-field {
    width: 100%;
    padding: 13px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.25);
    color: #FFF;
    font-size: 14px;
    outline: none;
    margin-top: 6px;
    margin-bottom: 14px;
    box-sizing: border-box;
  }
  .infi-input-field:focus { border-color: ${popupTheme?.primaryColor || '#8146F0'}; }
  .infi-label { font-size: 12px; font-weight: 600; color: #CBD5E1; text-transform: uppercase; letter-spacing: 0.5px; }
  .infi-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: rgba(129, 70, 240, 0.15); color: ${popupTheme?.primaryColor || '#A855F7'}; border: 1px solid rgba(129, 70, 240, 0.3); margin-bottom: 12px; }
  .infi-slot-btn {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: #FFF;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s;
  }
  .infi-slot-btn.selected, .infi-slot-btn:hover {
    border-color: ${popupTheme?.primaryColor || '#8146F0'};
    background: ${popupTheme?.primaryColor ? popupTheme.primaryColor + '25' : 'rgba(129, 70, 240, 0.2)'};
    color: #FFF;
  }
</style>

<div id="infispark-lead-modal-overlay">
  <div class="infi-modal-card">
    <button class="infi-close-btn" onclick="closeInfiModal()">&times;</button>

    <!-- STEP 1: CONTACT DETAILS -->
    <div id="infi-step-1">
      <div class="infi-badge">✨ ${popupTheme?.badgeText || 'FAST 30-SEC BOOKING'}</div>
      <h3 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0;">${popupTheme?.step1Title || 'Claim Your 1-on-1 Growth Consultation'}</h3>
      <p style="font-size: 13px; color: #94A3B8; margin: 0 0 18px 0;">${popupTheme?.step1Subtitle || 'Enter your details to reserve your custom revenue strategy session.'}</p>
      
      <form onsubmit="handleInfiStep1(event)">
        <label class="infi-label">${popupTheme?.nameLabel || 'Full Name *'}</label>
        <input id="infi_name" class="infi-input-field" type="text" placeholder="${popupTheme?.namePlaceholder || 'Enter your full name'}" required />

        <label class="infi-label">${popupTheme?.phoneLabel || 'WhatsApp Phone Number *'}</label>
        <input id="infi_phone" class="infi-input-field" type="tel" placeholder="${popupTheme?.phonePlaceholder || '+91 9876543210'}" required />

        <label class="infi-label">${popupTheme?.emailLabel || 'Work Email *'}</label>
        <input id="infi_email" class="infi-input-field" type="email" placeholder="${popupTheme?.emailPlaceholder || 'name@company.com'}" required />

        <button type="submit" class="infi-btn-primary">
          <span>${popupTheme?.step1ButtonText || 'CONTINUE TO QUALIFY'} &rarr;</span>
        </button>
      </form>
    </div>

    <!-- STEP 2: SURVEY QUALIFICATION -->
    <div id="infi-step-2" style="display: none;">
      <div class="infi-badge">🎯 Step 2 of 3 • Qualification</div>
      <h3 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0;">${popupTheme?.step2Title || 'Qualify Your Business Requirements'}</h3>
      <p style="font-size: 13px; color: #94A3B8; margin: 0 0 18px 0;">${popupTheme?.step2Subtitle || 'Answer quick questions so we can customize your roadmap.'}</p>

      <div id="infi-survey-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;"></div>

      <button type="button" class="infi-btn-primary" onclick="handleInfiStep2()">
        <span>${popupTheme?.step2ButtonText || 'PROCEED TO CALENDAR'} &rarr;</span>
      </button>
    </div>

    <!-- STEP 3: MEETING DATE & TIME -->
    <div id="infi-step-3" style="display: none;">
      <div class="infi-badge">📅 Step 3 of 3 • Lock Call Slot</div>
      <h3 style="font-size: 20px; font-weight: 800; margin: 0 0 6px 0;">${popupTheme?.step3Title || 'Lock Your Strategy Call Slot'}</h3>
      <p style="font-size: 13px; color: #94A3B8; margin: 0 0 16px 0;">${popupTheme?.step3Subtitle || 'Pick a date and time slot for your 1-on-1 session.'}</p>

      <label class="infi-label">Select Meeting Date</label>
      <input id="infi_meeting_date" class="infi-input-field" type="date" value="${new Date().toISOString().split('T')[0]}" />

      <label class="infi-label" style="margin-top: 8px; display: block;">Select Time Slot</label>
      <div id="infi-slots-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 20px 0;">
        ${(popupTheme?.meetingSlots || ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'])
          .map((slot, idx) => `<button type="button" class="infi-slot-btn ${idx === 0 ? 'selected' : ''}" onclick="selectInfiSlot(this, '${slot}')">${slot}</button>`)
          .join('')}
      </div>

      <button type="button" class="infi-btn-primary" onclick="handleInfiStep3()">
        <span>${popupTheme?.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅'}</span>
      </button>
    </div>

    <!-- STEP 4: CONFIRMATION -->
    <div id="infi-step-4" style="display: none; text-align: center;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px;">✓</div>
      <h3 style="font-size: 22px; font-weight: 800; margin: 0 0 6px 0;">${popupTheme?.step4Title || 'Booking Confirmed! 🎉'}</h3>
      <p style="font-size: 13px; color: #94A3B8; margin: 0 0 20px 0;">${popupTheme?.step4Subtitle || 'Your meeting is locked in our calendar. Google Meet link has been generated.'}</p>

      <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 13px; word-break: break-all;">
        <span style="color: #94A3B8;">Meeting Link:</span><br/>
        <a id="infi_confirmed_meet_url" href="${meetUrl}" target="_blank" style="color: ${popupTheme?.primaryColor || '#8146F0'}; font-weight: bold; text-decoration: underline;">${meetUrl}</a>
      </div>

      <button type="button" class="infi-btn-primary" onclick="closeInfiModal()" style="background: #10B981;">
        <span>Done & Return to Website</span>
      </button>
    </div>
  </div>
</div>

<script>
  (function() {
    const validTriggers = ${triggersJson};
    const workspaceId = "${workspaceId}";
    const userId = "${userId}";
    const surveyQuestions = ${questionsJson};
    let leadData = {
      name: '',
      phone: '',
      email: '',
      funnel_id: workspaceId,
      user_id: userId,
      survey_responses: {},
      meeting_date: '',
      meeting_time: '10:00 AM',
    };
    let activeLeadId = null;

    window.openInfiModal = function() {
      const modal = document.getElementById('infispark-lead-modal-overlay');
      if (modal) modal.classList.add('active');
    };

    window.closeInfiModal = function() {
      const modal = document.getElementById('infispark-lead-modal-overlay');
      if (modal) modal.classList.remove('active');
    };

    // Render Survey Questions dynamically
    function renderSurvey() {
      const container = document.getElementById('infi-survey-container');
      if (!container) return;
      container.innerHTML = '';

      surveyQuestions.forEach((q, qIdx) => {
        const qWrap = document.createElement('div');
        qWrap.style.marginBottom = '12px';
        qWrap.innerHTML = '<div class="infi-label" style="margin-bottom: 6px;">' + (q.label || ('Question ' + (qIdx + 1))) + '</div>';

        const optGrid = document.createElement('div');
        optGrid.style.display = 'flex';
        optGrid.style.flexDirection = 'column';
        optGrid.style.gap = '6px';

        (q.options || ['Option 1', 'Option 2']).forEach(opt => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'infi-slot-btn';
          btn.style.textAlign = 'left';
          btn.innerText = opt;
          btn.onclick = function() {
            optGrid.querySelectorAll('.infi-slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            leadData.survey_responses[q.label || q.id] = opt;
            submitLead('survey_completed');
          };
          optGrid.appendChild(btn);
        });

        qWrap.appendChild(optGrid);
        container.appendChild(qWrap);
      });
    }

    window.selectInfiSlot = function(btn, slot) {
      document.querySelectorAll('#infi-slots-grid .infi-slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      leadData.meeting_time = slot;
    };

    async function submitLead(stepProgress) {
      try {
        const payload = {
          ...leadData,
          step_progress: stepProgress,
          lead_id: activeLeadId
        };
        const res = await fetch('/api/landing/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data && data.lead_id) {
          activeLeadId = data.lead_id;
        }
      } catch (e) {
        console.warn('Lead submit background sync:', e);
      }
    }

    window.handleInfiStep1 = async function(e) {
      e.preventDefault();
      leadData.name = document.getElementById('infi_name').value;
      leadData.phone = document.getElementById('infi_phone').value;
      leadData.email = document.getElementById('infi_email').value;

      document.getElementById('infi-step-1').style.display = 'none';
      document.getElementById('infi-step-2').style.display = 'block';
      renderSurvey();
      await submitLead('step1_contact');
    };

    window.handleInfiStep2 = async function() {
      document.getElementById('infi-step-2').style.display = 'none';
      document.getElementById('infi-step-3').style.display = 'block';
      await submitLead('survey_completed');
    };

    window.handleInfiStep3 = async function() {
      leadData.meeting_date = document.getElementById('infi_meeting_date').value;
      document.getElementById('infi-step-3').style.display = 'none';
      document.getElementById('infi-step-4').style.display = 'block';
      await submitLead('meeting_booked');
    };

    // Auto-intercept clicks matching triggers
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a, button, input[type="submit"]');
      if (!target) return;
      if (target.dataset.noPopup === 'true') return;

      const clickedText = (target.textContent || '').trim().toLowerCase();
      const matchesTrigger = target.dataset.popup === 'true' || validTriggers.some(function(trig) {
        return trig && (clickedText === trig || clickedText.indexOf(trig) !== -1);
      });

      if (matchesTrigger) {
        e.preventDefault();
        e.stopPropagation();
        openInfiModal();
      }
    });
  })();
</script>
<!-- ================= END SERVER INJECTED INTERACTIVE LEAD FUNNEL ================= -->
`;

  if (baseHtml.includes('</body>')) {
    return baseHtml.replace('</body>', `${injectedCode}\n</body>`);
  }
  return `${baseHtml}\n${injectedCode}`;
}

/**
 * Ingest Lead securely into Supabase
 */
async function captureLead(body, supabase) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const {
    name,
    email,
    phone,
    step_progress,
    survey_responses,
    meeting_date,
    meeting_time,
    funnel_id,
    user_id,
    subdomain,
  } = body;

  const cleanPhone = (phone || '').toString().trim();
  if (!cleanPhone && !email && !name) {
    throw new Error('Name, Phone or Email is required');
  }

  // Resolve target workspace accurately from domain, subdomain, or funnel_id
  let resolvedFunnelId = funnel_id;
  let resolvedUserId = user_id;

  const rawDomainIdentifier = body.domain || body.subdomain || subdomain || '';
  if (rawDomainIdentifier) {
    const ws = await resolveWorkspace(rawDomainIdentifier, supabase);
    if (ws) {
      resolvedFunnelId = ws.id;
      resolvedUserId = ws.user_id;
    }
  }

  // Check phone deduplication STRICTLY within THIS funnel_id
  let existingLeadId = body.lead_id || null;
  const digits = cleanPhone.replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

  if (!existingLeadId && last10) {
    let phoneQuery = supabase
      .from('leads')
      .select('id')
      .or(`phone.ilike.%${last10}%,phone.eq.${cleanPhone},phone.eq.${digits}`);

    if (resolvedFunnelId) phoneQuery = phoneQuery.eq('funnel_id', resolvedFunnelId);
    else if (resolvedUserId) phoneQuery = phoneQuery.eq('user_id', resolvedUserId);

    const { data: found } = await phoneQuery
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (found && found.id) {
      existingLeadId = found.id;
    }
  }

  // PREVENT DOUBLE BOOKING: Check if another lead already booked this exact date & time slot in this CRM
  if (meeting_date && meeting_time && (step_progress === 'meeting_booked' || body.meeting_time)) {
    const cleanDate = meeting_date.includes('T') ? meeting_date.split('T')[0] : meeting_date.trim();
    const cleanTime = meeting_time.trim();

    let slotConflictQuery = supabase
      .from('leads')
      .select('id, name, phone, meeting_date, meeting_time')
      .eq('meeting_date', cleanDate)
      .ilike('meeting_time', cleanTime);

    if (resolvedFunnelId) {
      slotConflictQuery = slotConflictQuery.eq('funnel_id', resolvedFunnelId);
    } else if (resolvedUserId) {
      slotConflictQuery = slotConflictQuery.eq('user_id', resolvedUserId);
    }

    if (existingLeadId) {
      slotConflictQuery = slotConflictQuery.neq('id', existingLeadId);
    }

    const { data: conflictLeads } = await slotConflictQuery.limit(1);
    if (conflictLeads && conflictLeads.length > 0) {
      throw new Error(`The time slot "${cleanTime}" on ${cleanDate} is already booked in this CRM. Please choose another available slot.`);
    }
  }

  // Ensure both funnel_id and user_id are populated
  if (!resolvedUserId && resolvedFunnelId) {
    try {
      const { data: ws } = await supabase
        .from('funnel_workspaces')
        .select('user_id')
        .eq('id', resolvedFunnelId)
        .maybeSingle();
      if (ws && ws.user_id) resolvedUserId = ws.user_id;
    } catch (e) {}
  }

  if (!resolvedFunnelId && resolvedUserId) {
    try {
      const { data: ws } = await supabase
        .from('funnel_workspaces')
        .select('id')
        .eq('user_id', resolvedUserId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (ws && ws.id) resolvedFunnelId = ws.id;
    } catch (e) {}
  }

  const payload = {
    name: name || 'Landing Page Visitor',
    email: email || '',
    phone: cleanPhone,
    step_progress: step_progress || 'step1_contact',
    survey_responses: survey_responses || null,
    meeting_date: meeting_date || null,
    meeting_time: meeting_time || null,
    funnel_id: resolvedFunnelId || null,
    user_id: resolvedUserId || null,
  };

  let savedRecord = null;
  if (existingLeadId) {
    const { data, error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', existingLeadId)
      .select()
      .maybeSingle();
    if (error) throw error;
    savedRecord = data;
  }

  // If no existing record was updated, insert as new lead
  if (!savedRecord) {
    const { data, error } = await supabase
      .from('leads')
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) throw error;
    savedRecord = data;
  }

  // Trigger automated WhatsApp message according to step progress
  if (savedRecord && cleanPhone) {
    const stepKeyMap = {
      step1_contact: 'step1',
      survey_completed: 'step2',
      meeting_booked: 'step3',
    };
    const stepKey = stepKeyMap[step_progress] || 'step1';
    whatsappManager
      .handleStepTrigger(
        stepKey,
        {
          ...savedRecord,
          phone: cleanPhone,
          workspace_id: resolvedFunnelId,
          user_id: resolvedUserId,
        },
        null,
        supabase
      )
      .catch((e) => console.warn('[LandingPage Lead WhatsApp Trigger Error]:', e.message));
  }

  return savedRecord;
}

/**
 * Handle Landing Page routes from HTTP Server
 */
async function handleLandingRequest(req, res, supabase, readJsonBody, sendJson) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const host = req.headers.host || '';

  // 1. GET /api/landing/workspace - Fetch workspace JSON
  if (req.method === 'GET' && pathname === '/api/landing/workspace') {
    const targetSub = extractSubdomain(host, url.searchParams.get('subdomain'), url.searchParams.get('domain'));
    const ws = await resolveWorkspace(targetSub, supabase);
    sendJson(200, { success: true, workspace: ws });
    return true;
  }

  // 2. POST /api/landing/lead - Capture Lead
  if (req.method === 'POST' && (pathname === '/api/landing/lead' || pathname === '/api/lead/capture')) {
    try {
      const body = await readJsonBody();
      const lead = await captureLead(body, supabase);
      sendJson(200, { success: true, lead_id: lead?.id, lead });
    } catch (err) {
      sendJson(400, { success: false, error: err.message });
    }
    return true;
  }

  // 3. GET /landing or Subdomain Root - Serve live compiled Landing Page HTML
  if (req.method === 'GET' && (pathname === '/landing' || pathname === '/landing/view')) {
    const targetSub = extractSubdomain(host, url.searchParams.get('subdomain'), url.searchParams.get('domain'));
    const ws = await resolveWorkspace(targetSub, supabase);
    const html = buildInteractiveLandingHtml(ws);

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(html);
    return true;
  }

  return false;
}

module.exports = {
  extractSubdomain,
  resolveWorkspace,
  buildInteractiveLandingHtml,
  captureLead,
  handleLandingRequest,
  DEFAULT_LANDING_HTML,
};
