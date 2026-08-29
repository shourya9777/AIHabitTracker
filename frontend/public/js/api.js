// Vanilla fetch replacement for the old axios instance in
// frontend/src/api/axios.js. Same behaviour:
//  - baseURL from an env-driven value (window.__API_URL__)
//  - attaches the JWT from localStorage as a Bearer token
//  - on a 401 (outside /login, /register, /), clears storage and
//    bounces to /login
const API_BASE = window.__API_URL__ || "http://localhost:8000/api";

function buildUrl(url, params) {
  const full = new URL(API_BASE.replace(/\/$/, "") + url, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) full.searchParams.set(k, v);
    });
  }
  return full.toString();
}

async function request(method, url, { data, params } = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(url, params), {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    const path = window.location.pathname;
    if (path !== "/login" && path !== "/register" && path !== "/") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const err = new Error((body && body.message) || res.statusText);
    err.response = { status: res.status, data: body };
    throw err;
  }

  return { data: body, status: res.status };
}

const api = {
  get: (url, opts) => request("GET", url, opts),
  post: (url, data, opts = {}) => request("POST", url, { ...opts, data }),
  put: (url, data, opts = {}) => request("PUT", url, { ...opts, data }),
  delete: (url, opts) => request("DELETE", url, opts),
};

window.api = api;
