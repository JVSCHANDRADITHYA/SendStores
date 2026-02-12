const API_BASE = "http://localhost:4000";

export const fetchStores = async () => {
  const res = await fetch(`${API_BASE}/stores`);
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
};

export const createStore = async (engine) => {
  const res = await fetch(`${API_BASE}/stores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ engine }),
  });
  if (!res.ok) throw new Error("Failed to create store");
  return res.json();
};

export const deleteStore = async (id) => {
  const res = await fetch(`${API_BASE}/stores/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete store");
};
