02 — Architecture Diagram (Explanation)

Components
 - User – Authenticated via external federated IdP
 - Harmony Authentication Layer – Manages session, tenant context, theme/branding state
 - Web Portal (Next.js) – Embeds Power BI with Harmony integration
 - Azure AD App Registration – Issues OAuth client credential token for Service Principal
 - Service Principal – Identity used to call Power BI REST APIs
 - Power BI Workspace (Single, Shared) – Contains semantic models with Row-Level Security (RLS)
 - Fabric / Lakehouse / DW – Source of semantic models with customer dimension for RLS filtering

Logical Architecture
User → External IdP → Harmony Session → Next.js Portal → Harmony Auth Hooks → Next.js API → Azure AD → Power BI REST APIs → RLS-Embed Token → Frontend (Harmony Themed) → Embedded Report Frame

Detailed Explanation
 - External IdP authenticates the user and issues JWT/session token.
 - User redirected to portal; Harmony detects and stores session (tenant context, user identity, theme preference).
 - Next.js backend extracts tenant ID from Harmony session context.
 - Backend calls Azure AD with Service Principal credentials (OAuth client credential flow) → gets access token.
 - Backend calls Power BI REST APIs with tenant context to generate RLS-enabled embed token (includes customer filter claims).
 - Harmony provides theme/branding configuration to frontend.
 - Frontend receives embed token securely and renders embedded report with Harmony-styled wrapper.
 - Power BI applies RLS filters based on tenant/customer claims in embed token.