04 — Service Principal Setup

Prerequisites
 - Azure AD tenant admin permissions
 - Power BI admin permissions

Steps
1. Register App in Azure AD → Capture
 - Client ID
 - Tenant ID
 - Client Secret

2. Enable Service Principal for Power BI (Power BI Admin Portal)

3. Assign Admin rights on target workspaces

4. Grant API permissions:
    Power BI Service → Tenant.Read.All, Dataset.ReadWrite.All

Validation Commands
az login
az ad sp list --display-name "your-app"