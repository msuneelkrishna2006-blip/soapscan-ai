import React, { useState, useEffect } from 'react';
import {
  InventoryItem,
  UsageEvent,
  FamilyMember,
  NotificationPrefs,
  AIStatus,
  AIInsight,
} from './types/soap';
import {
  getAppState,
  getAIStatus,
  getMonthlyInsights,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  logUsageEvent,
  addFamilyMember,
  resetSampleData,
  exportUsageEventsToCSV,
} from './lib/api';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryManager } from './components/InventoryManager';
import { UsageHistory } from './components/UsageHistory';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { FamilyManager } from './components/FamilyManager';
import { ScanSoapModal } from './components/ScanSoapModal';
import { LogUsageModal } from './components/LogUsageModal';
import { SettingsModal } from './components/SettingsModal';
import { AmbientBubbleField3D } from './components/three/AmbientBubbleField3D';

export const App: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usageEvents, setUsageEvents] = useState<UsageEvent[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    id: 'default',
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
    'dashboard' | 'inventory' | 'history' | 'analytics' | 'family'
  >('dashboard');
  const [targetMonth, setTargetMonth] = useState<string>('2026-10');
  const [includeSample, setIncludeSample] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(true);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedSoapItem, setSelectedSoapItem] = useState<InventoryItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

  const loadData = async () => {
    try {
      const state = await getAppState();
      setInventory(state.inventoryItems || []);
      setUsageEvents(state.usageEvents || []);
      setFamilyMembers(state.familyMembers || []);
      if (state.notificationPrefs) {
        setNotificationPrefs(state.notificationPrefs);
      }
    } catch (err) {
      console.error('Failed to load state from backend:', err);
    }

    try {
      const status = await getAIStatus();
      setAiStatus(status);
    } catch (err) {
      console.warn('AI status check failed:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const status = await getAIStatus();
      setAiStatus(status);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const filteredInv = includeSample ? inventory : inventory.filter(i => !i.isSampleData);
      const filteredEvts = includeSample ? usageEvents : usageEvents.filter(e => !e.isSampleData);
      const list = await getMonthlyInsights({
        inventory: filteredInv,
        usageEvents: filteredEvts,
        currentMonth: targetMonth,
      });
      setInsights(list);
    } catch (err) {
      console.error('Error fetching monthly insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [inventory, usageEvents, targetMonth, includeSample]);

  const handleItemAdded = async (newItem: InventoryItem) => {
    try {
      const saved = await addInventoryItem(newItem);
      setInventory(prev => [saved, ...prev]);
    } catch (err: any) {
      alert('Failed to save item: ' + err.message);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updated = await updateInventoryItem(id, updates);
      setInventory(prev => prev.map(item => (item.id === id ? updated : item)));
    } catch (err: any) {
      alert('Failed to update item: ' + err.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setInventory(prev => prev.filter(item => item.id !== id));
      setUsageEvents(prev => prev.filter(event => event.productId !== id));
    } catch (err: any) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleLogSaved = async (payload: Partial<UsageEvent>) => {
    const { event, updatedProduct } = await logUsageEvent(payload);
    setUsageEvents(prev => [event, ...prev]);
    setInventory(prev => prev.map(i => (i.id === updatedProduct.id ? updatedProduct : i)));
  };

  const handleAddMember = async (member: Partial<FamilyMember>) => {
    const saved = await addFamilyMember(member);
    setFamilyMembers(prev => [...prev, saved]);
  };

  const handleResetSampleData = async (action: 'restore' | 'purge') => {
    const updatedState = await resetSampleData(action);
    setInventory(updatedState.inventoryItems);
    setUsageEvents(updatedState.usageEvents);
  };

  const openLogModal = (item: InventoryItem) => {
    setSelectedSoapItem(item);
    setIsLogModalOpen(true);
  };

  const lastEventForSelected = selectedSoapItem
    ? usageEvents.find(e => e.productId === selectedSoapItem.id)?.createdAt
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 relative overflow-hidden">
      {/* 3D Volumetric Floating Soap Bubbles */}
      <AmbientBubbleField3D />

      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onExportCSV={() => exportUsageEventsToCSV(usageEvents, inventory, familyMembers)}
        aiStatus={aiStatus}
        targetMonth={targetMonth}
        onTargetMonthChange={setTargetMonth}
        includeSample={includeSample}
        onToggleIncludeSample={setIncludeSample}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {currentView === 'dashboard' && (
          <DashboardView
            inventory={inventory}
            usageEvents={usageEvents}
            familyMembers={familyMembers}
            notificationPrefs={notificationPrefs}
            targetMonth={targetMonth}
            includeSample={includeSample}
            insights={insights}
            isLoadingInsights={isLoadingInsights}
            onRefreshInsights={fetchInsights}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onOpenLogModal={openLogModal}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            familyMembers={familyMembers}
            includeSample={includeSample}
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
            includeSample={includeSample}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsCharts
            inventory={inventory}
            usageEvents={usageEvents}
            familyMembers={familyMembers}
            targetMonth={targetMonth}
            includeSample={includeSample}
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
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-obsidian-800 bg-white/90 dark:bg-obsidian-950/90 backdrop-blur py-4 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">SoapScan AI</span>
            <span>—</span>
            <span>3D WebGL Digital Twins + Local Gemma 4 Multimodal Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Tare-calibrated physics</span>
            <span>•</span>
            <span>100% on-device vision privacy</span>
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
        onResetSampleData={handleResetSampleData}
        aiStatus={aiStatus}
      />
    </div>
  );
};

export default App;
