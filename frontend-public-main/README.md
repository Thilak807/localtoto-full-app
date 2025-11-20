# LocalToTo Passenger Web

Public snapshot of the LocalToTo passenger frontend (React + Vite + Tailwind).  
Native-app developers can use this repo to understand the current booking UX, API contracts, and Razorpay integration.

## Table of Contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Backend & API Notes](#backend--api-notes)
- [Native App Handoff Checklist](#native-app-handoff-checklist)
- [Testing & Quality](#testing--quality)
- [Contributing](#contributing)

## Architecture
```
frontend/
├── public/                  # Static assets served by Vite/nginx
├── src/
│   ├── components/          # Pages + shared UI (booking, map, admin, etc.)
│   ├── services/            # Axios clients, Razorpay helper, Ola Maps client
│   ├── utils/               # Asset prefetch helpers
│   ├── icons/, media/       # Marketing assets
│   └── main.tsx             # App bootstrap
├── env.example              # Placeholder env vars (copy to .env.local)
├── Dockerfile               # Production build (nginx)
└── nginx.conf               # Static file server config
```

## Tech Stack
- React 18 + Vite
- TypeScript + TailwindCSS
- Axios for API calls
- Ola Maps JS SDK for live tracking
- Razorpay Checkout integration
- Nginx container for production

## Getting Started

### Prerequisites
- Node.js 18+ (with npm)
- Access to a backend API base URL (staging/local)
- Razorpay test key for payment flow
- Ola Maps frontend API key

### Local Development
```bash
git clone https://github.com/localtoto/frontend-public.git
cd frontend-public
cp env.example .env.local   # fill in placeholders
npm install
npm run dev                 # opens http://localhost:5173
```
Vite hot reloads as you edit `src/`. The dev server proxies requests directly to the backend URL defined in `VITE_API_URL`.

### Production Build
```bash
npm run build
npm run preview   # optional local preview of the production bundle
```
To ship via Docker/nginx:
```bash
docker build -t localtoto-frontend \
  --build-arg VITE_API_BASE_URL=https://your-backend.example.com/api \
  --build-arg VITE_BACKEND_PORT=8001 \
  --build-arg VITE_OLA_MAPS_API_KEY=your-ola-key \
  --build-arg VITE_RAZORPAY_KEY_ID=your-razorpay-key \
  .
docker run -p 8080:8080 localtoto-frontend
```

## Environment Variables
Copy `env.example` to `.env.local` (not committed). Required keys:

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL for backend REST API (e.g., `https://staging.localtoto/api`) |
| `VITE_BACKEND_PORT` | Used for debugging WebSocket URLs (default `8001`) |
| `VITE_OLA_MAPS_API_KEY` | Frontend-safe Ola Maps key |
| `VITE_OLA_MAPS_PROJECT_ID` | Ola project identifier (if required) |
| `OLA_MAPS_DOMAIN` | Allowed domain for Ola Maps |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key |

> **Note:** Real secrets (Razorpay secret, webhook secret, 2Factor key, etc.) live in the closed-source backend. This repo only uses publishable keys.

## Available Scripts
- `npm run dev` – Vite dev server
- `npm run build` – production build with type checking
- `npm run preview` – preview the build locally
- `npm run lint` – ESLint (if configured globally)

## Backend & API Notes
The frontend relies on the Django backend (private repo) at `/api/...`. Key endpoints:
- `POST /api/auth/otp/send`, `POST /api/auth/login` – OTP auth
- `GET/POST /api/bookings/*` – ride lifecycle, status polling
- `GET /api/payments/config`, `POST /api/payments/order`, `POST /api/payments/verify`
- `GET/PUT /api/admin/config/pricing` – admin fare config
- WebSocket: `wss://<backend>/ws/bookings/{public_id}/`

If you need a staging backend, use GitHub Codespaces/Gitpod or a Render/Fly deployment with test keys to avoid touching production.

## Native App Handoff Checklist
1. **Auth Flow:** Reuse OTP endpoints; do not integrate directly with 2Factor.
2. **Booking State:** Mirror the request/response shapes from `src/components/BookingConfirmationPage.tsx` and `RideInitiatePage.tsx`.
3. **Live Tracking:** Follow the WebSocket events emitted in `frontend/src/components/LiveTrackingMap.tsx`. Fallback polling intervals are in the same component.
4. **Payments:** Use the same Razorpay charge flow (see `src/components/BookingConfirmationPage.tsx` and `PaymentFeedbackPage.tsx`). Backend expects `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`.
5. **Pricing:** Always fetch `/api/admin/config/pricing` to display fares; do not cache hardcoded numbers.
6. **Token Refresh:** Observe how the web app handles JWT refresh (`src/services/api.ts`) and replicate for mobile.
7. **Error Logging:** Keep console/log statements for Razorpay and WebSocket flows—they help debug staging issues quickly.

## Testing & Quality
- Use `npm run lint` and `npm run test` (if you add Vitest suites) before opening PRs.
- For map features, mock geolocation when running unit tests.
- When adjusting polling/WebSocket logic, monitor API call volume to avoid accidental request storms.

## Contributing
Pull requests are welcome! Please:
1. Fork the repo or create a feature branch.
2. Update docs/env examples if you add new configuration.
3. Run lint/build before submitting.
4. Describe how changes affect the native app/API consumers.

Have questions about backend access or staging credentials? Reach out to the core team (support@localtoto.com) and mention the native app initiative in your request.

