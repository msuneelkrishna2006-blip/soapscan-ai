import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  InventoryItem,
  UsageEvent,
  FamilyMember,
  NotificationPrefs,
  AIStatus,
  AIInsight,
  UserProfile,
} from './types/soap';
import {
  getCurrentUser,
  logoutUser,
  getAppState,
  getAIStatus,
  getMonthlyInsights,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  logUsageEvent,
  addFamilyMember,
  exportUsageEventsToCSV,
} from './lib/api';
import { useRealtimeTelemetry } from './lib/useRealtimeTelemetry';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CosmicHomePage } from './components/views/CosmicHomePage';
import { CosmicLoginPage } from './components/views/CosmicLoginPage';
import { InventoryManager } from './components/InventoryManager';
import { UsageHistory } from './components/UsageHistory';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { FamilyManager } from './components/FamilyManager';
import { ScanSoapModal } from './components/ScanSoapModal';
import { LogUsageModal } from './components/LogUsageModal';
import { SettingsModal } from './components/SettingsModal';
import { CosmicUniverse3D } from './components/three/CosmicUniverse3D';
import { AmbientParticles } from './components/animation/AmbientParticles';
import { PageTransition } from './components/animation/PageTransition';
import { ToastContainer, ToastMessage } from './components/animation/ToastNotification';

export const App: React.FC = () => {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Cosmic 3D Ambient Canvas Intensity & Warp state
  const [cosmicIntensity, setCosmicIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isWarping, setIsWarping] = useState<boolean>(false);

  // Authentic User-Scoped Data States (100% Real User Data)
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    id: 'default',
    userId: '',
    lowStockThresholdPercent: 20,
    depletionWarningDays: 5,
    staleMeasurementAlertDays: 7,
    browserNotificationsEnabled: true,
    updatedAt: new Date().toISOString(),
  });

  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const [currentView, setCurrentView] = useState<
    'home' | 'dashboard' | 'inventory' | 'history' | 'analytics' | 'family'
  >('home');
  const [targetMonth, setTargetMonth] = useState<string>('2026-10');
  const [isDark, setIsDark] = useState<boolean>(true);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedSoapItem, setSelectedSoapItem] = useState<InventoryItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Award-Quality Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, message?: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts(prev => [...prev.slice(-3), { id, title, message, type, duration: 4000 }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Theme synchronization
  useEffect(() => {
    const savedTheme = localStorage.getItem('soapscan_theme');
    const prefersDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('soapscan_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Check existing session on boot
  useEffect(() => {
    getCurrentUser()
      .then(user => {
        setCurrentUser(user);
        if (user) {
          setCurrentView('dashboard');
        }
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, []);

  // AI status check
  useEffect(() => {
    getAIStatus()
      .then(status => setAiStatus(status))
      .catch(() => {});

    const interval = setInterval(() => {
      getAIStatus()
        .then(status => setAiStatus(status))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Load authenticated user's state
  const loadUserData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const state = await getAppState();
      setInventory(state.inventoryItems || []);
      setUsageEvents(state.usageEvents || []);
      setFamilyMembers(state.familyMembers || []);
      if (state.notificationPrefs) {
        setNotificationPrefs(state.notificationPrefs);
      }
    } catch (err) {
      console.error('Failed to load user state:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  // Real-Time Server-Sent Events (SSE) telemetry hook
  const { telemetry, triggerQuickAction } = useRealtimeTelemetry({
    userId: currentUser?.id,
    onItemAdded: item => {
      setInventory(prev => {
        if (prev.some(i => i.id === item.id)) return prev;
        return [item, ...prev];
      });
    },
    onItemUpdated: item => {
      setInventory(prev => prev.map(i => (i.id === item.id ? item : i)));
    },
    onItemDeleted: deletedId => {
      setInventory(prev => prev.filter(i => i.id !== deletedId));
      setUsageEvents(prev => prev.filter(e => e.productId !== deletedId));
    },
    onUsageLogged: data => {
      setUsageEvents(prev => [data.event, ...prev]);
      setInventory(prev =>
        prev.map(i => (i.id === data.updatedProduct.id ? data.updatedProduct : i))
      );
    },
  });

  // Fetch Gemma 4 Explainable Insights
  const fetchInsights = useCallback(
    async (customPrompt?: string) => {
      if (!currentUser) return;
      setIsLoadingInsights(true);
      try {
        const list = await getMonthlyInsights({
          inventory,
          usageEvents,
          currentMonth: targetMonth,
        });
        setInsights(list);
      } catch (err) {
        console.error('Error fetching monthly insights:', err);
      } finally {
        setIsLoadingInsights(false);
      }
    },
    [currentUser, inventory, usageEvents, targetMonth]
  );

  useEffect(() => {
    if (currentUser && (inventory.length > 0 || usageEvents.length > 0)) {
      fetchInsights();
    } else {
      setInsights([]);
    }
  }, [currentUser, inventory.length, usageEvents.length, fetchInsights]);

  // Handle Inventory Actions
  const handleItemAdded = async (newItem: InventoryItem) => {
    setInventory(prev => [newItem, ...prev]);
    setIsScanModalOpen(false);
    addToast(
      'Soap Added to Inventory',
      `${newItem.brand} ${newItem.name} (${newItem.initialQuantity}${newItem.unit}) registered.`,
      'success'
    );
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updated = await updateInventoryItem(id, updates);
      setInventory(prev => prev.map(i => (i.id === id ? updated : i)));
      addToast('Soap Specs Updated', `${updated.brand} ${updated.name}`, 'info');
    } catch (err) {
      console.error('Failed to update soap item:', err);
      addToast('Update Failed', 'Could not update soap specs', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setInventory(prev => prev.filter(i => i.id !== id));
      setUsageEvents(prev => prev.filter(e => e.productId !== id));
      addToast('Soap Removed', 'Item removed from household inventory', 'warning');
    } catch (err) {
      console.error('Failed to delete soap item:', err);
      addToast('Delete Failed', 'Could not remove item', 'error');
    }
  };

  const handleLogSaved = async (eventData: Partial<UsageEvent>) => {
    try {
      const result = await logUsageEvent(eventData);
      setUsageEvents(prev => [result.event, ...prev]);
      setInventory(prev =>
        prev.map(i => (i.id === result.updatedProduct.id ? result.updatedProduct : i))
      );
      setIsLogModalOpen(false);
      setSelectedSoapItem(null);
      addToast(
        'Usage Event Logged',
        `${result.event.consumedQuantity}${result.event.unit} logged successfully`,
        'success'
      );
    } catch (err) {
      console.error('Failed to save log event:', err);
      addToast('Log Failed', 'Could not record usage event', 'error');
    }
  };

  const handleLogQuickUsage = async (
    productId: string,
    amount: number,
    method: 'SCALE' | 'PUMP_ESTIMATE'
  ) => {
    try {
      const action = method === 'PUMP_ESTIMATE' ? 'pump' : 'bar_wash';
      await triggerQuickAction({ itemId: productId, action, amount });
      addToast('Quick Usage Logged', `${amount > 0 ? `-${amount}` : amount} recorded`, 'info');
    } catch (err) {
      console.error('Failed to log quick usage:', err);
      addToast('Telemetry Error', 'Failed to log quick usage', 'error');
    }
  };

  const handleAddMember = async (newMember: Partial<FamilyMember>) => {
    try {
      const created = await addFamilyMember(newMember);
      setFamilyMembers(prev => [...prev, created]);
    } catch (err) {
      console.error('Failed to add family member:', err);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setInventory([]);
    setUsageEvents([]);
    setFamilyMembers([]);
    setCurrentView('home');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsWarping(true);
    setTimeout(() => {
      setIsWarping(false);
      setCurrentView('dashboard');
    }, 1200);
  };

  const handleLaunchDashboardFromHome = () => {
    setIsWarping(true);
    setTimeout(() => {
      setIsWarping(false);
      setCurrentView('dashboard');
    }, 900);
  };

  const openLogModal = (item?: InventoryItem) => {
    setSelectedSoapItem(item || null);
    setIsLogModalOpen(true);
  };

  const lastEventForSelected = selectedSoapItem
    ? usageEvents.find(e => e.productId === selectedSoapItem.id)?.createdAt
    : undefined;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <CosmicUniverse3D intensity="low" showSoapCore={false} />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-teal-300 tracking-widest uppercase animate-pulse">
            Booting 3D Cosmic Telemetry...
          </span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render 3D Cosmic Login Portal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#03090E] text-slate-100 flex flex-col relative overflow-hidden select-none">
        <CosmicUniverse3D
          warpActive={isWarping}
          intensity={cosmicIntensity}
          showSoapCore={true}
          interactiveParallax={true}
        />
        <CosmicLoginPage
          onAuthSuccess={handleAuthSuccess}
          aiStatus={aiStatus}
          onWarpStart={() => setIsWarping(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03090E] text-slate-100 flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden select-none">
      {/* Full-Viewport 3D Cosmic Universe Background */}
      <CosmicUniverse3D
        warpActive={isWarping}
        intensity={cosmicIntensity}
        showSoapCore={currentView === 'home'}
        interactiveParallax={true}
      />

      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onExportCSV={() => exportUsageEventsToCSV(usageEvents, inventory, familyMembers)}
        aiStatus={aiStatus}
        targetMonth={targetMonth}
        onTargetMonthChange={setTargetMonth}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        cosmicIntensity={cosmicIntensity}
        onChangeCosmicIntensity={setCosmicIntensity}
      />

      {/* Sparse Animated Teal & Gold Depth Particles with Reduced-Motion Fallback */}
      <AmbientParticles density={cosmicIntensity === 'low' ? 'low' : 'medium'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <AnimatePresence mode="wait">
          <PageTransition key={currentView} viewKey={currentView}>
            {currentView === 'home' && (
              <CosmicHomePage
                aiStatus={aiStatus}
                onLaunchDashboard={handleLaunchDashboardFromHome}
                onOpenScanModal={() => setIsScanModalOpen(true)}
              />
            )}

            {currentView === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                inventory={inventory}
                usageEvents={usageEvents}
                familyMembers={familyMembers}
                notificationPrefs={notificationPrefs}
                targetMonth={targetMonth}
                insights={insights}
                isLoadingInsights={isLoadingInsights}
                onRefreshInsights={fetchInsights}
                onOpenScanModal={() => setIsScanModalOpen(true)}
                onOpenLogModal={openLogModal}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onLogQuickUsage={handleLogQuickUsage}
                aiStatus={aiStatus}
                telemetryLatencyMs={telemetry.latencyMs}
                isRealtimeConnected={telemetry.isConnected}
                onQuickAction={triggerQuickAction}
              />
            )}

            {currentView === 'inventory' && (
              <InventoryManager
                inventory={inventory}
                familyMembers={familyMembers}
                onOpenScanModal={() => setIsScanModalOpen(true)}
                onOpenLogModal={openLogModal}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
              />
            )}

            {currentView === 'history' && (
              <UsageHistory
                usageEvents={usageEvents}
                inventory={inventory}
                familyMembers={familyMembers}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsCharts
                inventory={inventory}
                usageEvents={usageEvents}
                familyMembers={familyMembers}
                targetMonth={targetMonth}
              />
            )}

            {currentView === 'family' && (
              <FamilyManager
                familyMembers={familyMembers}
                inventory={inventory}
                usageEvents={usageEvents}
                onAddMember={handleAddMember}
              />
            )}
          </PageTransition>
        </AnimatePresence>
      </main>

      <footer className="mt-auto border-t border-teal-900/40 bg-obsidian-950/90 backdrop-blur py-4 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">SoapScan AI</span>
            <span>—</span>
            <span>{currentUser.householdName}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Authentic User Data Isolated</span>
            <span>•</span>
            <span>SSE Real-Time Sync</span>
            <span>•</span>
            <span>Local Gemma 4 Multimodal Intelligence</span>
          </div>
        </div>
      </footer>

      <ScanSoapModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onItemAdded={handleItemAdded}
        familyMembers={familyMembers}
      />

      <LogUsageModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setSelectedSoapItem(null);
        }}
        item={selectedSoapItem}
        familyMembers={familyMembers}
        onLogSaved={handleLogSaved}
        lastEventTime={lastEventForSelected}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        notificationPrefs={notificationPrefs}
        onUpdatePrefs={setNotificationPrefs}
        aiStatus={aiStatus}
      />

      {/* Floating Apple-Style Toast Notifications */}
      <ToastContainer toasts={toasts} onCloseToast={removeToast} />
    </div>
  );
};

export default App;
