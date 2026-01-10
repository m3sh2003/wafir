# Wafir - UX Design & Flows

## 1. Design Principles
-   **Arabic First:** All layouts must be designed for RTL naturally, not just mirrored.
-   **Trust & Calm:** Use blues, greens, and whites. Avoid "alarmist" red unless critical.
-   **Simplicity:** Complex financial data should be simplified into "At a Glance" cards.

## 2. User Flows

### 2.1 Onboarding
1.  **Splash Screen:** Logo + slogan.
2.  **Auth:** Login / Sign up (Email or Google).
3.  **Setup Wizard:**
    -   Select Base Currency (e.g., SAR, EGP, USD).
    -   Set Monthly Income.
    -   Define key Envelopes (Housing, Food, Transport).
4.  **Home:** Dashboard landing.

### 2.2 Rebalancing Portfolio
1.  **Trigger:** User receives notification "Portfolio drift > 5%".
2.  **View:** Portfolio Screen shows Target vs Actual allocation.
3.  **Action:** Click "Rebalance".
4.  **Review:** App suggests: "Sell 100 Azimuth, Buy 50 Bashayer".
5.  **Confirm:** User confirms execution (manual log or API trigger).

## 3. Wireframes

### 3.1 Dashboard (Home)
```
+--------------------------------------------------+
|  [Menu]       Salam, Ahmed             [Notif]   |
+--------------------------------------------------+
|  [ Total Net Worth        ]   [   ▲ 2.3%    ]    |
|  [ SAR 1,250,400          ]   [   Last 30d  ]    |
+--------------------------------------------------+
|  [ Budget Status ]                               |
|  Groceries: [======----] 60% used                |
|  Transport: [==--------] 20% used                |
+--------------------------------------------------+
|  [ Recent Transactions ]           [See All]     |
|  - Uber Ride           SAR 45      Today         |
|  - Panda Supermarket   SAR 320     Yesterday     |
+--------------------------------------------------+
|  [ Navigation Bar: Home | Budget | Invest | ... ]|
+--------------------------------------------------+
```

### 3.2 Investment Overview
```
+--------------------------------------------------+
|  [Back]       My Portfolio             [Add]     |
+--------------------------------------------------+
|  [ Allocation Chart (Pie) ]                      |
|  [ Funds 40% | Sukuk 30% | Real Est 20% | Cash ] |
+--------------------------------------------------+
|  [ Risk Analysis ]                               |
|  Max Drawdown (1Y): -8.2% (Target < 15%) [OK]    |
+--------------------------------------------------+
|  [ Holdings ]                                    |
|  > Al-Baraka Fund      300 units    SAR 45,000   |
|  > Beltone Wafra     13,300 units   EGP 130,000  |
+--------------------------------------------------+
```
