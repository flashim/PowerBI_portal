# Copilot Instructions for Power BI Portal Application

This file provides workspace-specific guidance for developing the Power BI portal application.

## Project Overview

**Power BI Portal** is a secure, multi-tenant reporting application built with:
- Next.js 15+ with TypeScript and App Router
- Harmony authentication integration
- Azure AD OAuth client credentials flow
- Power BI embedding with Row-Level Security (RLS)
- Tailwind CSS for responsive design

## Technology Stack

### Frontend
- React 19 with Next.js 15+
- TypeScript for type safety
- Tailwind CSS for styling
- powerbi-client-react for report embedding

### Backend
- Next.js API routes (server-side only)
- Azure AD OAuth 2.0 (client credentials)
- Session management with Harmony integration

### Infrastructure
- Service Principal for Power BI API access
- Single shared Power BI workspace with RLS
- External IdP for user authentication (federated)

## Project Structure

```
portal-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── reports/       # Power BI report endpoints
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Dashboard
│   │   ├── globals.css        # Global styles
│   │   └── reports/           # Reports page
│   ├── components/            # React components
│   ├── contexts/              # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   └── types/                 # TypeScript interfaces
├── .env.example               # Environment variables template
├── .env.local                 # Local development config (git-ignored)
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
└── README.md                  # Project documentation
```

## Key Features

1. **Harmony Authentication**: Session management with external IdP integration
2. **Row-Level Security**: Customer data isolation in single shared workspace
3. **Multi-Tenant Support**: Tenant context enforcement for multiple customers
4. **Secure Token Flow**: Service Principal credentials stored server-side only
5. **Responsive Design**: Tailwind CSS with dark mode support
6. **Type Safety**: Full TypeScript implementation

## Development Guidelines

### Authentication Flow

1. User authenticates via external IdP (Okta, Azure AD, SAML)
2. Harmony session created with tenant context
3. Backend validates session on each request
4. Service Principal calls Azure AD to get access token (cached)
5. Power BI embed token generated with RLS context
6. Frontend receives token securely and embeds report

### Key Principles

- **Never expose Service Principal credentials to frontend**
- **Store embed tokens in React state only (not localStorage)**
- **Validate Harmony session on every API request**
- **Implement token refresh before expiry**
- **Use HTTPS-only secure cookies**
- **Apply CSP headers for iframe security**

### Adding New Reports

1. Add report ID to environment variables
2. Create report route in `src/app/reports/page.tsx`
3. Use `<ReportViewer reportId={id} />` component
4. Verify RLS filters are applied based on customer context

### Adding New API Endpoints

1. Create file in `src/app/api/{resource}/{action}/route.ts`
2. Validate Harmony session from cookies
3. Implement business logic
4. Return JSON response with error handling
5. Update README API Reference section

### Modifying Authentication

Key files to update:
- `src/lib/auth/harmony-session.ts` - Session management
- `src/lib/auth/azure-ad.ts` - Azure AD OAuth
- `src/contexts/harmony-context.tsx` - Session context
- `src/hooks/use-auth-token.ts` - Token lifecycle

## Environment Setup

### Required Environment Variables

```env
NEXT_PUBLIC_AZURE_TENANT_ID=          # Azure AD tenant
AZURE_CLIENT_ID=                       # Service Principal ID
AZURE_CLIENT_SECRET=                   # Service Principal secret
NEXT_PUBLIC_POWERBI_WORKSPACE_ID=      # Power BI workspace
NEXT_PUBLIC_POWERBI_DATASET_ID=        # Power BI dataset
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Update .env.local with your credentials

# Start development server
npm run dev

# Open http://localhost:3000
```

## Available Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## Testing Guidelines

### Manual Testing Checklist

- [ ] Session created successfully
- [ ] Session persists across page reloads
- [ ] Session expires after 30 minutes
- [ ] Embed token generated correctly
- [ ] Report renders with customer-specific data
- [ ] Token refresh works on expiry
- [ ] Theme switches correctly
- [ ] Error handling displays properly
- [ ] Logout clears session

### Testing Harmony Session

1. Manually create session cookie with valid tenant context
2. Navigate to dashboard
3. Verify session is loaded and user context displayed
4. Refresh page and verify session persists
5. Wait for timeout and verify redirect to login

### Testing Power BI Integration

1. Set correct workspace and dataset IDs in .env.local
2. Verify Service Principal has workspace access
3. Create test report in Power BI
4. Update report ID in environment
5. Navigate to dashboard and verify report embeds
6. Check browser console for embed token and RLS context

## Common Tasks

### Update Session Expiry Time

File: `src/lib/auth/harmony-session.ts`

```typescript
// Currently: 30 minutes
expirationTime: Date.now() + 30 * 60 * 1000
// To change: Update the multiplier (e.g., 60 * 60 * 1000 for 60 minutes)
```

### Add New Tenant to System

1. Create customer record in database
2. Configure Power BI dataset RLS rule for customer
3. Update tenant-to-workspace mapping (if using multiple workspaces)
4. Test embed token generation with new tenant ID

### Implement External IdP Integration

File: `src/app/api/auth/validate-session/route.ts`

Replace placeholder with actual JWT validation:

```typescript
// Validate JWT from external IdP
const decoded = jwt.verify(sessionToken, IDP_PUBLIC_KEY);
const session = HarmonySessionManager.createSession({
  tenantId: decoded.organization_id,
  customerId: decoded.customer_id,
  userId: decoded.user_id,
  userEmail: decoded.email,
  theme: decoded.theme || 'light',
  sessionToken: sessionToken,
});
```

### Add Error Logging/Monitoring

Update API routes with logging:

```typescript
import { captureException } from '@sentry/nextjs'; // or similar

try {
  // endpoint logic
} catch (error) {
  captureException(error, { tags: { endpoint: '/api/reports/getEmbedToken' } });
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Troubleshooting

### Build Errors

**Error: "Module not found"**
- Run `npm install` to ensure all dependencies are installed
- Check import paths use `@/` alias correctly

**Error: "Type errors in TypeScript"**
- Run `npm run lint` to see all type issues
- Update types in `src/types/index.ts` if needed

### Runtime Errors

**"Session not found" on load**
- Check browser cookies are enabled
- Verify .env.local has HARMONY_SESSION_SECRET
- Clear cookies and reload

**"Failed to generate embed token"**
- Verify Service Principal credentials in .env.local
- Check workspace and dataset IDs are correct
- Ensure Service Principal has workspace admin role

**"Power BI SDK initialization error"**
- Verify embed token format and expiry time
- Check Power BI report ID is correct
- Ensure dataset RLS rules are properly configured

## Code Style

- Use arrow functions for React components
- Use TypeScript interfaces for all data structures
- Follow React hooks conventions (use* prefix)
- Add JSDoc comments for public functions
- Keep components focused and single-responsibility

## Git Workflow

1. Create feature branch from `main`
2. Make changes following guidelines
3. Test locally with `npm run dev`
4. Run `npm run lint` before committing
5. Submit pull request with description
6. Request review before merging

## Performance Optimization

- Lazy load report components with `React.lazy()`
- Cache Service Principal tokens (already implemented)
- Implement report pagination for large datasets
- Add loading skeletons for better UX
- Monitor embed token generation performance

## Security Best Practices

✅ Already Implemented:
- HTTPS-only cookies
- Secure token storage (React state)
- Server-side credential handling
- CSP headers
- CSRF protection

⚠️ To Implement:
- Rate limiting on token endpoints
- Audit logging for compliance
- Certificate pinning for Azure AD
- Web Application Firewall (WAF)
- DDoS protection

## Documentation

- Update README.md when adding features
- Keep API documentation in README synchronized
- Document environment variables clearly
- Add JSDoc comments for complex functions
- Update this file when changing architecture

## Deployment Preparation

Before deploying to production:

1. [ ] All environment variables configured
2. [ ] Service Principal secrets in secure storage
3. [ ] HTTPS enabled
4. [ ] Error logging configured
5. [ ] Monitoring and alerting setup
6. [ ] Backup and disaster recovery plan
7. [ ] Security audit completed
8. [ ] Performance testing passed
9. [ ] Load testing passed
10. [ ] Documentation updated

## Support & Resources

- **Power BI Docs**: https://learn.microsoft.com/en-us/power-bi/
- **Azure AD**: https://learn.microsoft.com/en-us/azure/active-directory/
- **Next.js**: https://nextjs.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind**: https://tailwindcss.com/docs

## Related Documentation

- [Architecture Overview](/docs/02-architecture-diagram.md)
- [Authentication Flow](/docs/03-authentication-flow.md)
- [Security Guidelines](/docs/08-security-guidelines.md)
- [API Design](/docs/07-api-design.md)
