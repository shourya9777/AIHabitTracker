import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// The browser talks to the backend API directly (same as the old
// Vite app did with VITE_API_URL / axios). We just hand this value
// down to every EJS view so client-side <script> tags know where to
// call.
const API_URL = process.env.API_URL || "http://localhost:8000/api";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Make the API base URL and a couple of globals available to every
// EJS template without having to pass them in on every render() call.
app.use((req, res, next) => {
  res.locals.API_URL = API_URL;
  res.locals.currentPath = req.path;
  next();
});

const page = (view) => (req, res) => res.render(view);

// Public / guest pages
app.get("/", page("pages/landing"));
app.get("/login", page("pages/login"));
app.get("/register", page("pages/register"));

// Authenticated pages.
// NOTE: the JWT lives in localStorage (same as the original React app),
// so the server can't check auth itself — each of these views loads
// /js/auth-guard.js, which verifies the token against GET /auth/me and
// redirects to /login if it's missing/invalid. This mirrors the old
// <ProtectedRoute> component.
app.get("/dashboard", page("pages/dashboard"));
app.get("/habits", page("pages/habits"));
app.get("/weekly", page("pages/weekly"));
app.get("/insights", page("pages/insights"));
app.get("/stats", page("pages/stats"));

// Anything unmatched -> landing (same as the old <Route path="*"> redirect)
app.use((req, res) => res.redirect("/"));

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
});
