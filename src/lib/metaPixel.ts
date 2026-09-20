// Meta Pixel Integration and Event Tracking Helper

/**
 * Generates the official Meta Pixel script and noscript snippet
 */
export function getMetaPixelCode(pixelId: string): string {
  const cleanId = (pixelId || '').trim();
  if (!cleanId) return '';

  return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${cleanId}');
fbq('track', 'PageView');

// Listen for cross-frame tracking events dispatched from parent modals or child forms
window.addEventListener('message', function(e) {
  try {
    if (e.data && e.data.type === 'META_PIXEL_TRACK' && window.fbq) {
      if (e.data.isCustom) {
        window.fbq('trackCustom', e.data.eventName, e.data.params || {});
      } else {
        window.fbq('track', e.data.eventName, e.data.params || {});
      }
    }
  } catch (err) {}
});
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${cleanId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;
}

/**
 * Injects Meta Pixel script into raw Landing Page HTML
 */
export function injectMetaPixelIntoHtml(html: string, pixelId?: string | null): string {
  if (!html) return '';
  const cleanId = (pixelId || '').trim();
  if (!cleanId) return html;

  // Avoid injecting twice
  if (html.includes('https://connect.facebook.net/en_US/fbevents.js') || html.includes(`tr?id=${cleanId}`)) {
    return html;
  }

  const snippet = getMetaPixelCode(cleanId);

  if (html.includes('<head>')) {
    return html.replace('<head>', `<head>\n${snippet}\n`);
  } else if (html.includes('<html>')) {
    return html.replace('<html>', `<html>\n<head>\n${snippet}\n</head>`);
  } else {
    return `${snippet}\n${html}`;
  }
}

/**
 * Initializes Meta Pixel in browser client environment
 */
export function initClientMetaPixel(pixelId?: string | null): void {
  if (typeof window === 'undefined') return;
  const cleanId = (pixelId || '').trim();
  if (!cleanId) return;

  const win = window as any;

  // Setup cross-window listener to bridge tracking between parent and iframe
  if (!win.__meta_pixel_listener_attached) {
    win.__meta_pixel_listener_attached = true;
    window.addEventListener('message', (e) => {
      try {
        if (e.data && e.data.type === 'META_PIXEL_TRACK' && win.fbq) {
          if (e.data.isCustom) {
            win.fbq('trackCustom', e.data.eventName, e.data.params || {});
          } else {
            win.fbq('track', e.data.eventName, e.data.params || {});
          }
        }
      } catch (err) {}
    });
  }

  if (win.fbq) {
    // Already initialized, check if need to call init with this ID
    if (win.__active_meta_pixel_id !== cleanId) {
      win.fbq('init', cleanId);
      win.__active_meta_pixel_id = cleanId;
      win.fbq('track', 'PageView');
    }
    return;
  }

  // Define fbq placeholder queue
  const n: any = function () {
    if (n.callMethod) {
      n.callMethod.apply(n, arguments);
    } else {
      n.queue.push(arguments);
    }
  };
  if (!win._fbq) win._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  win.fbq = n;

  // Insert script tag into head
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  win.fbq('init', cleanId);
  win.__active_meta_pixel_id = cleanId;
  win.fbq('track', 'PageView');
}

/**
 * Generic event dispatcher to local window.fbq and any iframes / parent windows
 */
export function trackMetaEvent(eventName: string, params: Record<string, any> = {}, isCustom = false): void {
  if (typeof window === 'undefined') return;

  const win = window as any;
  if (win.fbq) {
    try {
      if (isCustom) {
        win.fbq('trackCustom', eventName, params);
      } else {
        win.fbq('track', eventName, params);
      }
      console.log(`[Meta Pixel] Fired event: ${eventName}`, params);
    } catch (err) {
      console.warn('[Meta Pixel] Error firing fbq event:', err);
    }
  }

  // Also postMessage to parent (if in iframe) and all iframes (if parent window)
  try {
    const msg = { type: 'META_PIXEL_TRACK', eventName, params, isCustom };
    window.postMessage(msg, '*');
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(msg, '*');
    }
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((ifr) => {
      try {
        ifr.contentWindow?.postMessage(msg, '*');
      } catch (e) {}
    });
  } catch (err) {}
}

/**
 * Track PageView event
 */
export function trackMetaPageView(): void {
  trackMetaEvent('PageView');
}

/**
 * Track Step 1 Contact Details Form Submission (Lead)
 */
export function trackMetaLead(data: {
  name?: string;
  email?: string;
  phone?: string;
  funnel_id?: string;
  [key: string]: any;
}): void {
  trackMetaEvent('Lead', {
    content_name: 'Lead Detail Form Submitted',
    content_category: 'Funnel Step 1',
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    ...data,
  });
}

/**
 * Track Step 2 Survey Form Completion (SubmitApplication & SurveySubmitted)
 */
export function trackMetaSurveyCompleted(data: {
  survey_responses?: any;
  funnel_id?: string;
  [key: string]: any;
}): void {
  // Fire standard Meta 'SubmitApplication' event
  trackMetaEvent('SubmitApplication', {
    content_name: 'Qualification Survey Completed',
    content_category: 'Funnel Step 2',
    ...data,
  });

  // Also fire explicit custom event 'SurveySubmitted'
  trackMetaEvent('SurveySubmitted', {
    content_name: 'Qualification Survey Completed',
    ...data,
  }, true);
}

/**
 * Track Step 3 Meeting Booked (Schedule & MeetingBooked)
 */
export function trackMetaMeetingBooked(data: {
  meeting_date?: string | null;
  meeting_time?: string | null;
  name?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}): void {
  // Fire standard Meta 'Schedule' event
  trackMetaEvent('Schedule', {
    content_name: 'Strategy Meeting Booked',
    content_category: 'Funnel Step 3',
    meeting_date: data.meeting_date,
    meeting_time: data.meeting_time,
    ...data,
  });

  // Also fire explicit custom event 'MeetingBooked'
  trackMetaEvent('MeetingBooked', {
    content_name: 'Strategy Meeting Booked',
    meeting_date: data.meeting_date,
    meeting_time: data.meeting_time,
    ...data,
  }, true);
}
