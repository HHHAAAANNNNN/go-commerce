// ─── Mock fetch handler for DEMO_MODE ────────────────────────────────────────
// Intercepts all API calls and returns realistic mock responses.
// No backend needed — all data comes from mockData.ts.

import {
  MOCK_USER, MOCK_TOKEN, MOCK_PRODUCTS, MOCK_ORDERS,
  MOCK_ORDER_DETAILS, MOCK_CART, MOCK_VOUCHERS, MOCK_DASHBOARD,
} from "./mockData";

// Helper: build a fake Response with JSON body
function jsonResponse(data: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function ok(data: unknown, message = "Success") {
  return jsonResponse({ success: true, message, data });
}

function notFound(message = "Not found") {
  return jsonResponse({ success: false, message }, 404);
}

// In-memory mutable state for cart & balance so interactions feel real
let mockCart = [...MOCK_CART];
let mockBalance = MOCK_DASHBOARD.balance;
let mockOrderCounter = 100;

// ─── Router ───────────────────────────────────────────────────────────────────
export function mockFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();

  // Strip origin and query-string so we match only the path
  let path = url;
  try { path = new URL(url).pathname; } catch {
    // Relative URL — strip query string and hash manually
    path = url.split('?')[0].split('#')[0];
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (path === "/api/auth/login" && method === "POST") {
    return ok({ user: MOCK_USER, token: MOCK_TOKEN }, "Login successful");
  }
  if (path === "/api/auth/register" && method === "POST") {
    return ok({ user: MOCK_USER, token: MOCK_TOKEN }, "Registration successful");
  }

  // ── Health ────────────────────────────────────────────────────────────────
  if (path === "/api/health") {
    return ok({ status: "ok" });
  }

  // ── Products ──────────────────────────────────────────────────────────────
  if (path === "/api/products" && method === "GET") {
    return ok(MOCK_PRODUCTS);
  }
  if (path === "/api/products/search") {
    return ok(MOCK_PRODUCTS);
  }
  const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch && method === "GET") {
    const product = MOCK_PRODUCTS.find(p => p.id === productMatch[1]);
    if (!product) return notFound("Product not found");
    return ok({
      ...product,
      specifications: [
        { key: "Brand", value: product.brand },
        { key: "Category", value: product.category },
        { key: "Stock", value: String(product.stock) },
        { key: "Rating", value: String(product.rating) },
      ],
    });
  }
  if (productMatch && method === "POST") {
    return ok({ message: "Product created (demo mode — not persisted)" }, "Created");
  }

  // Product reviews
  const reviewMatch = path.match(/^\/api\/products\/([^/]+)\/reviews$/);
  if (reviewMatch) {
    return ok([
      { id: 1, user_name: "Demo User", rating: 5, comment: "Excellent product!", created_at: "2026-03-01T10:00:00Z" },
      { id: 2, user_name: "Test User", rating: 4, comment: "Great value for money.", created_at: "2026-03-02T14:00:00Z" },
    ]);
  }

  // ── Vouchers ──────────────────────────────────────────────────────────────
  if (path === "/api/vouchers" && method === "GET") {
    return ok(MOCK_VOUCHERS);
  }
  if (path === "/api/vouchers" && method === "POST") {
    return ok({ message: "Voucher created (demo mode — not persisted)" }, "Created");
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  if (path === "/api/users" && method === "GET") {
    return ok([MOCK_USER]);
  }

  // User by id
  const userMatch = path.match(/^\/api\/users\/(\d+)$/);
  if (userMatch) {
    return ok(MOCK_USER);
  }

  // Balance
  const balanceMatch = path.match(/^\/api\/users\/(\d+)\/balance$/);
  if (balanceMatch) {
    return ok({ balance: mockBalance });
  }

  // Top-up
  const topupMatch = path.match(/^\/api\/users\/(\d+)\/topup$/);
  if (topupMatch && method === "POST") {
    try {
      const body = JSON.parse(options.body as string);
      mockBalance += body.amount ?? 0;
    } catch { /* ignore */ }
    return ok({ balance: mockBalance, message: "Top up berhasil (demo mode)" });
  }

  // Dashboard
  const dashboardMatch = path.match(/^\/api\/users\/(\d+)\/dashboard$/);
  if (dashboardMatch) {
    return ok({ ...MOCK_DASHBOARD, balance: mockBalance });
  }

  // Stats
  const statsMatch = path.match(/^\/api\/users\/(\d+)\/stats$/);
  if (statsMatch) {
    return ok(MOCK_DASHBOARD.stats);
  }

  // Profile update
  const profileMatch = path.match(/^\/api\/users\/(\d+)\/profile$/);
  if (profileMatch && method === "PUT") {
    return ok({ message: "Profile updated (demo mode — not persisted)" });
  }

  // Orders list
  const ordersMatch = path.match(/^\/api\/users\/(\d+)\/orders$/);
  if (ordersMatch && method === "GET") {
    return ok(MOCK_ORDERS);
  }

  // All orders (admin)
  if (path === "/api/orders" && method === "GET") {
    return ok(MOCK_ORDERS);
  }

  // Order detail by order_number
  const orderDetailMatch = path.match(/^\/api\/users\/(\d+)\/orders\/([^/]+)$/);
  if (orderDetailMatch && method === "GET") {
    const orderNum = orderDetailMatch[2];
    const detail = MOCK_ORDER_DETAILS[orderNum];
    return detail ? ok(detail) : notFound("Order not found");
  }

  // Order status update
  const orderStatusMatch = path.match(/^\/api\/users\/(\d+)\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === "PATCH") {
    return ok({ message: "Status updated (demo mode — not persisted)" });
  }

  // Order reviews submit
  const orderReviewMatch = path.match(/^\/api\/users\/(\d+)\/orders\/([^/]+)\/reviews$/);
  if (orderReviewMatch && method === "POST") {
    return ok({ message: "Reviews submitted (demo mode — not persisted)" });
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  const cartListMatch = path.match(/^\/api\/users\/(\d+)\/cart$/);
  if (cartListMatch && method === "GET") {
    return ok(mockCart);
  }
  if (cartListMatch && method === "POST") {
    try {
      const body = JSON.parse(options.body as string);
      const existing = mockCart.find(c => c.product_id === body.product_id);
      if (existing) {
        existing.quantity += body.quantity ?? 1;
      } else {
        mockCart.push({ product_id: body.product_id, quantity: body.quantity ?? 1 });
      }
    } catch { /* ignore */ }
    return ok(mockCart, "Added to cart");
  }

  const cartItemMatch = path.match(/^\/api\/users\/(\d+)\/cart\/([^/]+)$/);
  if (cartItemMatch && method === "DELETE") {
    mockCart = mockCart.filter(c => c.product_id !== cartItemMatch[2]);
    return ok(mockCart, "Removed from cart");
  }
  if (cartItemMatch && method === "PUT") {
    try {
      const body = JSON.parse(options.body as string);
      const item = mockCart.find(c => c.product_id === cartItemMatch[2]);
      if (item) item.quantity = body.quantity;
    } catch { /* ignore */ }
    return ok(mockCart, "Cart updated");
  }

  // ── Checkout ──────────────────────────────────────────────────────────────
  const checkoutMatch = path.match(/^\/api\/users\/(\d+)\/checkout$/);
  if (checkoutMatch && method === "POST") {
    const orderNumber = `ORD-DEMO-${++mockOrderCounter}`;
    // Simulate balance deduction
    mockBalance = Math.max(0, mockBalance - 1000);
    // Clear cart
    mockCart = [];
    return ok({ order_id: orderNumber, total: 0, discount: 0, message: "Checkout berhasil (demo mode)" });
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  if (path === "/api/upload" && method === "POST") {
    return ok({ url: "/assets/products/phones/426753_samsung-galaxy-s24-ultra.jpg" }, "Uploaded (demo mode)");
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  console.warn("[DEMO] Unhandled mock route:", method, path);
  return ok({ message: "Demo mode — endpoint not mocked" });
}
