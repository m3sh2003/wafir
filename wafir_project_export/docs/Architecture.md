# Wafir - Technical Architecture

## 1. System Overview
Wafir follows a **Clean Architecture** approach to ensure separation of concerns, testability, and independence from frameworks.

### 1.1 Architectural Layers
1.  **Domain Layer (Core):** Entities, Value Objects, Domain Services, Repository Interfaces. *No external dependencies.*
2.  **Application Layer:** Use Cases (Interactors), DTOs. Orchestrates flow of data.
3.  **Infrastructure Layer:** Database implementation (TypeORM/Prisma), External APIs (Bank Feeds), Auth services.
4.  **Presentation Layer:**
    -   **API:** NestJS Controllers (REST/GraphQL).
    -   **Mobile:** Flutter (Riverpod + Clean Arch).
    -   **Web:** React (Redux Toolkit).

```mermaid
graph TD
    subgraph "Infrastructure"
        DB[(PostgreSQL)]
        ExtAPI[Bank APIs]
    end

    subgraph "Presentation"
        Mobile[Flutter App]
        Web[React Web]
        API[NestJS Controllers]
    end

    subgraph "Application"
        UC[Use Cases]
    end

    subgraph "Domain"
        Entities[Entities & Rules]
    end

    Mobile --> API
    Web --> API
    API --> UC
    UC --> Entities
    UC --> RepoInterfaces
    RepoImpl --> DB
    RepoImpl --> ExtAPI
    RepoImpl -.-> RepoInterfaces
```

## 2. Database Design (ERD)

Wafir uses **PostgreSQL**.

```mermaid
erDiagram
    Users ||--o{ Accounts : owns
    Users ||--o{ Envelopes : manages
    Users ||--o{ Budgets : sets
    Accounts ||--o{ Transactions : has
    Envelopes ||--o{ Transactions : tagged_with
    
    Users ||--o{ Portfolios : owns
    Portfolios ||--o{ Assets : contains
    Assets ||--o{ AssetTransactions : history
    
    Users {
        uuid id PK
        string email
        string password_hash
        jsonb settings "Currency, Language, Calendar"
    }

    Accounts {
        uuid id PK
        string name
        string type "Bank, Cash, Investment"
        decimal balance
        string currency
    }

    Envelopes {
        uuid id PK
        string name
        decimal limit_amount
        string period "Monthly"
    }

    Transactions {
        uuid id PK
        date date
        decimal amount
        string description
        uuid account_id FK
        uuid envelope_id FK
        jsonb metadata
    }

    Assets {
        uuid id PK
        string symbol
        string name
        string type "Stock, Fund, RealEstate, Cash"
        decimal quantity
        decimal current_price
        boolean is_zakat_eligible
        boolean is_residence
    }
```

## 3. Technology Stack
-   **Backend:** NestJS (Node.js), TypeScript.
-   **Database:** PostgreSQL 15+.
-   **Mobile:** Flutter (Dart).
-   **Frontend:** React (Vite).
-   **Cloud:** Azure (App Service, Postgres Flex, Key Vault).
-   **DevOps:** GitHub Actions, Terraform/Bicep.
