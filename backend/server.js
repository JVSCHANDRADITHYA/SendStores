const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const { createClient } = require("redis");


const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

/* =========================
   Redis (Control Plane DB)
   ========================= */
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});


redis.on("error", (err) => {
  console.error("Redis error", err);
});

(async () => {
  await redis.connect();
  console.log("Connected to Redis");
})();

/* =========================
   Helpers
   ========================= */
const run = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });

const genId = () => `store-${Math.random().toString(36).slice(2, 8)}`;

const storeKey = (id) => `store:${id}`;

/* =========================
   Routes
   ========================= */

/**
 * LIST STORES
 * Source of truth: Redis
 */
app.get("/stores", async (req, res) => {
  try {
    const keys = await redis.keys("store:*");
    const stores = await Promise.all(keys.map((k) => redis.hGetAll(k)));
    res.json(stores);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

/**
 * CREATE STORE
 * Idempotent at control-plane level
 */
app.post("/stores", async (req, res) => {
  const { engine = "woocommerce" } = req.body;

  const id = genId();
  const namespace = id;
  const release = id;
  const domain = `${id}.localtest.me`;

  const store = {
    id,
    engine,
    status: "Provisioning",
    url: `http://${domain}`,
    createdAt: new Date().toISOString(),
    namespace,
    release,
  };

  // Persist immediately
  await redis.hSet(storeKey(id), store);

  res.status(202).json(store);

  try {
    const chartPath =
      engine === "woocommerce"
        ? "/helm/woocommerce"
        : "/helm/medusa";

    await run(
      [
        `helm install ${release} ${chartPath}`,
        `--namespace ${namespace}`,
        `--create-namespace`,
        `--set store.name=${id}`,
        `--set store.domain=${domain}`,
      ].join(" ")
    );

    // Mark Ready after stabilization window
    setTimeout(async () => {
      await redis.hSet(storeKey(id), { status: "Ready" });
    }, 30000);
  } catch (e) {
    await redis.hSet(storeKey(id), { status: "Failed" });
    console.error("Provisioning failed:", e);
  }
});

/**
 * DELETE STORE
 * Strong cleanup guarantees
 */
app.delete("/stores/:id", async (req, res) => {
  const { id } = req.params;

  const store = await redis.hGetAll(storeKey(id));
  if (!store || !store.id) {
    return res.status(404).json({ error: "Store not found" });
  }

  try {
    await run(`helm uninstall ${store.release} -n ${store.namespace}`);
  } catch (_) {}

  try {
    await run(`kubectl delete namespace ${store.namespace}`);
  } catch (_) {}

  await redis.del(storeKey(id));
  res.json({ ok: true });
});

/* =========================
   Server
   ========================= */
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
