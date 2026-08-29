// Replaces the `submit` handler + useAuth().register() in pages/Register.jsx
document.addEventListener("DOMContentLoaded", () => {
  window.AuthGuard.redirectIfLoggedIn();

  const form = document.getElementById("register-form");
  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const errorBox = document.getElementById("register-error");
  const submitBtn = document.getElementById("register-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("hidden");

    if (passwordInput.value.length < 6) {
      errorBox.textContent = "Password must be at least 6 characters";
      errorBox.classList.remove("hidden");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const res = await window.api.post("/auth/register", {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      errorBox.textContent = err.response?.data?.message || "Registration failed";
      errorBox.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create account";
    }
  });
});
