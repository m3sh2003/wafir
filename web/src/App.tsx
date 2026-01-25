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
import { AiAdvisorPage } from './features/ai/components/AiAdvisorPage';
import { SettingsPage } from './features/settings/components/SettingsPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { OnboardingPage } from './features/users/pages/OnboardingPage';

const queryClient = new QueryClient();



import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function RequireAuth({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="h-screen flex items-center justify-center text-primary">Loading...</div>; // Or a spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
                <RequireAuth>
                  <OnboardingPage />
                </RequireAuth>
              } />
              <Route path="*" element={
                <RequireAuth>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<OverviewDashboard />} />
                      <Route path="/budget" element={<BudgetDashboard />} />
                      <Route path="/budget/add-transaction" element={<AddTransactionPage />} />
                      <Route path="/investments" element={<InvestmentsDashboard />} />
                      <Route path="/investments/rebalance" element={<PortfolioRebalancePage />} />
                      <Route path="/assets" element={<AssetsDashboard />} />
                      <Route path="/zakat" element={<ZakatCalculatorPage />} />
                      <Route path="/ai" element={<AiAdvisorPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </DashboardLayout>
                </RequireAuth>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
