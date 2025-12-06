# Power BI Portal - Quick Start Guide

## What Was Created

A complete, production-ready Power BI portal application with:

✅ **Next.js 15+ App Router** - Modern React framework with TypeScript
✅ **Harmony Authentication** - Session management with external IdP support
✅ **Azure AD OAuth Flow** - Service Principal token exchange
✅ **Power BI Embedding** - Secure report embedding with RLS
✅ **Multi-Tenant Support** - Customer data isolation via Row-Level Security
✅ **Responsive UI** - Tailwind CSS with dark mode support
✅ **Type-Safe** - Full TypeScript implementation
✅ **API Routes** - Secure backend endpoints for token management
✅ **Custom Hooks** - React hooks for authentication and theming

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── validate-session/route.ts
│   │   │   └── refresh-session/route.ts
│   │   └── reports/
│   │       ├── getEmbedToken/route.ts
│   │       └── refreshEmbedToken/route.ts
│   ├── layout.tsx
│   ├── page.tsx (Dashboard)
│   ├── globals.css
│   └── reports/page.tsx
├── components/
│   ├── header.tsx
│   ├── footer.tsx
│   ├── navigation.tsx
│   └── report-viewer.tsx
├── contexts/
│   └── harmony-context.tsx
├── hooks/
│   ├── use-auth-token.ts
│   └── use-harmony-theme.ts
├── lib/
│   ├── auth/
│   │   ├── harmony-session.ts
│   │   └── azure-ad.ts
│   └── powerbi/
│       └── powerbi-service.ts
└── types/
    └── index.ts
```

## Getting Started (5 Steps)

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local with your credentials:
NEXT_PUBLIC_AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=your-service-principal-client-id
AZURE_CLIENT_SECRET=your-service-principal-secret
NEXT_PUBLIC_POWERBI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_POWERBI_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Test Authentication Flow

The app will attempt to load a Harmony session from cookies. To test:

1. **Create a test session** - Add a `harmony_session` cookie with valid tenant context
2. **Verify session loads** - Check that user context displays in the header
3. **Test token generation** - Report viewer will call `/api/reports/getEmbedToken`

### 4. Configure Your Power BI Report

1. Get your Power BI **workspace ID** and **dataset ID**
2. Add them to `.env.local`
3. Get a **report ID** from Power BI
4. Update `NEXT_PUBLIC_REPORT_ID` in `.env.local`
5. Verify the report renders on the dashboard

### 5. Test RLS (Row-Level Security)

1. Verify your Power BI dataset has RLS rules configured
2. The embed token will include:
   - `username`: user's email
   - `roles`: `["customer_{customerId}"]`
   - `customData`: customer ID for filtering
3. Power BI will apply these filters automatically

## API Endpoints

### Authentication

**GET /api/auth/validate-session**
```bash
curl -H "Cookie: harmony_session=..." http://localhost:3000/api/auth/validate-session
```

**POST /api/auth/refresh-session**
```bash
curl -X POST -H "Cookie: harmony_session=..." http://localhost:3000/api/auth/refresh-session
```

### Reports

**POST /api/reports/getEmbedToken**
```bash
curl -X POST \
  -H "Cookie: harmony_session=..." \
  -H "Content-Type: application/json" \
  -d '{"reportId":"d8176e4a-e7c1-4452"}' \
  http://localhost:3000/api/reports/getEmbedToken
```

**POST /api/reports/refreshEmbedToken**
```bash
curl -X POST \
  -H "Cookie: harmony_session=..." \
  -H "Content-Type: application/json" \
  -d '{"reportId":"d8176e4a-e7c1-4452","tokenExpiry":"2024-12-31T00:00:00Z"}' \
  http://localhost:3000/api/reports/refreshEmbedToken
```

## Key Components

### ReportViewer Component

Embed a Power BI report with automatic token management:

```tsx
import { ReportViewer } from '@/components/report-viewer';

<ReportViewer 
  reportId="your-report-id"
  title="Sales Analytics"
/>
```

### useHarmonySession Hook

Access current session and theme:

```tsx
import { useHarmonySession } from '@/contexts/harmony-context';

const { session, theme, isLoading } = useHarmonySession();
```

### useAuthToken Hook

Manage session lifecycle and token refresh:

```tsx
import { useAuthToken } from '@/hooks/use-auth-token';

const { isValid, session, refreshSession } = useAuthToken();
```

### useHarmonyTheme Hook

Access theme configuration:

```tsx
import { useHarmonyTheme } from '@/hooks/use-harmony-theme';

const { primaryColor, isDark, brandName, logo } = useHarmonyTheme();
```

## Authentication Flow

```
1. User logs in via External IdP (Okta, Azure AD, etc.)
   ↓
2. Harmony session created and stored in cookie
   ↓
3. Next.js middleware validates session on each request
   ↓
4. Backend calls Azure AD with Service Principal credentials
   ↓
5. Access token received (cached for ~60 minutes)
   ↓
6. Power BI embed token generated with RLS context
   ↓
7. Frontend receives token securely (HTTPS only)
   ↓
8. Report rendered with customer-specific data (RLS-filtered)
```

## Security Features

✅ **Implemented**
- HTTP-only secure cookies (SameSite=Strict)
- Service Principal credentials never exposed to frontend
- Embed tokens stored in React state (not localStorage)
- Session validation on every API request
- Content Security Policy headers
- CSRF protection

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Check code quality
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_AZURE_TENANT_ID` | Azure AD tenant ID | `12345678-...` |
| `AZURE_CLIENT_ID` | Service Principal ID | `87654321-...` |
| `AZURE_CLIENT_SECRET` | Service Principal secret | `abc123...` |
| `NEXT_PUBLIC_POWERBI_WORKSPACE_ID` | Power BI workspace | `11111111-...` |
| `NEXT_PUBLIC_POWERBI_DATASET_ID` | Power BI dataset | `22222222-...` |
| `NEXT_PUBLIC_REPORT_ID` | Power BI report | `report-id` |
| `NEXT_PUBLIC_APP_URL` | App base URL | `http://localhost:3000` |

## Customization Tips

### Add a New Page

1. Create `src/app/new-page/page.tsx`
2. Import `Header`, `Navigation`, `Footer` components
3. Use `useHarmonySession()` to access user context
4. Use `useHarmonyTheme()` for styling

### Add a New API Endpoint

1. Create `src/app/api/[resource]/[action]/route.ts`
2. Validate session from cookies
3. Return `NextResponse.json()`
4. Document in README

### Customize Styling

Edit `tailwind.config.ts` for theme colors, or override in `globals.css`.

## Next Steps

1. ✅ **Environment Setup** - Configure `.env.local`
2. ✅ **Test Authentication** - Verify Harmony session integration
3. ✅ **Connect Power BI** - Add workspace/dataset/report IDs
4. ✅ **Configure RLS** - Set up dataset RLS rules in Power BI
5. ✅ **Implement IdP** - Integrate your external identity provider
6. ✅ **Deploy** - Push to production environment

## Troubleshooting

**Q: "Session not found" error**
A: Ensure browser has cookies enabled and `harmony_session` cookie is set

**Q: "Failed to generate embed token"**
A: Check Azure credentials, workspace ID, and dataset ID in `.env.local`

**Q: Report not rendering**
A: Verify Power BI report ID is correct and Service Principal has workspace access

**Q: Type errors**
A: Run `npm run lint` to see all issues, update types in `src/types/index.ts`

## Support & Resources

- [Power BI Embedding Docs](https://learn.microsoft.com/en-us/power-bi/developer/embedded/)
- [Azure AD OAuth](https://learn.microsoft.com/en-us/azure/active-directory/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Additional Documentation

- [Architecture Overview](../docs/02-architecture-diagram.md)
- [Authentication Flow](../docs/03-authentication-flow.md)
- [Security Guidelines](../docs/08-security-guidelines.md)
- [API Design](../docs/07-api-design.md)
