07 — API Design

Endpoints
GET /api/auth/getPowerBiToken

Requests access token from Azure AD.
POST /api/reports/getReportEmbedToken

Returns:
{
  "embedToken": "...",
  "embedUrl": "...",
  "reportId": "..."
}

Security Requirements
 - Only server-side routes request tokens
 - Never expose SP secrets client-side
 - Validate inbound JWT from B&E portal