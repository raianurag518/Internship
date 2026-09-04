const fs = require('fs');
const path = require('path');

const loginDir = path.join(process.cwd(), 'public', 'login');
const registerDir = path.join(process.cwd(), 'public', 'register');

const loginHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In | CampusConnect</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
  <div class="w-full max-w-md space-y-6">
    <div class="text-center space-y-2">
      <a href="/" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition">
        <i class="fa-solid fa-arrow-left"></i><span>Back to Home</span>
      </a>
      <div class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
        <i class="fa-solid fa-ticket-simple text-2xl"></i>
      </div>
      <h1 class="text-3xl font-black text-white">Sign In to CampusConnect</h1>
      <p class="text-xs text-slate-400">Select a 1-click collegiate persona or enter your student email</p>
    </div>

    <div class="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
      
      <!-- 1-Click Instant Collegiate Logins -->
      <div class="space-y-2">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1-Click Instant Collegiate Login:</span>
        <div class="grid grid-cols-3 gap-2">
          <button onclick="loginAs('student')" class="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition hover:scale-105">
            <p class="font-black text-white text-xs">🎓 Student</p>
            <p class="text-[10px] text-slate-400">IIT Delhi</p>
          </button>
          <button onclick="loginAs('organizer')" class="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition hover:scale-105">
            <p class="font-black text-emerald-400 text-xs">🎪 Host</p>
            <p class="text-[10px] text-slate-400">Council</p>
          </button>
          <button onclick="loginAs('admin')" class="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition hover:scale-105">
            <p class="font-black text-amber-400 text-xs">🛡️ Admin</p>
            <p class="text-[10px] text-slate-400">Dr. Jenkins</p>
          </button>
        </div>
      </div>

      <div class="relative flex py-1 items-center">
        <div class="flex-grow border-t border-slate-800"></div>
        <span class="flex-shrink mx-3 text-[10px] text-slate-500 font-bold uppercase font-mono">Or Manual Credentials</span>
        <div class="flex-grow border-t border-slate-800"></div>
      </div>

      <!-- Manual Form -->
      <form onsubmit="handleManualLogin(event)" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Collegiate Email (.edu / .ac.in)</label>
          <input type="email" id="email" required placeholder="alex@iitd.ac.in" value="alex.rivera@iitd.ac.in" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-xs text-white">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label>
          <input type="password" id="password" required value="Student@1234" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-xs text-white">
        </div>
        <button type="submit" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition">
          Sign In & View Profile
        </button>
      </form>

      <div class="text-center text-xs text-slate-400">
        <span>Don't have an account? </span>
        <a href="/register/" class="text-indigo-400 font-bold hover:underline">Create Account</a>
      </div>
    </div>
  </div>

  <script>
    function loginAs(role) {
      let user = {
        name: 'Alex Rivera',
        email: 'alex.rivera@iitd.ac.in',
        phone: '+91 98765 43210',
        roll: '2023CS10842',
        college: 'Indian Institute of Technology Delhi (IIT Delhi)',
        dept: 'B.Tech Computer Science & Engineering',
        batch: 'Class of 2027 (3rd Year)',
        location: 'Hauz Khas, New Delhi, India',
        role: 'STUDENT'
      };

      if (role === 'organizer') {
        user = {
          name: 'Priya Sharma (Events Council)',
          email: 'organizer@campusconnect.demo',
          phone: '+91 98111 22233',
          roll: 'ORG-IITD-2026',
          college: 'IIT Delhi Student Affairs & Cultural Council',
          dept: 'Campus Events & Programming Board',
          batch: 'Lead Coordinator',
          location: 'New Delhi, India',
          role: 'ORGANIZER'
        };
      } else if (role === 'admin') {
        user = {
          name: 'Dr. Sarah Jenkins',
          email: 'admin@campusconnect.demo',
          phone: '+91 98000 11122',
          roll: 'ADM-EXEC-01',
          college: 'Office of Collegiate Platform Administration',
          dept: 'Trust & Safety Escrow Board',
          batch: 'Lead Administrator',
          location: 'University Secretariat',
          role: 'ADMIN'
        };
      }

      localStorage.setItem('campus_user', JSON.stringify(user));
      alert('Signed in successfully as ' + user.name + '! Redirecting to your Profile...');
      window.location.href = '/profile/';
    }

    function handleManualLogin(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const user = {
        name: 'Alex Rivera',
        email: email,
        phone: '+91 98765 43210',
        roll: '2023CS10842',
        college: 'Indian Institute of Technology Delhi (IIT Delhi)',
        dept: 'B.Tech Computer Science & Engineering',
        batch: 'Class of 2027',
        location: 'Hauz Khas, New Delhi',
        role: 'STUDENT'
      };
      localStorage.setItem('campus_user', JSON.stringify(user));
      alert('Welcome back, ' + user.name + '! Redirecting to your Profile...');
      window.location.href = '/profile/';
    }
  </script>
</body>
</html>`;

const registerHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register | CampusConnect</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
  <div class="w-full max-w-lg space-y-6">
    <div class="text-center space-y-2">
      <a href="/" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition">
        <i class="fa-solid fa-arrow-left"></i><span>Back to Home</span>
      </a>
      <div class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
        <i class="fa-solid fa-user-plus text-2xl"></i>
      </div>
      <h1 class="text-3xl font-black text-white">Create Collegiate Profile</h1>
      <p class="text-xs text-slate-400">Join with your college details to unlock primary & P2P ticket passes</p>
    </div>

    <div class="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
      <form onsubmit="handleRegister(event)" class="space-y-3 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Full Name</label>
            <input type="text" id="reg-name" required placeholder="Alex Rivera" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Phone Number</label>
            <input type="tel" id="reg-phone" required placeholder="+91 98765 43210" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-300 uppercase mb-1">College / University Name</label>
          <input type="text" id="reg-college" required placeholder="Indian Institute of Technology Delhi (IIT Delhi)" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Department / Degree</label>
            <input type="text" id="reg-dept" required placeholder="B.Tech Computer Science" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Roll No / Student ID</label>
            <input type="text" id="reg-roll" required placeholder="2023CS10842" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-300 uppercase mb-1">Collegiate Email (.edu / .ac.in)</label>
          <input type="email" id="reg-email" required placeholder="alex@iitd.ac.in" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
        </div>

        <div>
          <label class="block font-bold text-slate-300 uppercase mb-1">Password</label>
          <input type="password" id="reg-password" required minlength="6" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white">
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition">
          Create Account & Access Profile
        </button>
      </form>

      <div class="text-center text-xs text-slate-400">
        <span>Already have an account? </span>
        <a href="/login/" class="text-indigo-400 font-bold hover:underline">Sign In</a>
      </div>
    </div>
  </div>

  <script>
    function handleRegister(e) {
      e.preventDefault();
      const user = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        college: document.getElementById('reg-college').value,
        dept: document.getElementById('reg-dept').value,
        roll: document.getElementById('reg-roll').value,
        email: document.getElementById('reg-email').value,
        batch: 'Class of 2027',
        location: 'Campus Residence',
        role: 'STUDENT'
      };
      localStorage.setItem('campus_user', JSON.stringify(user));
      alert('Collegiate Account created successfully! Redirecting to your Profile...');
      window.location.href = '/profile/';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(loginDir, 'index.html'), loginHtml, 'utf8');
fs.writeFileSync(path.join(registerDir, 'index.html'), registerHtml, 'utf8');
console.log('SUCCESS: Login and Register updated.');