import { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000"; // backend (we'll create this next)

function App() {
  const [stores, setStores] = useState([]);
  const [engine, setEngine] = useState("woocommerce");
  const [loading, setLoading] = useState(false);

  const fetchStores = async () => {
    const res = await fetch(`${API_BASE}/stores`);
    const data = await res.json();
    setStores(data);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const createStore = async () => {
    setLoading(true);
    await fetch(`${API_BASE}/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engine }),
    });
    setLoading(false);
    fetchStores();
  };

  const deleteStore = async (id) => {
    await fetch(`${API_BASE}/stores/${id}`, { method: "DELETE" });
    fetchStores();
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>Store Provisioning Dashboard</h2>

      <div style={{ marginBottom: 20 }}>
        <select value={engine} onChange={(e) => setEngine(e.target.value)}>
          <option value="woocommerce">WooCommerce</option>
          <option value="medusa">MedusaJS</option>
        </select>

        <button
          onClick={createStore}
          disabled={loading}
          style={{ marginLeft: 10 }}
        >
          {loading ? "Provisioning..." : "Create Store"}
        </button>
      </div>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Store ID</th>
            <th>Engine</th>
            <th>Status</th>
            <th>URL</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.engine}</td>
              <td>{s.status}</td>
              <td>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.url}
                </a>
              </td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => deleteStore(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
