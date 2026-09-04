const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const loginDir = path.join(publicDir, 'login');
const registerDir = path.join(publicDir, 'register');
const profileDir = path.join(publicDir, 'profile');

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(loginDir, { recursive: true });
fs.mkdirSync(registerDir, { recursive: true });
fs.mkdirSync(profileDir, { recursive: true });

// --- 1. DEDICATED PROFILE PAGE (public/profile/index.html) ---
const profileHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student & Collegiate Profile | CampusConnect</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">

  <!-- Top Navbar -->
  <header class="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <i class="fa-solid fa-ticket-simple text-lg"></i>
          </div>
          <div>
            <span class="font-black text-lg text-white tracking-tight">Campus<span class="text-indigo-400">Connect</span></span>
            <span class="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">₹ INR</span>
          </div>
        </a>
      </div>

      <div class="flex items-center gap-3">
        <a href="/" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition">
          <i class="fa-solid fa-house"></i><span>Home / Events</span>
        </a>
        <button onclick="logout()" class="px-4 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition">
          <i class="fa-solid fa-arrow-right-from-bracket"></i><span>Sign Out</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Profile Content Container -->
  <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
    
    <!-- Profile Header Card -->
    <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-2xl shadow-indigo-500/30 flex-shrink-0">
            <div class="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-indigo-300 text-2xl font-black font-mono" id="avatar-initials">
              AR
            </div>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-2xl sm:text-3xl font-black text-white" id="profile-name">Alex Rivera</h1>
              <span id="profile-role-badge" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                STUDENT
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                <i class="fa-solid fa-circle-check text-indigo-400"></i> Verified .EDU / .AC.IN
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <i class="fa-solid fa-university text-indigo-400"></i>
              <span id="profile-college-header">Indian Institute of Technology Delhi (IIT Delhi)</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button onclick="editProfileModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition">
            <i class="fa-solid fa-user-pen"></i><span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2 Column Details Grid: Personal Details & College Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- Column 1: Personal Details -->
      <div class="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
        <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div class="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <i class="fa-solid fa-id-card"></i>
          </div>
          <h2 class="text-base font-extrabold text-white">Personal Details</h2>
        </div>

        <div class="space-y-3.5 text-xs">
          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Full Name:</span>
            <span class="font-bold text-white text-sm" id="detail-name">Alex Rivera</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Collegiate Email:</span>
            <span class="font-mono text-indigo-300 font-bold" id="detail-email">alex.rivera@iitd.ac.in</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Contact Number:</span>
            <span class="font-mono text-slate-200 font-bold" id="detail-phone">+91 98765 43210</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Collegiate ID / Roll No:</span>
            <span class="font-mono text-emerald-400 font-bold" id="detail-roll">2023CS10842</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Account Status:</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <i class="fa-solid fa-shield-halved mr-1"></i>KYC Verified
            </span>
          </div>
        </div>
      </div>

      <!-- Column 2: College & Academic Details -->
      <div class="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
        <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div class="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <h2 class="text-base font-extrabold text-white">College & Academic Details</h2>
        </div>

        <div class="space-y-3.5 text-xs">
          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">University / College:</span>
            <span class="font-bold text-white text-right" id="detail-college">Indian Institute of Technology Delhi</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Department / Major:</span>
            <span class="font-bold text-indigo-300 text-right" id="detail-dept">B.Tech Computer Science & Engg</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Academic Batch / Year:</span>
            <span class="font-mono text-slate-200 font-bold" id="detail-batch">Class of 2027 (3rd Year)</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Campus Location:</span>
            <span class="font-bold text-slate-300" id="detail-location">Hauz Khas, New Delhi, India</span>
          </div>

          <div class="flex justify-between items-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <span class="text-slate-400 font-medium">Anti-Scalping Karma:</span>
            <span class="font-mono font-bold text-emerald-400">100 / 100 (Tier 1 Trusted)</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Active Tickets & Escrow Passes Vault -->
    <div class="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <i class="fa-solid fa-wallet"></i>
          </div>
          <div>
            <h2 class="text-base font-extrabold text-white">Your Dynamic Ticket Vault (₹ INR)</h2>
            <p class="text-[11px] text-slate-400">Cryptographically signed passes with rotating 30s TOTP tokens</p>
          </div>
        </div>
        <a href="/#gate-pass" class="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
          View Active QR <i class="fa-solid fa-arrow-right ml-1"></i>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="font-mono text-indigo-400 font-bold text-[11px]">#CC-TKT-1001-A1</span>
              <h3 class="font-black text-white text-sm mt-0.5">Stanford TreeHacks 2026</h3>
              <p class="text-[11px] text-slate-400">General Hacker Pass (₹0 FREE)</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">ACTIVE PASS</span>
          </div>
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">Valid: Sep 15 - 17, 2026</span>
            <a href="/#gate-pass" class="font-bold text-indigo-400 hover:underline">Show 30s Pass</a>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="font-mono text-indigo-400 font-bold text-[11px]">#CC-TKT-2002-B2</span>
              <h3 class="font-black text-white text-sm mt-0.5">IIT Delhi Tech Fest & Rave</h3>
              <p class="text-[11px] text-slate-400">Early Bird Pass (Face: ₹499)</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">LISTED FOR RESALE (₹549)</span>
          </div>
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">15% Cap: Max ₹573.85</span>
            <a href="/#clearinghouse" class="font-bold text-emerald-400 hover:underline">View Escrow Listing</a>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- Edit Profile Modal -->
  <div id="edit-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-black text-white">Edit Collegiate Profile</h3>
        <button onclick="closeEditModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <form onsubmit="saveProfileEdits(event)" class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-300 uppercase mb-1">Full Name</label>
          <input type="text" id="edit-name" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
        </div>
        <div>
          <label class="block font-bold text-slate-300 uppercase mb-1">College / University Name</label>
          <input type="text" id="edit-college" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Department / Major</label>
            <input type="text" id="edit-dept" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Roll Number / Student ID</label>
            <input type="text" id="edit-roll" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Batch / Year</label>
            <input type="text" id="edit-batch" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Phone Number</label>
            <input type="text" id="edit-phone" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-300 uppercase mb-1">Campus City / Location</label>
          <input type="text" id="edit-location" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
        </div>
        <div class="pt-2 flex justify-end gap-2">
          <button type="button" onclick="closeEditModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
          <button type="submit" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Save Profile</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
    <p>CampusConnect • Collegiate Identity & Anti-Scalping Escrow Platform</p>
  </footer>

  <script>
    // Default fallback student data
    const defaultUser = {
      name: 'Alex Rivera',
      email: 'student@stanford.edu',
      phone: '+91 98765 43210',
      roll: '2023CS10842',
      college: 'Indian Institute of Technology Delhi (IIT Delhi)',
      dept: 'B.Tech Computer Science & Engineering',
      batch: 'Class of 2027 (3rd Year)',
      location: 'Hauz Khas, New Delhi, India',
      role: 'STUDENT'
    };

    let user = defaultUser;

    try {
      const stored = localStorage.getItem('campus_user');
      if (stored) {
        user = { ...defaultUser, ...JSON.parse(stored) };
      } else {
        localStorage.setItem('campus_user', JSON.stringify(defaultUser));
      }
    } catch(e) {}

    function renderProfile() {
      document.getElementById('profile-name').innerText = user.name || 'Alex Rivera';
      document.getElementById('avatar-initials').innerText = (user.name || 'AR').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      document.getElementById('profile-role-badge').innerText = user.role || 'STUDENT';
      document.getElementById('profile-college-header').innerText = user.college || 'Indian Institute of Technology Delhi';

      document.getElementById('detail-name').innerText = user.name || 'Alex Rivera';
      document.getElementById('detail-email').innerText = user.email || 'alex.rivera@iitd.ac.in';
      document.getElementById('detail-phone').innerText = user.phone || '+91 98765 43210';
      document.getElementById('detail-roll').innerText = user.roll || '2023CS10842';

      document.getElementById('detail-college').innerText = user.college || 'Indian Institute of Technology Delhi';
      document.getElementById('detail-dept').innerText = user.dept || 'B.Tech Computer Science & Engineering';
      document.getElementById('detail-batch').innerText = user.batch || 'Class of 2027';
      document.getElementById('detail-location').innerText = user.location || 'Hauz Khas, New Delhi';
    }
    renderProfile();

    function editProfileModal() {
      document.getElementById('edit-name').value = user.name || '';
      document.getElementById('edit-college').value = user.college || '';
      document.getElementById('edit-dept').value = user.dept || '';
      document.getElementById('edit-roll').value = user.roll || '';
      document.getElementById('edit-batch').value = user.batch || '';
      document.getElementById('edit-phone').value = user.phone || '';
      document.getElementById('edit-location').value = user.location || '';
      document.getElementById('edit-modal').classList.remove('hidden');
    }

    function closeEditModal() {
      document.getElementById('edit-modal').classList.add('hidden');
    }

    function saveProfileEdits(e) {
      e.preventDefault();
      user.name = document.getElementById('edit-name').value;
      user.college = document.getElementById('edit-college').value;
      user.dept = document.getElementById('edit-dept').value;
      user.roll = document.getElementById('edit-roll').value;
      user.batch = document.getElementById('edit-batch').value;
      user.phone = document.getElementById('edit-phone').value;
      user.location = document.getElementById('edit-location').value;

      localStorage.setItem('campus_user', JSON.stringify(user));
      renderProfile();
      closeEditModal();
      alert('Profile updated successfully!');
    }

    function logout() {
      localStorage.removeItem('campus_user');
      alert('Signed out successfully.');
      window.location.href = '/login/';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(profileDir, 'index.html'), profileHtml, 'utf8');
console.log('SUCCESS: public/profile/index.html created.');