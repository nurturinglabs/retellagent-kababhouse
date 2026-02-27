# Kabab House Voice Ordering System

## Overview

AI-powered voice ordering system for **Kabab House** restaurant in Oak Creek, WI. The system handles phone orders 24/7 via Retell AI, syncs orders to Clover POS, sends SMS and email confirmations to customers, and provides a real-time admin dashboard for managing orders, menu availability, analytics, and business settings.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Voice Agent | Retell AI |
| POS Integration | Clover POS |
| SMS Notifications | Twilio |
| Email Notifications | Resend |
| Analytics Charts | Recharts |
| Data Fetching | TanStack React Query |
| HTTP Client | Axios |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd kabob-voice-ordering
npm install
```

### Environment Variables

Create a `.env.local` file in the project root and fill in the following credentials:

```env
# Retell AI
RETELL_API_KEY=              # Your Retell AI API key (used for webhook signature verification)

# Clover POS
CLOVER_MERCHANT_ID=          # Your Clover merchant ID
CLOVER_ACCESS_TOKEN=         # Your Clover API access token

# Twilio (SMS)
TWILIO_ACCOUNT_SID=          # Twilio account SID
TWILIO_AUTH_TOKEN=            # Twilio auth token
TWILIO_PHONE_NUMBER=          # Twilio phone number (E.164 format, e.g. +12625551234)

# Resend (Email)
RESEND_API_KEY=              # Resend API key for sending order receipt and catering alert emails
```

### Running Locally

```bash
npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/dashboard | Admin dashboard (orders overview) |
| http://localhost:3000/dashboard/analytics | Analytics charts |
| http://localhost:3000/dashboard/menu | Menu management |
| http://localhost:3000/dashboard/settings | Business settings |

### Build & Production

```bash
npm run build
npm start
```

## Project Structure

```
kabob-voice-ordering/
├── app/
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Landing page
│   ├── api/
│   │   ├── orders/
│   │   │   ├── collect/route.ts            # Receive order from voice agent
│   │   │   ├── validate/route.ts           # Validate menu items & customizations
│   │   │   └── confirm/route.ts            # Confirm order (Clover + SMS + Email)
│   │   ├── inventory/
│   │   │   └── check/route.ts              # Check item availability
│   │   ├── webhooks/
│   │   │   └── retell/route.ts             # Retell AI webhook (call events)
│   │   └── dashboard/
│   │       ├── orders/
│   │       │   ├── route.ts                # List orders + stats
│   │       │   └── [id]/route.ts           # Get / update single order
│   │       ├── analytics/route.ts          # Analytics data
│   │       ├── menu/route.ts               # Menu items + availability toggle
│   │       └── settings/route.ts           # Business settings
│   └── dashboard/
│       ├── layout.tsx                      # Dashboard shell layout
│       ├── page.tsx                        # Orders view
│       ├── orders/
│       │   └── [id]/page.tsx               # Order detail page
│       ├── analytics/page.tsx              # Analytics page
│       ├── menu/page.tsx                   # Menu management page
│       └── settings/page.tsx               # Settings page
├── components/
│   └── ui/                                 # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
├── config/
│   ├── business.ts                         # Business hours, holidays, closures, settings
│   ├── menu.ts                             # Re-exports menu + allergen/dietary info
│   └── messages.ts                         # SMS & email templates
├── lib/
│   ├── types.ts                            # TypeScript interfaces for all entities
│   ├── menu.ts                             # Menu data + search/validation functions
│   ├── store.ts                            # In-memory data store (orders, customers, calls, catering)
│   ├── clover.ts                           # Clover POS API integration
│   ├── notifications.ts                    # Twilio SMS + Resend email functions
│   ├── retell.ts                           # Retell webhook verification + transcript parsing
│   └── utils.ts                            # Formatting, validation, logging helpers
├── docs/
│   └── API.md                              # Detailed API documentation
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

## API Endpoints

### Order Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/orders/collect` | Receive order from voice agent |
| POST | `/api/orders/validate` | Validate menu items and customizations |
| POST | `/api/orders/confirm` | Confirm order (creates in Clover, sends SMS + email) |
| POST | `/api/inventory/check` | Check item availability and price |

### Webhook

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/webhooks/retell` | Retell AI webhook (call_started, call_ended, call_analyzed) |

### Dashboard API

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/dashboard/orders` | List all orders + today's stats |
| GET | `/api/dashboard/orders/[id]` | Get a single order by ID |
| PATCH | `/api/dashboard/orders/[id]` | Update order status |
| GET | `/api/dashboard/analytics` | Full analytics data (charts, trends, breakdowns) |
| GET | `/api/dashboard/menu` | List all menu items |
| PATCH | `/api/dashboard/menu` | Toggle item availability |
| GET | `/api/dashboard/settings` | Get business settings |
| PUT | `/api/dashboard/settings` | Update business settings |

See [docs/API.md](docs/API.md) for detailed request/response documentation.

## Dashboard Features

- **Real-time orders view** -- see all orders with status badges, update status (pending, confirmed, preparing, ready, completed, cancelled)
- **Order detail** -- view full order with line items, customer info, call transcript, sentiment, and agent notes
- **Analytics** -- interactive charts powered by Recharts:
  - Orders by hour of day
  - Revenue trend (last 7 days)
  - Top ordered items
  - Call type breakdown (orders, inquiries, catering, transfers)
  - Inquiry topics distribution
  - Catering lead pipeline
- **Menu management** -- toggle item availability on/off in real time
- **Settings** -- manage business hours, holiday closures, temporary closures, prep time, notification preferences, and staff contact info

## Retell AI Setup

1. Create a Retell AI agent at [retell.ai](https://www.retell.ai/).
2. Set the webhook URL to `https://your-domain.com/api/webhooks/retell`.
3. Enable the following webhook events: `call_started`, `call_ended`, `call_analyzed`.
4. Register four **custom functions** that the agent calls during a live conversation:

| Function Name | Endpoint | Purpose |
|---------------|----------|---------|
| `collect_order` | `POST /api/orders/collect` | Collect and save the caller's order |
| `validate_order` | `POST /api/orders/validate` | Validate items against the menu before confirming |
| `confirm_order` | `POST /api/orders/confirm` | Finalize order, push to Clover, send notifications |
| `check_inventory` | `POST /api/inventory/check` | Check if an item is available and get its price |

5. Set your `RETELL_API_KEY` in `.env.local` for webhook signature verification.
6. In development mode (`NODE_ENV=development`), webhook signature verification is skipped for easier testing.

## Clover Integration

1. Register your app at the [Clover Developer Portal](https://www.clover.com/developers).
2. Obtain a `CLOVER_MERCHANT_ID` and `CLOVER_ACCESS_TOKEN` for your restaurant.
3. Set both values in `.env.local`.
4. The system uses the Clover v3 REST API to:
   - Create orders (`POST /v3/merchants/{mId}/orders`)
   - Add line items to orders (`POST /v3/merchants/{mId}/orders/{orderId}/line_items`)
   - Look up customers by phone
   - Update order status
5. Prices are converted from dollars to cents when sent to Clover (Clover uses cents internally).
6. If Clover API calls fail, the order is still saved locally and confirmed -- Clover sync failures are non-blocking.

## Key Features

- **24/7 voice ordering** -- callers can place orders anytime via Retell AI voice agent
- **All call types handled** -- orders, general inquiries, catering requests, and staff transfers
- **Clover POS sync** -- orders are automatically created in Clover with line items
- **SMS confirmations** -- customers receive an SMS via Twilio with order ID, total, and pickup time
- **Email receipts** -- customers receive a styled HTML email receipt via Resend
- **Real-time analytics dashboard** -- charts for orders, revenue, call types, and top items
- **Menu management** -- toggle item availability without code changes
- **Holiday and closure management** -- configure holidays and temporary closures; the voice agent respects them
- **Allergen and dietary guidance** -- the system knows sesame, wheat, nut, chickpea, and dairy allergens; identifies vegetarian, vegan, and halal options
- **Customer tracking** -- repeat callers are recognized by phone number with order history
- **Catering lead capture** -- catering inquiries are extracted from transcripts and stored as leads with SMS/email alerts to staff
- **Transcript analysis** -- call transcripts are parsed for order items, customer name, phone, and special requests as a fallback
- **Sentiment analysis** -- Retell's post-call analysis captures customer sentiment for quality monitoring
