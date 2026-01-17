import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BudgetDashboard } from './features/budget/components/BudgetDashboard';
import { InvestmentsDashboard } from './features/investments/components/InvestmentsDashboard';
import { LoginPage } from './features/auth/components/LoginPage';
import { RegisterPage } from './features/auth/components/RegisterPage';
import { ZakatCalculatorPage } from './features/zakat/components/ZakatCalculatorPage';
import { AddTransactionPage } from './features/budget/components/AddTransactionPage';
import { AssetsDashboard } from './features/assets/components/AssetsDashboard';
import { PortfolioRebalancePage } from './features/investments/components/PortfolioRebalancePage';
import { SettingsPage } from './features/settings/components/SettingsPage';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { getToken } from './features/auth/api/auth';
import { OnboardingPage } from './features/users/pages/OnboardingPage';

const queryClient = new QueryClient();



import { useEffect, useState } from 'react';
import { authApi, setToken, setUser } from './features/auth/api/auth';

function AutoLoginWrapper({ children }: { children: ReactNode }) {
  const { hydrateSettings } = useSettings();
  const [isChecking, setIsChecking] = useState(!getToken());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      const token = getToken();
      if (token) {
        await hydrateSettings(); // Hydrate settings on valid session
        setIsChecking(false);
        return;
      }

      try {
        console.log('Attempting Dev Auto-Login...');
        const res = await authApi.login('ahmed@example.com', 'password123');
        setToken(res.access_token);
        setUser(res.user);
        await hydrateSettings(); // Hydrate settings after new login
        setIsChecking(false);
      } catch (err: any) {
        console.error('Auto-login failed', err);
        setError(err.message || 'Unknown Error');
      }
    };

    attemptAutoLogin();
  }, []);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold text-red-500">Auto-Login Failed</h1>
        <p className="text-muted-foreground p-4 bg-muted rounded font-mono text-sm">{error}</p>
        <button onClick={() => window.location.href = '/login'} className="px-4 py-2 bg-primary text-primary-foreground rounded">Go to Login</button>
      </div>
    );
  }

  if (isChecking) {
    return <div className="h-screen flex items-center justify-center text-primary">Autologging in (Dev Mode)...</div>;
  }

  // Double check token after logic
  if (!getToken()) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

import { DashboardLayout } from './features/layout/DashboardLayout';
import { OverviewDashboard } from './features/dashboard/OverviewDashboard';

// ... AutoLoginWrapper remains same ...

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={
                <AutoLoginWrapper>
                  <OnboardingPage />
                </AutoLoginWrapper>
              } />
              <Route path="*" element={
                <AutoLoginWrapper>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<OverviewDashboard />} />
                      <Route path="/budget" element={<BudgetDashboard />} />
                      <Route path="/budget/add-transaction" element={<AddTransactionPage />} />
                      <Route path="/investments" element={<InvestmentsDashboard />} />
                      <Route path="/investments/rebalance" element={<PortfolioRebalancePage />} />
                      <Route path="/assets" element={<AssetsDashboard />} />
                      <Route path="/zakat" element={<ZakatCalculatorPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </DashboardLayout>
                </AutoLoginWrapper>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
