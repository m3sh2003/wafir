# Wafir - Product Requirements Document (PRD)

## 1. Introduction
**Wafir** is a comprehensive personal finance and investment management application designed for the Arab user who seeks financial discipline and wealth growth in accordance with Sharia principles.

### 1.1 Vision
To be the premier financial companion for Muslim investors, simplifying budgeting, automated Sharia-compliant investing, and Zakat calculation in a unified, culturally tailored experience.

## 2. User Persona
**Name:** Ahmed (The disciplined saver)
- **Age:** 32
- **Location:** Riyadh/Cairo/Dubai
- **Language:** Arabic (Native)
- **Goals:** Wants to save for a home (5-10 years), avoid Riba, ensure Zakat is paid, and automate his savings.
- **Pain Points:** Spreadsheets are tedious; Western apps lack Arabic support or Zakat features; Local bank apps are limited in investment tracking.

## 3. Product Goals
1.  **Sharia Compliance:** Built-in screening, Zakat calculation, and cleansing of non-compliant income (if any).
2.  **Holistic Management:** Combine daily expense tracking (Budget) with long-term wealth building (Investments).
3.  **Automation:** "Set and forget" rules for transfers and rebalancing.
4.  **Cultural Fit:** RTL-first design, Hijri calendar support, multi-currency (local + USD).

## 4. Functional Requirements

### 4.1 Budgeting & Expense Tracking
- **Envelope System:** Users can create virtual envelopes (Groceries, Utilities, Rent).
- **Transaction Entry:** Manual entry + Import (CSV/Excel).
- **Rule Engine:** "If description contains 'Uber', categorize as 'Transport'".
- **Alerts:** Push notification when category spend > 80% of limit.

### 4.2 Investment Management
- **Asset Classes:** Cash, Sukuk, Sharia-Equity Funds, Real Estate (marked as 'Residence' or 'Investment'), Gold.
- **Portfolio Tracking:** Current value, ROI, Drawdown tracking.
- **Compliance:**
    -   **Purification:** Track 'impure' income ratio.
    -   **Zakat:** Auto-calculate 2.5% on Zakat-eligible assets (Lunar Hijri basis by default).
- **Strategy:**
    -   Target Allocation (e.g., 20% Cash, 40% Funds, 40% Real Estate).
    -   Drift Analysis & Rebalancing suggestions.

### 4.3 Automated Transfers (The "Flow")
- **Scheduler:** Daily/Weekly/Monthly triggers.
- **Logic:**
    -   "On Salary Day (27th): Transfer 10% to Emergency Fund until balance = 5% of Net Worth."
    -   "Then transfer remaining surplus to Investment Account."

### 4.4 Security & Privacy
- **Auth:** Email/Pass, Bio-metric (Mobile). MFA supported.
- **Data:** Encrypted at rest. Review usage logs.

## 5. Non-Functional Requirements
-   **Performance:** App launch < 2s. Sync < 5s.
-   **Reliability:** Offline support for transaction entry.
-   **Platform:** iOS/Android (Flutter), Web (React).
-   **Localization:** Arabic (Primary), English (Secondary).

## 6. Success Metrics (KPIs)
-   **User Retention:** % of users logging in weekly.
-   **Data Health:** % of transactions categorized.
-   **Financial Health:** % of users achieving their target Emergency Fund.
