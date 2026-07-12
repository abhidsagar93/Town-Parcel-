/* ============================================================
   Town Parcel Admin — Auth Guard
   Include on every protected admin page AFTER supabase-client.js.
   Redirects to login.html if there is no active session, and
   keeps the page hidden until that check completes (so a
   logged-out visitor never sees a flash of admin data).
   ============================================================ */

(function () {
  document.documentElement.classList.add('auth-checking');
})();

async function requireAdminAuth() {
  const { data: { session }, error } = await sb.auth.getSession();

  if (error || !session) {
    window.location.replace('login.html');
    return null;
  }

  document.documentElement.classList.remove('auth-checking');

  const emailEls = document.querySelectorAll('[data-admin-email]');
  emailEls.forEach(el => { el.textContent = session.user.email; });

  return session;
}

// If the session is lost while a page is open (token expired, signed
// out in another tab, etc.), bounce to login immediately.
sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    if (!window.location.pathname.endsWith('login.html') &&
        !window.location.pathname.endsWith('reset-password.html')) {
      window.location.replace('login.html');
    }
  }
});

async function adminLogout() {
  await sb.auth.signOut();
  window.location.replace('login.html');
}

// Kick off the check as soon as this script runs.
requireAdminAuth();
