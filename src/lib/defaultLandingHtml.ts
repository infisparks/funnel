export const DEFAULT_LANDING_HTML = `<!DOCTYPE html>
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
    .form-section { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 24px; padding: 40px; max-width: 600px; margin: 60px auto 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center; }
    .form-group { margin-bottom: 16px; text-align: left; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 12px 16px; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 14px; outline: none; background: #F9FAFB; }
    .form-control:focus { border-color: #6366F1; background: #FFFFFF; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">✨ Verified High-Converting Landing Funnel</div>
      <h1>Accelerate Your <span>Customer Growth</span> & Close High-Ticket Deals</h1>
      <p class="subtitle">Join over 2,500+ fast-growing modern businesses using our automated CRM and customer acquisition funnel pipeline.</p>
      <a href="#demo-form" class="cta-btn">Get Started Free →</a>

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

      <div id="demo-form" class="form-section">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Claim Your Free 14-Day Growth Trial</h2>
        <p style="font-size: 13px; color: #6B7280; margin-bottom: 24px;">No credit card required • 2-minute instant setup</p>
        <form onsubmit="event.preventDefault(); alert('Demo request submitted successfully!');">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" class="form-control" placeholder="Jane Doe" required />
          </div>
          <div class="form-group">
            <label>Work Email Address *</label>
            <input type="email" class="form-control" placeholder="jane@company.com" required />
          </div>
          <button type="submit" class="cta-btn" style="width: 100%; margin-top: 10px;">Access Funnel Workspace →</button>
        </form>
      </div>
    </div>
  </div>
</body>
</html>`;
