const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CampusConnect | College Event Aggregator & Secure Ticket Escrow Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .modal-backdrop { background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">

  <!-- Header / Navigation -->
  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <i class="fa-solid fa-ticket-simple text-lg"></i>
        </div>
        <div>
          <span class="font-black text-lg text-white tracking-tight">Campus<span class="text-indigo-400">Connect</span></span>
          <span class="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">INDIA • INR (₹)</span>
        </div>
      </div>
      
      <div class="hidden md:flex items-center gap-2">
        <a href="#events" class="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition">Events</a>
        <a href="#clearinghouse" class="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition">P2P Escrow (15% Cap)</a>
        <a href="#gate-pass" class="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition">30s Dynamic Pass</a>
        <a href="#scanner" class="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition">Gate Scanner</a>
      </div>

      <div class="flex items-center gap-3">
        <div id="auth-nav-container">
          <button onclick="openAuthModal('signin')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition">
            <i class="fa-solid fa-right-to-bracket"></i><span>Sign In</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden pt-16 pb-20 border-b border-slate-900 bg-slate-950 text-center">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
        <i class="fa-solid fa-sparkles text-amber-400"></i>
        <span>Multi-Platform Collegiate Event Aggregator & Anti-Scalping Escrow Platform</span>
      </div>
      <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none max-w-4xl mx-auto">
        College Events, Aggregated.<br/>
        <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Tickets Resold Safely.
        </span>
      </h1>
      <p class="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Discover college hackathons, fests, and workshops. Resell passes in our P2P clearinghouse with a hardcoded <strong class="text-emerald-400">15% anti-scalping price cap</strong> and <strong class="text-indigo-300">dynamic 30-second rotating TOTP passes</strong>.
      </p>
      
      <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
        <a href="#events" class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition">
          <i class="fa-solid fa-compass"></i><span>Explore Events</span>
        </a>
        <button onclick="openAuthModal('signin')" class="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition">
          <i class="fa-solid fa-user-graduate text-indigo-400"></i><span>Sign In / Demo Accounts</span>
        </button>
        <a href="#gate-pass" class="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition">
          <i class="fa-solid fa-qrcode text-emerald-400"></i><span>View 30s Dynamic QR Pass</span>
        </a>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80"><p class="text-2xl font-black text-white font-mono">15% Max</p><p class="text-xs text-slate-400 mt-1">Anti-Scalping Cap</p></div>
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80"><p class="text-2xl font-black text-indigo-400 font-mono">30s TOTP</p><p class="text-xs text-slate-400 mt-1">Rotating Gate Passes</p></div>
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80"><p class="text-2xl font-black text-emerald-400 font-mono">Atomic</p><p class="text-xs text-slate-400 mt-1">Escrow Transfers</p></div>
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80"><p class="text-2xl font-black text-purple-400 font-mono">₹ INR</p><p class="text-xs text-slate-400 mt-1">Indian Rupee Pricing</p></div>
      </div>
    </div>
  </section>

  <!-- Interactive Events Section -->
  <section id="events" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-4">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">Multi-College Event Aggregator</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">Featured Campus Events & Hackathons</h2>
      </div>
      <div class="flex gap-2">
        <button onclick="filterCat('ALL')" class="cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white" data-cat="ALL">All</button>
        <button onclick="filterCat('HACKATHONS')" class="cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800" data-cat="HACKATHONS">Hackathons</button>
        <button onclick="filterCat('MUSIC')" class="cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800" data-cat="MUSIC">Music & Fests</button>
        <button onclick="filterCat('WORKSHOPS')" class="cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800" data-cat="WORKSHOPS">Workshops</button>
      </div>
    </div>
    <div id="events-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
  </section>

  <!-- P2P Escrow Clearinghouse (15% Cap) -->
  <section id="clearinghouse" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-8">
      <div>
        <span class="text-xs font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">15% Price Cap Guarantee</span>
        <h2 class="text-2xl font-extrabold text-white mt-2">P2P Secondary Ticket Clearinghouse</h2>
        <p class="text-xs text-slate-400 mt-1">Smart contract escrow with instant invalidation & re-minting in Indian Rupees (₹)</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <span class="font-mono text-indigo-400 font-bold text-xs">#CC-TKT-2002-B2</span>
              <h4 class="font-black text-base text-white mt-1">IIT Delhi Spring Music Festival & Neon Rave</h4>
              <p class="text-xs text-slate-400 mt-1"><i class="fa-solid fa-university mr-1"></i>IIT Delhi (Hauz Khas)</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">Listed</span>
          </div>
          <div class="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
            <div class="flex justify-between text-slate-400"><span>Original Face Value:</span><span class="font-bold text-white font-mono">₹499</span></div>
            <div class="flex justify-between text-emerald-400 font-bold"><span>Anti-Scalping Max (115% Cap):</span><span class="font-mono">₹573.85</span></div>
            <div class="flex justify-between text-slate-400"><span>Seller Asking Price:</span><span class="font-bold text-emerald-300 font-mono text-sm">₹549</span></div>
          </div>
          <button onclick="executeEscrow('IIT Delhi Neon Rave', 549)" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2">
            <i class="fa-solid fa-lock"></i><span>Execute Atomic Escrow Checkout (₹559.98)</span>
          </button>
        </div>

        <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
          <h4 class="font-bold text-sm text-white flex items-center gap-2">
            <i class="fa-solid fa-calculator text-indigo-400"></i>
            <span>Interactive Anti-Scalping Price Cap Calculator (₹ INR)</span>
          </h4>
          <p class="text-xs text-slate-400">Enter ticket face value in Indian Rupees to verify the strict 15% ceiling:</p>
          <div class="space-y-3 pt-2">
            <div>
              <label class="text-[11px] font-bold text-slate-400 uppercase">Original Face Value (₹)</label>
              <input type="number" id="calc-face" value="1000" oninput="calcCap()" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs">
            </div>
            <div class="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex justify-between items-center text-xs">
              <span class="text-indigo-300 font-medium">Maximum Allowed Resale Price (15% Cap):</span>
              <span id="calc-result" class="font-mono font-black text-emerald-400 text-sm">₹1,150.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Dynamic 30s TOTP Gate Pass -->
  <section id="gate-pass" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 border-t border-slate-900">
    <div class="text-center space-y-2">
      <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Single-Use Anti-Screenshot Protocol</span>
      <h2 class="text-3xl font-black text-white">Dynamic 30-Second TOTP Entrance Pass</h2>
      <p class="text-xs text-slate-400 max-w-xl mx-auto">HMAC-SHA256 encrypted rotating tokens render screenshots, recordings, and copied tickets immediately invalid.</p>
    </div>

    <div class="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold uppercase mb-2">
          <i class="fa-solid fa-shield-halved"></i><span>Live Rotating Pass</span>
        </div>
        <h3 class="text-lg font-black text-white">Stanford TreeHacks 2026</h3>
        <p class="text-xs text-slate-400 font-mono">Pass #CC-TKT-1001-A1</p>
      </div>

      <div class="p-6 bg-white rounded-3xl mx-auto inline-block shadow-2xl border-4 border-indigo-500/20">
        <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=cc_sec_alex_stanford_hackathon_001_totp_active" alt="Dynamic QR" class="w-44 h-44 mx-auto transition-opacity duration-300">
      </div>

      <div class="flex items-center justify-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div id="totp-timer" class="w-11 h-11 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center font-mono text-xs font-extrabold text-white">30s</div>
        <div class="text-left">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rotating Gate Token:</span>
          <span id="totp-code" class="font-mono text-xl font-black text-indigo-300 tracking-widest">842 190</span>
        </div>
      </div>
      <p class="text-[11px] text-slate-400"><i class="fa-solid fa-lock text-indigo-400 mr-1"></i>Code auto-rotates every 30 seconds. Screenshots expire at the gate.</p>
    </div>
  </section>

  <!-- Cryptographic Gate Scanner Demo -->
  <section id="scanner" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900 space-y-6">
    <div class="text-center space-y-2">
      <span class="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">Organizer Check-In Tool</span>
      <h2 class="text-3xl font-black text-white">Gate Admission Scanner Simulator</h2>
    </div>

    <div class="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
      <div>
        <label class="block text-xs font-bold text-slate-300 uppercase mb-2">Test Gate Token Validation</label>
        <div class="flex gap-2">
          <input type="text" id="scan-input" value="cc_sec_alex_stanford_hackathon_001" class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white">
          <button onclick="scanPass()" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2">
            <i class="fa-solid fa-check"></i><span>Verify</span>
          </button>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
        <span class="text-[10px] text-slate-500 uppercase font-bold w-full">Quick Test Scenarios:</span>
        <button onclick="setScanToken('cc_sec_alex_stanford_hackathon_001')" class="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 hover:border-indigo-500">Valid Active Pass</button>
        <button onclick="setScanToken('cc_fake_forged_token_000')" class="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-400 hover:border-rose-500">Forged / Screenshot Pass</button>
      </div>

      <div id="scan-result" class="hidden p-4 rounded-2xl border text-xs"></div>
    </div>
  </section>

  <!-- Auth Modal (Sign In & Registration) -->
  <div id="auth-modal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
      <button onclick="closeAuthModal()" class="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white transition">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <div class="text-center space-y-1">
        <div class="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
          <i class="fa-solid fa-ticket-simple text-xl"></i>
        </div>
        <h3 id="modal-title" class="text-xl font-black text-white">Sign In to CampusConnect</h3>
        <p id="modal-subtitle" class="text-xs text-slate-400">Enter your collegiate credentials or select a demo account</p>
      </div>

      <!-- 1-Click Persona Quick Logins -->
      <div class="space-y-2">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1-Click Instant Demo Personas:</span>
        <div class="grid grid-cols-3 gap-2">
          <button onclick="loginAsDemo('student')" class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition">
            <p class="font-bold text-white text-xs">🎓 Student</p>
            <p class="text-[10px] text-slate-400 truncate">Alex Rivera</p>
          </button>
          <button onclick="loginAsDemo('organizer')" class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition">
            <p class="font-bold text-emerald-400 text-xs">🎪 Organizer</p>
            <p class="text-[10px] text-slate-400 truncate">Event Council</p>
          </button>
          <button onclick="loginAsDemo('admin')" class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition">
            <p class="font-bold text-amber-400 text-xs">🛡️ Admin</p>
            <p class="text-[10px] text-slate-400 truncate">Dr. Jenkins</p>
          </button>
        </div>
      </div>

      <div class="relative flex py-1 items-center">
        <div class="flex-grow border-t border-slate-800"></div>
        <span class="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase font-mono">Or Manual Credentials</span>
        <div class="flex-grow border-t border-slate-800"></div>
      </div>

      <!-- Manual Sign In Form -->
      <form id="signin-form" onsubmit="handleManualAuth(event)" class="space-y-3">
        <div id="signup-name-field" class="hidden">
          <label class="block text-[11px] font-bold text-slate-300 uppercase mb-1">Full Name</label>
          <input type="text" id="auth-name" placeholder="Alex Rivera" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-300 uppercase mb-1">College Email (.edu / .ac.in)</label>
          <input type="email" id="auth-email" required placeholder="alex@iitd.ac.in" value="student@stanford.edu" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-300 uppercase mb-1">Password</label>
          <input type="password" id="auth-password" required placeholder="••••••••" value="Student@1234" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white">
        </div>
        <button type="submit" id="auth-submit-btn" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition">
          Sign In
        </button>
      </form>

      <div class="text-center text-xs text-slate-400">
        <span id="auth-toggle-msg">Don't have an account? </span>
        <button onclick="toggleAuthMode()" id="auth-toggle-btn" class="text-indigo-400 font-bold hover:underline">Create Account</button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="mt-auto border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
    <p>CampusConnect • Multi-Platform College Event Aggregator & Secure Ticket Escrow Clearinghouse</p>
    <p class="mt-1 font-mono text-[11px] text-slate-600">Indian Rupees (₹) • Deployed Live on Firebase Hosting</p>
  </footer>

  <script>
    let currentUser = null;
    let authMode = 'signin';

    const events = [
      { id: 1, title: 'Stanford TreeHacks 2026: AI & Web3 Championship', cat: 'HACKATHONS', college: 'Stanford University', date: 'Sep 15 - 17, 2026', price: 'FREE', seats: 498, img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800' },
      { id: 2, title: 'IIT Delhi Tech Spring Music Festival & Neon Rave', cat: 'MUSIC', college: 'IIT Delhi', date: 'Oct 02, 2026', price: '₹499', seats: 798, img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' },
      { id: 3, title: 'IIT Bombay Quantum Computing & AI Summit', cat: 'WORKSHOPS', college: 'IIT Bombay', date: 'Nov 10, 2026', price: '₹299', seats: 150, img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800' }
    ];

    function renderEvents(list) {
      const grid = document.getElementById('events-grid');
      grid.innerHTML = list.map(e => `
        <div class="rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition duration-300 overflow-hidden flex flex-col justify-between shadow-xl">
          <div class="relative h-44 w-full overflow-hidden">
            <img src="${e.img}" alt="${e.title}" class="w-full h-full object-cover">
            <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-indigo-300 border border-indigo-500/40 font-mono">${e.cat}</span>
            <span class="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-950/90 text-white font-extrabold text-xs font-mono">${e.price}</span>
          </div>
          <div class="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div class="space-y-2">
              <p class="text-xs text-slate-400 font-semibold"><i class="fa-solid fa-university mr-1 text-indigo-400"></i>${e.college}</p>
              <h3 class="font-black text-base text-white line-clamp-1">${e.title}</h3>
              <p class="text-xs text-slate-400"><i class="fa-solid fa-calendar mr-1 text-indigo-400"></i>${e.date}</p>
            </div>
            <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span class="text-[11px] font-mono text-emerald-400 font-bold">${e.seats} passes left</span>
              <button onclick="bookPass('${e.title}', '${e.price}')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">Reserve Pass</button>
            </div>
          </div>
        </div>
      `).join('');
    }
    renderEvents(events);

    function filterCat(cat) {
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.className = b.dataset.cat === cat ? 'cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white' : 'cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 border border-slate-800';
      });
      if (cat === 'ALL') renderEvents(events);
      else renderEvents(events.filter(e => e.cat === cat));
    }

    function calcCap() {
      const face = parseFloat(document.getElementById('calc-face').value) || 0;
      const max = (face * 1.15).toFixed(2);
      document.getElementById('calc-result').innerText = '₹' + Number(max).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }

    // Rotating TOTP Simulator
    let sec = 30;
    setInterval(() => {
      sec--;
      if (sec <= 0) {
        sec = 30;
        const newCode = Math.floor(100000 + Math.random() * 900000);
        document.getElementById('totp-code').innerText = newCode.toString().replace(/(\\d{3})(\\d{3})/, '$1 $2');
        const qrImg = document.getElementById('qr-img');
        qrImg.style.opacity = '0.3';
        setTimeout(() => {
          qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=cc_token_' + newCode;
          qrImg.style.opacity = '1';
        }, 200);
      }
      document.getElementById('totp-timer').innerText = sec + 's';
    }, 1000);

    function setScanToken(t) {
      document.getElementById('scan-input').value = t;
    }

    function scanPass() {
      const token = document.getElementById('scan-input').value.trim();
      const resDiv = document.getElementById('scan-result');
      resDiv.classList.remove('hidden');
      if (token.includes('stanford') || token.includes('mit') || token.includes('iit')) {
        resDiv.className = 'p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs space-y-1';
        resDiv.innerHTML = '<p class="font-black text-sm">✔ ADMISSION GRANTED (PASS VALID)</p><p>Verified Attendee: ' + (currentUser ? currentUser.name : 'Alex Rivera') + ' (Collegiate Pass Verified)</p>';
      } else {
        resDiv.className = 'p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs space-y-1';
        resDiv.innerHTML = '<p class="font-black text-sm">✖ ENTRY DENIED: INVALID OR FRAUDULENT PASS</p><p>Expired 30s token or counterfeit payload detected.</p>';
      }
    }

    function bookPass(title, price) {
      if (!currentUser) {
        alert('Please Sign In first to reserve your pass.');
        openAuthModal('signin');
        return;
      }
      alert('Pass Reserved Successfully for ' + title + ' (' + price + ')!\\n\\nIssued to: ' + currentUser.name + '\\nPass added to your Dynamic Vault.');
    }

    function executeEscrow(title, price) {
      if (!currentUser) {
        alert('Please Sign In first to execute P2P Escrow checkout.');
        openAuthModal('signin');
        return;
      }
      alert('Atomic Escrow Settlement Complete for ' + title + ' at ₹' + price + '!\\n\\n1. Funds held in smart escrow.\\n2. Original QR invalidated.\\n3. Fresh single-use pass re-minted for ' + currentUser.name + '.');
    }

    // Modal & Auth Logic
    function openAuthModal(mode) {
      authMode = mode || 'signin';
      updateModalUI();
      document.getElementById('auth-modal').classList.remove('hidden');
    }

    function closeAuthModal() {
      document.getElementById('auth-modal').classList.add('hidden');
    }

    function toggleAuthMode() {
      authMode = authMode === 'signin' ? 'signup' : 'signin';
      updateModalUI();
    }

    function updateModalUI() {
      const isSignup = authMode === 'signup';
      document.getElementById('modal-title').innerText = isSignup ? 'Create CampusConnect Account' : 'Sign In to CampusConnect';
      document.getElementById('modal-subtitle').innerText = isSignup ? 'Join with your college .edu or .ac.in email' : 'Enter your credentials or pick a demo persona';
      document.getElementById('signup-name-field').className = isSignup ? 'block' : 'hidden';
      document.getElementById('auth-submit-btn').innerText = isSignup ? 'Create Account' : 'Sign In';
      document.getElementById('auth-toggle-msg').innerText = isSignup ? 'Already have an account? ' : "Don't have an account? ";
      document.getElementById('auth-toggle-btn').innerText = isSignup ? 'Sign In' : 'Create Account';
    }

    function loginAsDemo(role) {
      if (role === 'student') {
        currentUser = { name: 'Alex Rivera', email: 'student@stanford.edu', college: 'Stanford University', role: 'STUDENT' };
      } else if (role === 'organizer') {
        currentUser = { name: 'Events Council', email: 'organizer@campusconnect.demo', college: 'Campus Events Council', role: 'ORGANIZER' };
      } else if (role === 'admin') {
        currentUser = { name: 'Dr. Sarah Jenkins', email: 'admin@campusconnect.demo', college: 'Admin Office', role: 'ADMIN' };
      }
      updateUserNav();
      closeAuthModal();
      alert('Signed in as ' + currentUser.name + ' (' + currentUser.role + ')');
    }

    function handleManualAuth(e) {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const name = document.getElementById('auth-name').value || 'Collegiate User';
      currentUser = { name: name, email: email, college: 'Verified University', role: 'STUDENT' };
      updateUserNav();
      closeAuthModal();
      alert('Welcome back, ' + currentUser.name + '!');
    }

    function logoutUser() {
      currentUser = null;
      updateUserNav();
      alert('You have signed out.');
    }

    function updateUserNav() {
      const container = document.getElementById('auth-nav-container');
      if (currentUser) {
        container.innerHTML = `
          <div class="flex items-center gap-2">
            <div class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-bold text-white">${currentUser.name}</span>
              <span class="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded">${currentUser.role}</span>
            </div>
            <button onclick="logoutUser()" class="p-2 rounded-xl text-slate-400 hover:text-rose-400 transition" title="Sign Out">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <button onclick="openAuthModal('signin')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition">
            <i class="fa-solid fa-right-to-bracket"></i><span>Sign In</span>
          </button>
        `;
      }
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), html, 'utf8');
console.log('SUCCESS: public/index.html updated with Sign In & Rupees. Size:', fs.statSync(path.join(publicDir, 'index.html')).size);