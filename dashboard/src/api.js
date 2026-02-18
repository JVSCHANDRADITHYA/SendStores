const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Not authenticated");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const fetchStores = async () => {
  const res = await fetch(`${API_BASE}/stores`, {
    headers: authHeaders(),
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
};

export const createStore = async (engine) => {
  const res = await fetch(`${API_BASE}/stores`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ engine }),
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error("Failed to create store");
  return res.json();
};

export const deleteStore = async (id) => {
  const res = await fetch(`${API_BASE}/stores/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error("Failed to delete store");
};
