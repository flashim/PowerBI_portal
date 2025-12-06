05 — Power BI Workspace Setup

Tenant Isolation Options
1. Separate Workspace per Tenant (Recommended)
2. Shared workspace with RLS (risky; not preferred)

Advantages
 - Clean separation
 - Easy auditing
 - Scales better

Steps
 - Create 16 workspaces
 - Assign Service Principal as Admin
 - Upload PBIX once → publish to each workspace
 - Map workspace → tenant → allowed reports