import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';
import { TradeModal } from './components/modals/TradeModal';
import { HoldingModal } from './components/modals/HoldingModal';
import { OnboardingTutorialModal } from './components/onboarding/OnboardingTutorialModal';

import { PublicLandingPage } from './pages/PublicLandingPage';

import { DashboardPage } from './pages/DashboardPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { MarketPage } from './pages/MarketPage';
import { TradingPage } from './pages/TradingPage';
import { SwapPage } from './pages/SwapPage';
import { TransferPage } from './pages/TransferPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { SettingsPage } from './pages/SettingsPage';

function AuthenticatedApp() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Onboarding Video Modal (Auto-triggered after first successful registration)
  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexora_show_onboarding_tutorial') === 'true';
    } catch {
      return false;
    }
  });

  const handleCompleteTutorial = () => {
    setOnboardingModalOpen(false);
    try {
      localStorage.removeItem('nexora_show_onboarding_tutorial');
      localStorage.setItem('nexora_tutorial_completed_v1', 'true');
    } catch {
      // Ignore
    }
  };

  // Global Modals State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [tradeModalState, setTradeModalState] = useState<{
    isOpen: boolean;
    assetId: string;
    type?: 'buy' | 'sell';
  }>({
    isOpen: false,
    assetId: 'bitcoin',
    type: 'buy'
  });
  const [holdingModalState, setHoldingModalState] = useState<{
    isOpen: boolean;
    assetId?: string;
  }>({
    isOpen: false,
    assetId: undefined
  });

  const handleOpenTradeModal = (assetId: string, type: 'buy' | 'sell' = 'buy') => {
    setTradeModalState({
      isOpen: true,
      assetId,
      type
    });
  };

  const handleOpenHoldingModal = (assetId?: string) => {
    setHoldingModalState({
      isOpen: true,
      assetId
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Global Onboarding Instructional Video Modal */}
      <OnboardingTutorialModal
        isOpen={onboardingModalOpen}
        onClose={handleCompleteTutorial}
        onComplete={handleCompleteTutorial}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(page) => setCurrentPage(page)}
        onOpenTradeModal={(assetId) => handleOpenTradeModal(assetId, 'buy')}
      />

      {/* Global Quick Trade Modal */}
      <TradeModal
        isOpen={tradeModalState.isOpen}
        onClose={() => setTradeModalState((prev) => ({ ...prev, isOpen: false }))}
        defaultAssetId={tradeModalState.assetId}
        defaultType={tradeModalState.type}
      />

      {/* Global Add / Edit Holding Modal */}
      <HoldingModal
        isOpen={holdingModalState.isOpen}
        onClose={() => setHoldingModalState((prev) => ({ ...prev, isOpen: false }))}
        defaultAssetId={holdingModalState.assetId}
      />

      {/* Responsive Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main App Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onNavigate={(page) => setCurrentPage(page)}
        />

        {/* Dynamic Page Router Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={(page) => setCurrentPage(page)}
              onOpenTradeModal={handleOpenTradeModal}
              onOpenHoldingModal={handleOpenHoldingModal}
            />
          )}

          {currentPage === 'portfolio' && (
            <PortfolioPage
              onOpenTradeModal={handleOpenTradeModal}
              onOpenHoldingModal={handleOpenHoldingModal}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'market' && (
            <MarketPage
              onOpenTradeModal={handleOpenTradeModal}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'trading' && (
            <TradingPage onNavigate={(page) => setCurrentPage(page)} />
          )}

          {currentPage === 'swap' && <SwapPage />}

          {currentPage === 'transfer' && <TransferPage />}

          {currentPage === 'history' && <HistoryPage />}

          {currentPage === 'analytics' && <AnalyticsPage />}

          {currentPage === 'help' && (
            <HelpCenterPage
              onOpenTutorial={() => setOnboardingModalOpen(true)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              onOpenTutorial={() => setOnboardingModalOpen(true)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/5 py-3 px-6 text-xs text-slate-400 bg-[#080b10]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white">NOVEXA SOFTWARE</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Simulated cryptocurrency portfolio & trading environment
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function RootApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d14] flex flex-col items-center justify-center p-4 select-none">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="font-bold text-xs tracking-wider text-slate-300">NOVEXA SOFTWARE</div>
      </div>
    );
  }

  // Public entry: visitors can explore the landing page before choosing an auth flow.
  if (!isAuthenticated) {
    return <PublicLandingPage />;
  }

  // Authenticated State: User enters the platform
  return (
    <CryptoProvider>
      <AuthenticatedApp />
    </CryptoProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
