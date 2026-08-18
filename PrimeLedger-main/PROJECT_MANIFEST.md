# PrimeLedger Project Manifest

## Project Identity

PrimeLedger is a premium private wealth-management and private-capital operating system.

Stack:
- Next.js App Router
- TypeScript
- TailwindCSS
- Prisma
- PostgreSQL / Supabase
- NextAuth
- Railway deployment

Core design language:
- Futuristic private-banking interface
- Dark luxury UI
- Aurora background
- Glass panels
- Gold / cyan / violet accents
- Complete replacement files only
- Reusable components before duplicate pages

---

## Current Folder Structure

```text
src/
├── auth.ts
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── accounts/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── clients/list/page.tsx
│   │   ├── investments/page.tsx
│   │   ├── invites/page.tsx
│   │   └── products/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── clients/route.ts
│   │   ├── clients/list/route.ts
│   │   ├── investments/route.tsx
│   │   ├── invites/route.ts
│   │   ├── products/route.ts
│   │   ├── products/[id]/subscribe/route.ts
│   │   └── request/route.tsx
│   ├── dashboard/page.tsx
│   ├── investments/page.tsx
│   ├── investments/[id]/page.tsx
│   ├── invite/[token]/page.tsx
│   ├── login/page.tsx
│   ├── markets/page.tsx
│   ├── my-products/page.tsx
│   ├── products/[id]/subscribe/page.tsx
│   ├── savings/page.tsx
│   ├── savings/[id]/page.tsx
│   └── staking/page.tsx
├── components/
│   ├── investments/InvestmentRequestForm.tsx
│   ├── markets/TradingViewWidget.tsx
│   ├── products/ProductForm.tsx
│   ├── products/ProductTable.tsx
│   └── ui/
│       ├── AuroraBackground.tsx
│       ├── FloatingDock.tsx
│       ├── GlassPanel.tsx
│       ├── GlowButton.tsx
│       ├── LogoutButton.tsx
│       ├── PageShell.tsx
│       ├── PremiumMetric.tsx
│       ├── PrimeLogo.tsx
│       └── SectionHeader.tsx
└── lib/
    ├── market-data.ts
    ├── prisma.ts
    └── utils.ts
```

---

## Completed Features

Public:
- Landing page
- Login page
- Invite page
- Loading page
- Error page
- 404 page

Authentication:
- Admin login
- Client login
- Custom logout modal
- Role-based redirects

Client:
- Dashboard
- Markets terminal
- Investments list
- Investment detail
- Savings list
- Staking list

Admin:
- Admin dashboard
- Create client
- Client list
- Accounts page
- Investment manager
- Invite center
- Products manager

Design system:
- PageShell
- AuroraBackground
- FloatingDock
- PrimeLogo
- GlassPanel
- GlowButton
- SectionHeader
- PremiumMetric
- LogoutButton

---

## Database Direction

The schema uses a unified product system.

Current important models:
- User
- Client
- TradingAccount
- Transaction
- Deposit
- Withdrawal
- InviteLink
- AuditLog
- Investment
- ClientInvestment
- Product
- ProductSubscription

Product types:
- SAVINGS
- STAKING

Future product types can be added later:
- Bonds
- Funds
- Structured Notes
- Real Estate
- Private Equity

Do not redesign the Product architecture unless explicitly requested.

---

## Important Existing Issue

There are route inconsistencies that should be cleaned up:

Current API routes include:
```text
src/app/api/investments/route.tsx
src/app/api/request/route.tsx
src/app/api/products/[id]/subscribe/route.ts
```

Recommended cleanup:
```text
src/app/api/investments/route.ts
src/app/api/investments/request/route.ts
src/app/api/products/[id]/subscribe/route.ts
```

The `.tsx` extension should be changed to `.ts` for API routes where possible.

---

## Next Development Order

Continue from here:

1. Verify product routes already created:
   - `/products/[id]/subscribe`
   - `/api/products/[id]/subscribe`
   - `/my-products`
   - `/savings/[id]`

2. Fix/complete product subscription flow:
   - Client opens savings/staking product
   - Client enters amount
   - API creates ProductSubscription
   - Product investedTotal updates
   - Transaction is created
   - User sees subscription in `/my-products`

3. Build admin product management:
   - Edit product
   - Delete product
   - Enable/disable product
   - View subscribers

4. Add admin client deletion:
   - Delete client
   - Cascade accounts, transactions, invites, investments, product subscriptions
   - Delete related User
   - Confirmation UI

5. Clean markets:
   - Expand market-data modularly
   - Crypto
   - Stocks
   - Forex
   - Commodities
   - Indices

6. Final production audit:
   - Login
   - Logout
   - Admin access
   - Client access
   - Create client
   - Create invite
   - Create investment
   - Submit investment
   - Create product
   - Subscribe product
   - Railway build

---

## Coding Rules

- Always send complete replacement files.
- Never send partial snippets.
- Never ask the user to find a section and edit it.
- If a feature requires many files, send them one complete file at a time.
- Keep the PrimeLedger OS design language consistent.
- Use reusable components before duplicating UI.
- API routes should use `.ts`, not `.tsx`, unless absolutely necessary.
- Build and test after each feature:
  ```bash
  npm run build
  git add .
  git commit -m "meaningful message"
  git push
  ```

---

## Next Best Task

The next best task is:

**Audit and finish the Product Subscription system.**

Start by checking these files:
```text
src/app/products/[id]/subscribe/page.tsx
src/app/api/products/[id]/subscribe/route.ts
src/app/my-products/page.tsx
src/app/savings/[id]/page.tsx
```

If any are missing or incomplete, generate complete replacement files for them.
