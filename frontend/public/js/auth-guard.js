// Replaces context/AuthContext.jsx + components/ProtectedRoute.jsx.
//
// The JWT + user still live in localStorage exactly like the original
// app (server-side sessions would be a bigger architectural change
// than "swap React for EJS" calls for). Every protected page includes
// this script before its own page script and calls
// `AuthGuard.require()` on load; guest pages (landing/login/register)
// call `AuthGuard.redirectIfLoggedIn()` instead.
const AuthGuard = (() => {
  function getStoredUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  function updateUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  // For protected pages: verify the token, redirect to /login if
  // missing/invalid. Resolves with the confirmed user on success.
  async function require() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login?from=" + encodeURIComponent(window.location.pathname);
      return null;
    }
    try {
      const res = await window.api.get("/auth/me");
      updateUser(res.data.user);
      renderUserChrome(res.data.user);
      return res.data.user;
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return null;
    }
  }

  // For guest pages: if already logged in, go straight to /dashboard
  // (mirrors `if (user) return <Navigate to="/dashboard" />`).
  function redirectIfLoggedIn() {
    const token = localStorage.getItem("token");
    if (token) window.location.href = "/dashboard";
  }

  // Fills in the little bits of user chrome shared by the sidebar /
  // mobile nav (name, email, avatar initial) once we know who's logged in.
  function renderUserChrome(user) {
    document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = user.name || ""));
    document.querySelectorAll("[data-user-email]").forEach((el) => (el.textContent = user.email || ""));
    document.querySelectorAll("[data-user-avatar]").forEach((el) => {
      el.textContent = user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : "U");
    });
  }

  return { getStoredUser, logout, updateUser, require, redirectIfLoggedIn };
})();

window.AuthGuard = AuthGuard;
