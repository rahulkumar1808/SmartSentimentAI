const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
async function request(path, options={}) {
  const response = await fetch(`${API}${path}`, options);
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.detail || message; } catch {}
    throw new Error(message);
  }
  return response;
}
export const api = {
  status: async () => (await request("/")).json(),
  analyze: async text => (await request("/analyze", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text})})).json(),
  history: async () => (await request("/history")).json(),
  stats: async () => (await request("/stats")).json(),
  metrics: async () => (await request("/metrics")).json(),
  clear: async () => (await request("/history", {method:"DELETE"})).json(),
  exportUrl: `${API}/export`
};
