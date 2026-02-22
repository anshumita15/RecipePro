// auth.js – Login / Signup logic (localStorage-based for demo)

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to app
  const user = getUser();
  if (user) {
    window.location.href = 'app.html';
    return;
  }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Enter key support
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
      if (activeTab === 'signin') handleSignIn();
      else handleSignUp();
    }
  });
});

function getUsers() {
  return JSON.parse(localStorage.getItem('rp_users') || '[]');
}

function getUser() {
  return JSON.parse(sessionStorage.getItem('rp_current_user') || localStorage.getItem('rp_session') || 'null');
}

function handleSignIn() {
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const errEl = document.getElementById('signin-error');
  errEl.textContent = '';

  if (!email || !password) {
    errEl.textContent = 'Please fill in all fields.';
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    // Demo mode: if no users exist, auto-create and sign in
    const allUsers = getUsers();
    if (allUsers.length === 0 || !allUsers.find(u => u.email === email)) {
      errEl.textContent = 'No account found. Please create an account first.';
      return;
    }
    errEl.textContent = 'Incorrect email or password.';
    return;
  }

  const remember = document.getElementById('remember')?.checked;
  const session = { name: user.name, email: user.email };
  sessionStorage.setItem('rp_current_user', JSON.stringify(session));
  if (remember) localStorage.setItem('rp_session', JSON.stringify(session));

  window.location.href = 'app.html';
}

function handleSignUp() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const errEl = document.getElementById('signup-error');
  errEl.textContent = '';

  if (!name || !email || !password || !confirm) {
    errEl.textContent = 'Please fill in all fields.';
    return;
  }
  if (!email.includes('@')) {
    errEl.textContent = 'Please enter a valid email.';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    return;
  }
  if (password !== confirm) {
    errEl.textContent = 'Passwords do not match.';
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    errEl.textContent = 'An account with this email already exists.';
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem('rp_users', JSON.stringify(users));

  const session = { name, email };
  sessionStorage.setItem('rp_current_user', JSON.stringify(session));

  window.location.href = 'app.html';
}

function signOut() {
  sessionStorage.removeItem('rp_current_user');
  localStorage.removeItem('rp_session');
  window.location.href = 'index.html';
}
