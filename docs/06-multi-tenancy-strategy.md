06 — Multi‑Tenancy Strategy

Why Workspace-per-Tenant?
 - Prevents cross-tenant data leakage
 - Service principal can access all workspaces, but portal controls access

Portal Responsibilities
 - Resolve tenant
 - Resolve workspace
 - Resolve allowed report list
 - Enforce workspace boundaries

Power BI Responsibilities
 - Serve reports
 - Enforce dataset-level RLS (optional)