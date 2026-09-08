# Al Arafa Restaurant - Architecture Summary

The app is built on **Next.js 16 App Router** with TypeScript, using file-based routing across both customer-facing pages (menu, cart, checkout, orders, loyalty) and a full **admin section** (`/admin/*`) — making this a unified monolith rather than a separate admin app.

State management uses **Zustand 5 with `persist` middleware**, where the cart store handles both server-synced state (cart items via API) and client-only persisted state (fulfillment type, selected address, delivery quotes) stored in localStorage under `cart-storage`.

The API layer is a centralized **Axios client** (`client.ts`) with request/response interceptors that auto-attach Bearer tokens, handle 401s with a queued token refresh flow, and route-aware redirect logic (admin vs. customer login pages) — JWT tokens are stored in localStorage, not cookies.

The UI is composed of a mix of **custom components** (Button, Input, Modal) and **Radix UI primitives** (dialog, sheet, dropdown-menu, tabs, etc.) styled with Tailwind CSS 4, with a shared design token system in `theme.ts` that mirrors the mobile app's brand colors (`#9f0008` red, `#FFC016` gold) and order status palette.
