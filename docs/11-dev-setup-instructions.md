11 — Dev Setup Instructions

Install Dependencies
npm install
npm install @azure/msal-node powerbi-client-react powerbi-client

Create .env.local
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
POWERBI_WORKSPACE_MAP=...

Start Dev Environment
npm run dev

Testing Power BI Connectivity
curl http://localhost:3000/api/auth/getPowerBiToken
