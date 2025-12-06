# Power BI Portal Application

A secure, multi-tenant Power BI reporting portal built with Next.js 15+, TypeScript, and Harmony authentication integration.

## Overview

This portal provides:
- **Harmony Authentication**: Secure session management with external IdP integration
- **Row-Level Security (RLS)**: Customer data isolation in a single shared Power BI workspace
- **Multi-Tenant Support**: Support for multiple customers with tenant context enforcement
- **Responsive Design**: Tailwind CSS for modern, responsive UI
- **Theme Support**: Dynamic theming based on Harmony branding configuration

## Architecture

The application follows the authentication flow documented in `/docs/03-authentication-flow.md`:

1. **External IdP Authentication**: User authenticates via federated identity provider
2. **Harmony Session**: Session established with tenant context and theme preferences
3. **Service Principal Flow**: Backend calls Azure AD for access token (server-side only)
4. **Power BI Embed Token**: RLS-enabled embed token generated for secure report embedding
5. **Secure Frontend Delivery**: Token passed to frontend and rendered with `powerbi-client-react`
6. **Report Viewing**: Power BI applies RLS filters based on customer context

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── validate-session/    # Validate Harmony session
│   │   │   └── refresh-session/     # Refresh session expiry
│   │   └── reports/
│   │       ├── getEmbedToken/       # Generate Power BI embed token
│   │       └── refreshEmbedToken/   # Refresh expired embed token
│   ├── layout.tsx                   # Root layout with HarmonyProvider
│   ├── page.tsx                     # Dashboard (home page)
│   ├── globals.css                  # Global styles
│   └── reports/
│       └── page.tsx                 # Reports listing page
├── components/
│   ├── header.tsx                   # Header with branding
│   ├── footer.tsx                   # Footer
│   ├── navigation.tsx               # Navigation menu
│   └── report-viewer.tsx            # Power BI report embed component
├── contexts/
│   └── harmony-context.tsx          # Harmony session context provider
├── hooks/
│   ├── use-auth-token.ts            # Session lifecycle management
│   └── use-harmony-theme.ts         # Theme context hook
├── lib/
│   ├── auth/
│   │   ├── harmony-session.ts       # Session management utilities
│   │   └── azure-ad.ts              # Azure AD OAuth flow
│   └── powerbi/
│       └── powerbi-service.ts       # Power BI API wrapper
└── types/
    └── index.ts                     # TypeScript interfaces
```

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Azure AD application registration with Service Principal
- Power BI workspace with reports and datasets
- External IdP configuration

### Installation Steps

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
   AZURE_CLIENT_ID=your-service-principal-client-id
   AZURE_CLIENT_SECRET=your-service-principal-secret
   NEXT_PUBLIC_POWERBI_WORKSPACE_ID=your-workspace-id
   NEXT_PUBLIC_POWERBI_DATASET_ID=your-dataset-id
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Key Features to Implement

- [ ] External IdP integration (SAML/OpenID Connect)
- [ ] Harmony session cookie validation middleware
- [ ] Power BI workspace and dataset configuration
- [ ] Customer-specific report routing
- [ ] Session timeout handling and warnings
- [ ] Error logging and monitoring
- [ ] Unit and integration tests
- [ ] Deployment pipeline (CI/CD)

## Security Considerations

✅ **Implemented**:
- HTTPS-only cookies
- Secure token storage (React state, not localStorage)
- Service Principal credentials stored server-side
- Content Security Policy headers
- CSRF protection on API endpoints
- Session validation on every request

⚠️ **To Complete**:
- Implement external IdP JWT validation
- Add rate limiting on token endpoints
- Enable audit logging for all token generation
- Configure Azure Key Vault for secret management
- Implement certificate pinning for Azure AD
- Set up monitoring and alerting

## API Reference

### Authentication Endpoints

**GET /api/auth/validate-session**
- Validates Harmony session from cookies
- Returns: `{ tenantId, customerId, userId, userEmail, theme, expirationTime }`
- Error: 401 if session invalid

**POST /api/auth/refresh-session**
- Refreshes session expiry
- Returns: `{ sessionToken, expirationTime }`
- Error: 401 if session expired

### Report Endpoints

**POST /api/reports/getEmbedToken**
- Generates Power BI embed token with RLS context
- Body: `{ reportId }`
- Returns: `{ embedToken, embedUrl, reportId, expirationTime }`
- Error: 401 if session invalid, 400 if report not authorized

**POST /api/reports/refreshEmbedToken**
- Refreshes expired embed token
- Body: `{ reportId, tokenExpiry }`
- Returns: New embed token if expired, otherwise success message

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_AZURE_TENANT_ID` | Azure AD tenant ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_CLIENT_ID` | Service Principal client ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_CLIENT_SECRET` | Service Principal secret | `<your-secret>` |
| `NEXT_PUBLIC_POWERBI_WORKSPACE_ID` | Power BI workspace ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `NEXT_PUBLIC_POWERBI_DATASET_ID` | Power BI dataset ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `NEXT_PUBLIC_HARMONY_SESSION_SECRET` | Session signing secret | `<random-secure-key>` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` |

## Testing

### Manual Testing Checklist

- [ ] Session creation when user logs in via IdP
- [ ] Session persistence across page refreshes
- [ ] Session expiry after inactivity
- [ ] Embed token generation with RLS context
- [ ] Report rendering with customer-specific data
- [ ] Token refresh on expiry
- [ ] Theme switching based on Harmony config
- [ ] Error handling for invalid sessions
- [ ] Logout functionality

### Unit Tests (To Be Added)

```bash
npm run test
```

## Deployment

### Build for Production

```bash
npm run build
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY .next ./
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production

1. Set environment variables in your hosting platform
2. Enable HTTPS and secure cookies
3. Configure CORS for Power BI domains
4. Set up monitoring and error tracking
5. Configure backup and disaster recovery

## Troubleshooting

### Issue: "Failed to get access token from Azure AD"
- Verify Service Principal credentials in `.env.local`
- Check Azure AD app registration has correct API permissions
- Ensure Service Principal has access to Power BI workspace

### Issue: "Session expired" redirects
- Check session cookie settings (SameSite, Secure)
- Verify token expiry configuration
- Check browser cookie policy

### Issue: Report not rendering
- Verify embed token generation endpoint is called
- Check Power BI dataset RLS rules are configured
- Ensure report ID and dataset ID are correct in environment

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check code style
4. Submit a pull request

## License

MIT

## Support

For issues or questions, refer to:
- [Power BI Embedding Documentation](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embedding)
- [Azure AD Documentation](https://learn.microsoft.com/en-us/azure/active-directory/)
- [Next.js Documentation](https://nextjs.org/docs)

## Related Documentation

- [Architecture Overview](/docs/02-architecture-diagram.md)
- [Authentication Flow](/docs/03-authentication-flow.md)
- [Security Guidelines](/docs/08-security-guidelines.md)
- [API Design](/docs/07-api-design.md)
