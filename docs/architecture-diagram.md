# Architecture Diagram

```mermaid
flowchart TD
    subgraph UI[User interface client]
        direction LR
        CP[Coach phone - web browser]
        DB[Desktop browser]
    end

    subgraph AH[APPLICATION HOST - Vercel, running the Next.js app as serverless functions]
        direction TB
        subgraph TopHost[ ]
            direction LR
            WA[Web application Next.js]
            AP[Accounts & permissions F12, F13]
            Notif[Notifications F16, F17]
        end
        DA[Database access through PostgREST]
        AP -- Sign-in check fetches the stored password hash --> DA
    end
    
    UI -- HTTPS / TLS encrypted web traffic --> AH

    DB_SP[Database - Supabase Postgres relational]
    SS_Files[Supabase Storage files]
    OS[Outside services]

    AH -- Encrypted connection to the database TLS --> DB_SP
    AH -- HTTPS / TLS --> SS_Files
    Notif -- HTTPS to the push services --> OS
