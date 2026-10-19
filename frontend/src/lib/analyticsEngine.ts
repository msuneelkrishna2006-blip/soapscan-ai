import { InventoryItem, UsageEvent, FamilyMember, NotificationPrefs } from '../types/soap';
import { round } from './consumptionEngine';

export interface DashboardKPIs {
  solidSoapUsedMonthG: number;
  liquidSoapUsedMonthMl: number;
  activeItemsCount: number;
  finishedItemsCount: number;
  monthlySpendingInr: number;
  spendingChangePercent: number;
  estimatedDaysSupplyRemaining: number;
  mostUsedProduct: {
    name: string;
    brand: string;
    consumed: number;
    unit: string;
  } | null;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'LOW_STOCK' | 'DEPLETION_IMMINENT' | 'STALE_MEASUREMENT';
  severity: 'warning' | 'critical' | 'info';
  message: string;
  details: string;
}

export interface ProductUsageBreakdown {
  productId: string;
  name: string;
  brand: string;
  productType: string;
  totalConsumed: number;
  unit: string;
  fillPercentage: number;
  costEstimate: number;
}

export interface MemberUsageBreakdown {
  memberId: string;
  memberName: string;
  avatar: string;
  totalSolidG: number;
  totalLiquidMl: number;
  eventCount: number;
}

export interface DailyUsagePoint {
  date: string;
  dayLabel: string;
  solidG: number;
  liquidMl: number;
}

export interface MonthlyComparisonPoint {
  month: string;
  monthLabel: string;
  solidG: number;
  liquidMl: number;
  costInr: number;
}

export function filterEventsByMonth(
  events: UsageEvent[],
  targetMonth: string,
  includeSample = true
): UsageEvent[] {
  return events.filter(e => {
    if (!includeSample && e.isSampleData) return false;
    return e.createdAt.startsWith(targetMonth);
  });
}

export function calculateItemBurnRate(
  item: InventoryItem,
  events: UsageEvent[],
  daysWindow = 30
): { dailyBurnRate: number; daysRemaining: number } {
  const itemEvents = events.filter(e => e.productId === item.id);
  if (itemEvents.length === 0 || item.remainingQuantity <= 0) {
    return { dailyBurnRate: 0, daysRemaining: item.remainingQuantity <= 0 ? 0 : 999 };
  }

  const now = new Date().getTime();
  const cutoff = now - daysWindow * 24 * 60 * 60 * 1000;
  const recentEvents = itemEvents.filter(e => new Date(e.createdAt).getTime() >= cutoff);

  const totalConsumed = recentEvents.reduce((acc, curr) => acc + curr.consumedQuantity, 0);
  const effectiveDays = Math.max(1, Math.min(daysWindow, 7));
  const dailyBurnRate = round(totalConsumed / effectiveDays, 2);

  const daysRemaining = dailyBurnRate > 0 ? Math.round(item.remainingQuantity / dailyBurnRate) : 999;
  return { dailyBurnRate, daysRemaining };
}

export function calculateDashboardKPIs(
  inventory: InventoryItem[],
  usageEvents: UsageEvent[],
  targetMonth: string,
  includeSample = true
): DashboardKPIs {
  const activeItems = inventory.filter(i => (includeSample || !i.isSampleData) && i.status === 'active');
  const finishedItems = inventory.filter(i => (includeSample || !i.isSampleData) && i.status === 'finished');

  const currentMonthEvents = filterEventsByMonth(usageEvents, targetMonth, includeSample);

  const [year, month] = targetMonth.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthEvents = filterEventsByMonth(usageEvents, prevMonthStr, includeSample);

  let solidSoapUsedMonthG = 0;
  let liquidSoapUsedMonthMl = 0;

  const productUsageMap = new Map<string, { brand: string; name: string; consumed: number; unit: string }>();

  currentMonthEvents.forEach(e => {
    if (e.unit === 'g') {
      solidSoapUsedMonthG += e.consumedQuantity;
    } else {
      liquidSoapUsedMonthMl += e.consumedQuantity;
    }

    const item = inventory.find(i => i.id === e.productId);
    const brand = item?.brand || 'Unknown';
    const name = item?.name || 'Soap';
    const existing = productUsageMap.get(e.productId) || { brand, name, consumed: 0, unit: e.unit };
    existing.consumed += e.consumedQuantity;
    productUsageMap.set(e.productId, existing);
  });

  let mostUsedProduct: DashboardKPIs['mostUsedProduct'] = null;
  let maxConsumed = -1;
  productUsageMap.forEach(p => {
    if (p.consumed > maxConsumed) {
      maxConsumed = p.consumed;
      mostUsedProduct = {
        brand: p.brand,
        name: p.name,
        consumed: round(p.consumed, 1),
        unit: p.unit,
      };
    }
  });

  let monthlySpendingInr = 0;
  currentMonthEvents.forEach(e => {
    const item = inventory.find(i => i.id === e.productId);
    if (item && item.initialQuantity > 0 && item.costInr > 0) {
      const unitCost = item.costInr / item.initialQuantity;
      monthlySpendingInr += e.consumedQuantity * unitCost;
    }
  });

  let prevMonthSpendingInr = 0;
  prevMonthEvents.forEach(e => {
    const item = inventory.find(i => i.id === e.productId);
    if (item && item.initialQuantity > 0 && item.costInr > 0) {
      const unitCost = item.costInr / item.initialQuantity;
      prevMonthSpendingInr += e.consumedQuantity * unitCost;
    }
  });

  const spendingChangePercent =
    prevMonthSpendingInr > 0
      ? round(((monthlySpendingInr - prevMonthSpendingInr) / prevMonthSpendingInr) * 100, 1)
      : 0;

  let totalRemainingDaysSum = 0;
  let itemsWithBurn = 0;

  activeItems.forEach(item => {
    const { daysRemaining } = calculateItemBurnRate(item, usageEvents, 30);
    if (daysRemaining < 999) {
      totalRemainingDaysSum += daysRemaining;
      itemsWithBurn++;
    }
  });

  const estimatedDaysSupplyRemaining =
    itemsWithBurn > 0 ? Math.round(totalRemainingDaysSum / itemsWithBurn) : activeItems.length > 0 ? 30 : 0;

  return {
    solidSoapUsedMonthG: round(solidSoapUsedMonthG, 1),
    liquidSoapUsedMonthMl: round(liquidSoapUsedMonthMl, 1),
    activeItemsCount: activeItems.length,
    finishedItemsCount: finishedItems.length,
    monthlySpendingInr: round(monthlySpendingInr, 0),
    spendingChangePercent,
    estimatedDaysSupplyRemaining,
    mostUsedProduct,
  };
}

export function generateSmartAlerts(
  inventory: InventoryItem[],
  usageEvents: UsageEvent[],
  prefs: NotificationPrefs,
  includeSample = true
): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];
  const activeItems = inventory.filter(i => (includeSample || !i.isSampleData) && i.status === 'active');
  const now = new Date().getTime();

  activeItems.forEach(item => {
    const remainingPct = item.initialQuantity > 0 ? (item.remainingQuantity / item.initialQuantity) * 100 : 0;
    const { daysRemaining, dailyBurnRate } = calculateItemBurnRate(item, usageEvents, 14);

    if (remainingPct <= prefs.lowStockThresholdPercent) {
      alerts.push({
        id: `alert-low-${item.id}`,
        productId: item.id,
        productName: `${item.brand} ${item.name}`,
        type: 'LOW_STOCK',
        severity: remainingPct <= 10 ? 'critical' : 'warning',
        message: `Low Stock: Only ${round(remainingPct, 0)}% remaining (${item.remainingQuantity}${item.unit})`,
        details: `Initial size was ${item.initialQuantity}${item.unit}. Consider stocking up.`,
      });
    }

    if (daysRemaining <= prefs.depletionWarningDays && daysRemaining > 0 && dailyBurnRate > 0) {
      alerts.push({
        id: `alert-deplete-${item.id}`,
        productId: item.id,
        productName: `${item.brand} ${item.name}`,
        type: 'DEPLETION_IMMINENT',
        severity: daysRemaining <= 2 ? 'critical' : 'warning',
        message: `Depletion Warning: Approx ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left`,
        details: `Average burn rate is ${dailyBurnRate} ${item.unit}/day.`,
      });
    }

    const itemEvents = usageEvents.filter(e => e.productId === item.id);
    const lastEventTime =
      itemEvents.length > 0
        ? new Date(itemEvents[itemEvents.length - 1].createdAt).getTime()
        : new Date(item.createdAt).getTime();

    const daysSinceLastLog = (now - lastEventTime) / (1000 * 60 * 60 * 24);
    if (daysSinceLastLog >= prefs.staleMeasurementAlertDays) {
      alerts.push({
        id: `alert-stale-${item.id}`,
        productId: item.id,
        productName: `${item.brand} ${item.name}`,
        type: 'STALE_MEASUREMENT',
        severity: 'info',
        message: `Measurement Reminder: No usage logged for ${Math.floor(daysSinceLastLog)} days`,
        details: `Place on scale or log pumps to keep depletion predictions accurate.`,
      });
    }
  });

  return alerts;
}

export function getProductUsageBreakdown(
  inventory: InventoryItem[],
  usageEvents: UsageEvent[],
  targetMonth: string,
  includeSample = true
): ProductUsageBreakdown[] {
  const monthEvents = filterEventsByMonth(usageEvents, targetMonth, includeSample);
  const map = new Map<string, { consumed: number; unit: string }>();

  monthEvents.forEach(e => {
    const cur = map.get(e.productId) || { consumed: 0, unit: e.unit };
    cur.consumed += e.consumedQuantity;
    map.set(e.productId, cur);
  });

  const list: ProductUsageBreakdown[] = [];
  inventory.forEach(item => {
    if (!includeSample && item.isSampleData) return;
    const stats = map.get(item.id);
    if (stats && stats.consumed > 0) {
      const fillPercentage = item.initialQuantity > 0 ? Math.round((item.remainingQuantity / item.initialQuantity) * 100) : 0;
      const unitCost = item.initialQuantity > 0 ? item.costInr / item.initialQuantity : 0;
      list.push({
        productId: item.id,
        name: item.name,
        brand: item.brand,
        productType: item.productType,
        totalConsumed: round(stats.consumed, 1),
        unit: stats.unit,
        fillPercentage,
        costEstimate: round(stats.consumed * unitCost, 1),
      });
    }
  });

  return list.sort((a, b) => b.totalConsumed - a.totalConsumed);
}

export function getMemberUsageBreakdown(
  familyMembers: FamilyMember[],
  usageEvents: UsageEvent[],
  targetMonth: string,
  includeSample = true
): MemberUsageBreakdown[] {
  const monthEvents = filterEventsByMonth(usageEvents, targetMonth, includeSample);
  const map = new Map<string, { solidG: number; liquidMl: number; count: number }>();

  monthEvents.forEach(e => {
    const memId = e.memberId || 'unassigned';
    const cur = map.get(memId) || { solidG: 0, liquidMl: 0, count: 0 };
    if (e.unit === 'g') {
      cur.solidG += e.consumedQuantity;
    } else {
      cur.liquidMl += e.consumedQuantity;
    }
    cur.count += 1;
    map.set(memId, cur);
  });

  const list: MemberUsageBreakdown[] = [];

  familyMembers.forEach(m => {
    const stats = map.get(m.id) || { solidG: 0, liquidMl: 0, count: 0 };
    list.push({
      memberId: m.id,
      memberName: m.name,
      avatar: m.avatar,
      totalSolidG: round(stats.solidG, 1),
      totalLiquidMl: round(stats.liquidMl, 1),
      eventCount: stats.count,
    });
  });

  const unassigned = map.get('unassigned');
  if (unassigned && (unassigned.solidG > 0 || unassigned.liquidMl > 0)) {
    list.push({
      memberId: 'unassigned',
      memberName: 'Shared / General',
      avatar: '🧴',
      totalSolidG: round(unassigned.solidG, 1),
      totalLiquidMl: round(unassigned.liquidMl, 1),
      eventCount: unassigned.count,
    });
  }

  return list;
}

export function getDailyUsageProgression(
  usageEvents: UsageEvent[],
  targetMonth: string,
  includeSample = true
): DailyUsagePoint[] {
  const monthEvents = filterEventsByMonth(usageEvents, targetMonth, includeSample);
  const [yearStr, monthStr] = targetMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyMap = new Map<number, { solidG: number; liquidMl: number }>();
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap.set(d, { solidG: 0, liquidMl: 0 });
  }

  monthEvents.forEach(e => {
    const d = new Date(e.createdAt).getDate();
    const cur = dailyMap.get(d) || { solidG: 0, liquidMl: 0 };
    if (e.unit === 'g') {
      cur.solidG += e.consumedQuantity;
    } else {
      cur.liquidMl += e.consumedQuantity;
    }
    dailyMap.set(d, cur);
  });

  const result: DailyUsagePoint[] = [];
  dailyMap.forEach((v, dayNum) => {
    const date = `${targetMonth}-${String(dayNum).padStart(2, '0')}`;
    result.push({
      date,
      dayLabel: `Day ${dayNum}`,
      solidG: round(v.solidG, 1),
      liquidMl: round(v.liquidMl, 1),
    });
  });

  return result;
}

export function getMonthOverMonthComparison(
  inventory: InventoryItem[],
  usageEvents: UsageEvent[],
  currentMonth: string,
  includeSample = true
): MonthlyComparisonPoint[] {
  const [yearStr, monthStr] = currentMonth.split('-');
  const baseDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const months: string[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(mStr);
  }

  return months.map(m => {
    const mEvents = filterEventsByMonth(usageEvents, m, includeSample);
    let solidG = 0;
    let liquidMl = 0;
    let costInr = 0;

    mEvents.forEach(e => {
      if (e.unit === 'g') solidG += e.consumedQuantity;
      else liquidMl += e.consumedQuantity;

      const item = inventory.find(i => i.id === e.productId);
      if (item && item.initialQuantity > 0 && item.costInr > 0) {
        costInr += e.consumedQuantity * (item.costInr / item.initialQuantity);
      }
    });

    const [y, mon] = m.split('-').map(Number);
    const dateObj = new Date(y, mon - 1, 1);
    const monthLabel = dateObj.toLocaleString('default', { month: 'short' });

    return {
      month: m,
      monthLabel,
      solidG: round(solidG, 1),
      liquidMl: round(liquidMl, 1),
      costInr: round(costInr, 0),
    };
  });
}
