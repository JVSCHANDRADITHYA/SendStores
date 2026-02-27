require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const { createClient } = require("redis");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

/* =========================
   Auth config
   ========================= */
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_USER || !ADMIN_PASS || !JWT_SECRET) {
  console.error("FATAL: Missing auth env vars");
  process.exit(1);
}

const namespaceExists = async (ns) => {
  try {
    await run(`kubectl get ns ${ns}`);
    return true;
  } catch {
    return false;
  }
};

/* =========================
   Redis (Control Plane DB)
   ========================= */
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

(async () => {
  try {
    await redis.connect();
    console.log("Connected to Redis");
  } catch (e) {
    console.error("FATAL: Redis not reachable");
    process.exit(1);
  }
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
 * LOGIN
 */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USER) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // deterministic compare
  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});

/**
 * LIST STORES
 */
app.get("/stores", authMiddleware, async (req, res) => {
  try {
    const keys = await redis.keys("store:*");
    const stores = [];

    for (const key of keys) {
      const store = await redis.hGetAll(key);

      if (!store?.namespace) continue;

      const exists = await namespaceExists(store.namespace);
      
      if (!exists && store.status !== "Provisioning") {
        await redis.hSet(key, {
          status: "Orphaned",
          orphanedAt: new Date().toISOString(),
        });

        stores.push({
          ...store,
          status: "Orphaned",
        });

        continue;
      }

      stores.push(store);
    }

    res.json(stores);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

/**
 * CREATE STORE
 */
app.post("/stores", authMiddleware, async (req, res) => {
  const { engine = "woocommerce" } = req.body;

  const id = genId();
  const namespace = id;
  const release = id;
  const domain = `${id}.${process.env.BASE_DOMAIN}`;

  const store = {
    id,
    engine,
    status: "Provisioning",
    url: `http://${domain}`,
    createdAt: new Date().toISOString(),
    namespace,
    release,
  };

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
 */
app.delete("/stores/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const store = await redis.hGetAll(storeKey(id));

  if (!store?.id) {
    return res.status(404).json({ error: "Store not found" });
  }

  await redis.hSet(storeKey(id), { status: "Deleting" });

  try {
    await run(`helm uninstall ${store.release} -n ${store.namespace}`);
  } catch {}

  try {
    await run(`kubectl delete ns ${store.namespace}`);
  } catch {}

  await redis.del(storeKey(id));
  res.json({ ok: true });
});

/* =========================
   Server
   ========================= */
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
