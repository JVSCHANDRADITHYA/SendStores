import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    orders: {
      executor: "constant-vus",
      vus: 50,
      duration: "2m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

const BASE_URL = "http://store-l43d8i.13-204-92-56.sslip.io";

// (assume keys are valid)
const CONSUMER_KEY = "ck_bec74c6d383d8b833a86b5fda4acb6e7ede9ba59";
const CONSUMER_SECRET = "cs_c5a5a1fd483e2c42fc178fdbb775fb44bd1fe3cb";

export default function () {
  const payload = JSON.stringify({
    payment_method: "bacs",
    payment_method_title: "Direct Bank Transfer",
    set_paid: true,
    billing: {
      first_name: "Test",
      last_name: "User",
      email: `test${__ITER}@example.com`,
    },
    line_items: [
      {
        product_id: 38,
        quantity: 1,
      },
    ],
  });

  const params = {
    auth: {
      user: CONSUMER_KEY,
      pass: CONSUMER_SECRET,
    },
    headers: {
      "Content-Type": "application/json",
    },
    tags: {
      journey: "checkout",
    },
    timeout: "30s",
  };

  const res = http.post(
    `${BASE_URL}/wp-json/wc/v3/orders`,
    payload,
    params
  );

  check(res, {
    "order created (201)": (r) => r.status === 201,
  });
}