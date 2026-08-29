// Replaces the `submit` handler + useAuth().login() in pages/Login.jsx
document.addEventListener("DOMContentLoaded", () => {
  window.AuthGuard.redirectIfLoggedIn(); // `if (user) return <Navigate to="/dashboard" />`

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const errorBox = document.getElementById("login-error");
  const submitBtn = document.getElementById("login-submit");

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    try {
      const res = await window.api.post("/auth/login", {
        email: emailInput.value,
        password: passwordInput.value,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = from || "/dashboard";
    } catch (err) {
      errorBox.textContent = err.response?.data?.message || "Login failed";
      errorBox.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign in";
    }
  });
});
