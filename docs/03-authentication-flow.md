03 — Authentication & Authorization Flow

## Overview

This document details the complete authentication and authorization flow for the Power BI portal, integrating Next.js with Harmony session management and Azure AD OAuth client credentials flow. The architecture uses a single shared Power BI workspace with Row-Level Security (RLS) to isolate customer data.

## Authentication Flow (Step-by-Step)

### 1. External IdP Authentication
- User initiates login at B&E portal or external federated identity provider (e.g., Okta, Azure AD, custom SAML provider)
- External IdP authenticates user credentials and issues JWT token or session cookie
- User is redirected to Next.js portal with token/session in URL query param or HTTP header

### 2. Harmony Session Establishment
- Next.js middleware intercepts request and validates external JWT/session using Harmony authentication hooks
- Harmony extracts tenant context from token claims (e.g., `customer_id`, `organization_id`)
- Session created in Harmony store with:
  - `tenantId` / `customerId` – identifies which customer's data to access
  - `userId` – identifies the user for audit logging
  - `userEmail` – used for Power BI RLS context
  - `theme` – user's theme preference (light/dark) from Harmony branding config
  - `sessionToken` – external IdP token for re-validation
- Harmony sets secure HTTP-only session cookie (SameSite=Strict)

### 3. Tenant Context Resolution
- Every request to backend APIs includes Harmony session cookie
- Next.js API route middleware validates Harmony session and extracts tenant context
- Tenant ID is used to:
  - Determine which RLS filters apply to embed token
  - Enforce authorization (user belongs to tenant)
  - Log audit trail
- Invalid or expired session → return 401 Unauthorized, redirect to external IdP

### 4. Service Principal Token Exchange (Backend Only)
- When frontend requests embed token for report, Next.js backend receives request with valid Harmony session
- Backend calls Azure AD OAuth token endpoint with Service Principal credentials:
  ```
  POST https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token
  Body: {
    client_id: {AZURE_CLIENT_ID},
    client_secret: {AZURE_CLIENT_SECRET},
    scope: "https://analysis.windows.net/.default",
    grant_type: "client_credentials"
  }
  ```
- Azure AD returns access token (valid ~60 minutes)
- Token is cached in-memory or Redis with key: `sp_token_{WORKSPACE_ID}` (refresh before expiry)
- Tokens are NEVER sent to frontend or exposed in logs

### 5. Power BI Embed Token Generation
- Backend calls Power BI REST API `/generateToken` endpoint with:
  - Service Principal access token (from step 4)
  - Workspace ID (shared workspace)
  - Report ID (specific report requested)
  - Dataset ID (Power BI semantic model)
  - RLS identity context:
    ```json
    {
      "username": "{user_email_from_harmony}",
      "roles": ["customer_{customerId}"],
      "customData": "{customerId}"
    }
    ```
- Power BI returns embed token (valid ~60 minutes) and embed URL
- Embed token is NOT cached; generated fresh per request for security

### 6. Secure Token Delivery to Frontend
- Backend API response (HTTPS only):
  ```json
  {
    "embedToken": "eyJ0eXAiOiJKV1Q...",
    "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=...",
    "reportId": "d8176e4a-e7c1-4452",
    "expirationTime": 1700000000
  }
  ```
- Response includes `Set-Cookie: harmony_session=...` to refresh session expiry
- Frontend never stores token in localStorage (XSS risk); stored in React state only
- Frontend passes embed token to `powerbi-client-react` component

### 7. Harmony Theme/Branding Application
- Harmony provides theme context to frontend:
  ```json
  {
    "primaryColor": "#0078D4",
    "theme": "light",
    "brandName": "Customer Portal",
    "logo": "https://cdn.example.com/logo.png"
  }
  ```
- Next.js frontend applies Harmony theme to:
  - Portal wrapper and navigation components
  - Power BI embedded report container styling
  - Loading states, error messages
  - Customer-specific branding (multi-tenant portal styling)
- CSS-in-JS or Tailwind CSS with Harmony CSS variables

### 8. Report Embedding and RLS Application
- Frontend renders Power BI report using `powerbi-client-react`:
  ```jsx
  <PowerBIEmbed
    embedConfig={{
      type: "report",
      id: reportId,
      embedUrl: embedUrl,
      accessToken: embedToken,
      tokenType: "Aad",
      permissions: "View"
    }}
    eventHandlers={...}
  />
  ```
- Power BI SDK verifies embed token signature
- Power BI applies RLS filters based on username/roles/customData claims:
  - Dataset queries filter rows where `customer_id = {customerId}` (or equivalent)
  - User sees only their customer's data
  - Query is evaluated at semantic model level (secure, cannot be bypassed)
- Report renders within Harmony-themed container

### 9. Session Lifecycle & Token Refresh
- Harmony session TTL: 30 minutes (configurable)
- Each API request extends session expiry
- Embed token TTL: 60 minutes (Power BI standard)
- If embed token expires mid-session:
  - Frontend detects error → calls `/api/reports/refreshEmbedToken` endpoint
  - Backend validates Harmony session → generates new embed token
  - Frontend re-renders report with new token
- If Harmony session expires:
  - Frontend redirect to login detected → Harmony redirects to external IdP
  - User re-authenticates

## Authorization Rules

### Role-Based Access Control (RBAC)
- **Tenant Isolation**: User can only access reports from their tenant (enforced by RLS + Harmony session)
- **Report Access**: Mapped in portal database (tenant → allowed report IDs)
- **Export Permissions**: Determined by user role in Harmony context (admin/viewer/editor)

### Power BI Permissions
- Embed token includes `permissions: "View"` (read-only)
- Export, share, save capabilities controlled via Power BI report settings
- Optional: dataset-level permissions (restrict certain columns/tables per tenant)

## Security Checklist

- [ ] **Transport Security**: All endpoints use HTTPS; secure cookies with SameSite=Strict, HttpOnly, Secure flags
- [ ] **Secrets Management**: Azure Client Secret stored in environment variables or Azure Key Vault (never in code)
- [ ] **Token Lifecycle**: Service Principal tokens cached with automatic refresh; embed tokens generated fresh per request
- [ ] **Session Validation**: Every API request validates Harmony session signature and expiry
- [ ] **Tenant Isolation**: Harmony session tenant context enforced on all queries; RLS applied server-side by Power BI
- [ ] **Audit Logging**: All token generation and access attempts logged with tenant/user context
- [ ] **CSP Headers**: Content Security Policy configured to allow Power BI iframe domain
- [ ] **XSS Protection**: Embed token never stored in localStorage; no dynamic script injection
- [ ] **CSRF Protection**: CSRF tokens on all state-modifying API calls
- [ ] **Service Principal Rotation**: Credentials rotated every 90 days
- [ ] **Harmony Integration**: Custom auth hooks configured; session middleware validates on each request

## Environment Variables Required

```env
AZURE_TENANT_ID=<your-azure-tenant-id>
AZURE_CLIENT_ID=<service-principal-client-id>
AZURE_CLIENT_SECRET=<service-principal-secret>
POWERBI_WORKSPACE_ID=<shared-workspace-id>
HARMONY_SESSION_SECRET=<secure-random-key-for-session-signing>
HARMONY_EXTERNAL_IDP_URL=<external-idp-endpoint>
HARMONY_THEME_CONFIG_URL=<harmony-theme-config-endpoint>
```

## API Endpoints

### `GET /api/auth/validate-session`
- **Purpose**: Validate Harmony session and return user context
- **Headers**: Cookie (harmony_session)
- **Response**: `{ tenantId, userId, userEmail, theme, expirationTime }`
- **Error**: 401 if session invalid/expired

### `POST /api/reports/getEmbedToken`
- **Purpose**: Generate Power BI embed token with RLS context
- **Headers**: Cookie (harmony_session), Content-Type: application/json
- **Body**: `{ reportId, datasetId }`
- **Response**: `{ embedToken, embedUrl, reportId, expirationTime }`
- **Error**: 400 if report not authorized for tenant; 401 if session invalid

### `POST /api/auth/refresh-session`
- **Purpose**: Refresh Harmony session expiry
- **Headers**: Cookie (harmony_session)
- **Response**: `{ sessionToken, expirationTime }`
- **Error**: 401 if session invalid

## Harmony Integration Points

### Middleware (Next.js)
```
middleware.ts → validateHarmonySession(req) → extract tenantId, theme
```

### Frontend Context Provider
```
HarmonyProvider → useHarmonySession() → return { tenant, user, theme }
```

### Auth Hooks (Custom)
```
use-harmony-auth.ts → useAuthToken() → manage Harmony session lifecycle
```

### Theme/Branding
```
use-harmony-theme.ts → useTheme() → apply Harmony CSS variables to Power BI container
```

## Data Flow Diagram

```
┌─────────────────────────────────────┐
│   User              │
└──────────────────┬──────────────────┘
               │ (1) Authenticate at External IdP
               v
┌────────────────────────────────────────────────────────────────────────────────┐
│  External IdP                   │ ──(2) Redirect with JWT + theme prefs
│ (Okta/Azure AD/SAML)            │
└──────────────────┬──────────────────────────────────────────────────────────────┘
               │
               v
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Next.js Portal                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ Harmony Session Middleware                                         │   │
│  │ (validateHarmonySession)    ──(3) Validate JWT, extract tenant     │   │
│  │                             ──(4) Extract theme config             │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │ Frontend React Components                                          │   │
│  │ (HarmonyProvider context)   ──(5) useHarmonySession() hook         │   │
│  │                             ──(6) Request embed token              │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┬───────────────────────────────────────────────────┘
               │ (7)                          │ (8) Harmony theme applied
               │ POST                         │ to Power BI wrapper
               │ /api/reports/getEmbedToken
               │                              │
               v                              v
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Next.js API Route                                                         │
│  (Backend - Server-Side Only)                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ Extract tenantId from                                              │   │
│  │ Harmony session cookie                                             │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ Retrieve cached SP token                                           │   │
│  │ or request new one         ──(9) If expired, call Azure AD         │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────┬────────────────────────────────────┘
               │ (10)                         │ (11) Returns
               │ SP token + tenant context
               │                              │
               v                              v
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Azure AD                                                                  │
│  POST /oauth2/v2.0/token        ──(12) Generate access token             │
└──────────────────┬──────────────────────────────────┬─────────────────────────────────────┘
               │ (13) Access token
               v
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Power BI REST API                                                         │
│  POST /generateToken             ──(14) Generate embed token with RLS context
│                                      (username, roles, customData from tenant)
└──────────────────┬──────────────────────────────────┬─────────────────────────────────────┘
               │ (15) Embed token + URL
               v
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Next.js API Response                                                      │
│  {                                                                         │
│    embedToken,                                                             │
│    embedUrl,                                                               │
│    reportId                                                                │
│  }                                                                         │
│  + Set-Cookie: harmony_session   ──(16) Return to frontend securely       │
└──────────────────┬──────────────────────────────────┬─────────────────────────────────────┘
               │ (17)
               v
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Frontend React State                                                      │
│  (embedToken in memory only)     ──(18) Pass to powerbi-client-react      │
└──────────────────┬──────────────────────────────────┬─────────────────────────────────────┘
               │ (19)
               v
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Power BI Embedded Report                                                  │
│  (Harmony-themed container)      ──(20) Verify token + apply RLS filters  │
│                                      (Power BI evaluates RLS rules:        │
│                                       filter rows by tenant/customer)      │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Customer data visualized                                           │   │
│  │ (RLS-filtered)             ──(21) Display to user                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```