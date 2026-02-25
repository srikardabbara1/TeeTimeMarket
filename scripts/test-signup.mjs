/**
 * Test signup API. Run with: node scripts/test-signup.mjs
 * Start the dev server first: npm run dev
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";

async function testSignup() {
  const payload = {
    email: `test-${Date.now()}@example.com`,
    password: "password123",
    name: "Test User",
    phone: "",
  };

  console.log("POST", `${BASE}/api/auth/signup`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Status:", res.status);
    console.error("Response (not JSON):", text.slice(0, 500));
    process.exit(1);
  }

  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    console.error("Signup failed:", data.error, data.detail || "");
    process.exit(1);
  }

  console.log("Signup OK");
}

testSignup().catch((err) => {
  console.error("Request failed:", err.message);
  process.exit(1);
});
