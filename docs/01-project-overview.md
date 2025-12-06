01 — Project Overview

🎯 Objective
Build a secure, scalable multi‑tenant reporting portal that embeds Power BI reports using Service Principal (App‑Owns‑Data model) with tenant‑specific workspaces.

🧩 Core Capabilities
Multi‑tenant support for 16 customers
Access to over 200 reports, but each tenant may see only a subset
Use Service Principal + Power BI REST APIs
No user-level Power BI licensing needed
Authentication provided externally by link
Portal performs tenant authorization, Power BI handles data access
Support export, filtering, themes, toolbar customization

🏗 High‑Level Architecture
Frontend: Next.js 15 or latest App Router, Harmony integration
Backend: Next.js API routes (server-side only)
Auth Flow: External IDP → Portal → SP token exchange → Power BI Embed Token
Data Access: Workspace isolation per tenant
Embedding: powerbi-client-react + service principal tokens