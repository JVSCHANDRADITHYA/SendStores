const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// In-memory store registry (Round-1 OK)
const stores = {}; // id -> { id, engine, status, url, createdAt, release, namespace }

// Helpers
const run = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });

const genId = () => `store-${Math.random().toString(36).slice(2, 8)}`;

// Routes
app.get("/stores", (req, res) => {
  res.json(Object.values(stores));
});

app.post("/stores", async (req, res) => {
  const { engine = "woocommerce" } = req.body;

  const id = genId();
  const namespace = id;
  const release = id;
  const domain = `${id}.localtest.me`;

  stores[id] = {
    id,
    engine,
    status: "Provisioning",
    url: `http://${domain}`,
    createdAt: new Date().toISOString(),
    release,
    namespace,
  };

  res.status(202).json(stores[id]);

  try {
    // Namespace
    

    if (engine === "woocommerce") {
      // Helm install WooCommerce
        await run(
        [
            `helm install ${release} ../helm/woocommerce`,
            `--namespace ${namespace}`,
            `--create-namespace`,
            `--set store.name=${id}`,
            `--set store.domain=${domain}`,
        ].join(" ")
        );

    } else {
      // Medusa stub (chart exists, minimal install)
      await run(
        [
          `helm install ${release} ./helm/medusa`,
          `--namespace ${namespace}`,
          `--set store.name=${id}`,
          `--set store.domain=${domain}`,
        ].join(" ")
      );
    }

    // Simple readiness wait (demo-safe)
    setTimeout(() => {
      if (stores[id]) stores[id].status = "Ready";
    }, 30000);
  } catch (e) {
    if (stores[id]) stores[id].status = "Failed";
    console.error("Provisioning failed:", e);
  }
});

app.delete("/stores/:id", async (req, res) => {
  const { id } = req.params;
  const s = stores[id];
  if (!s) return res.status(404).json({ error: "Not found" });

  try {
    await run(`helm uninstall ${s.release} -n ${s.namespace}`);
  } catch (_) {}

  try {
    await run(`kubectl delete namespace ${s.namespace}`);
  } catch (_) {}

  delete stores[id];
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
