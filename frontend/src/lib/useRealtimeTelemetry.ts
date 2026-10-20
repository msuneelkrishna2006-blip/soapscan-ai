import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeRealtimeStream, quickUsageAction } from './api';
import { InventoryItem, UsageEvent } from '../types/soap';

interface RealtimeTelemetryState {
  isConnected: boolean;
  latencyMs: number;
  ollamaStatus: string;
  activeClients: number;
  lastEventTime: string | null;
  lastEventType: string | null;
}

export function useRealtimeTelemetry(params: {
  userId?: string;
  onItemAdded?: (item: InventoryItem) => void;
  onItemUpdated?: (item: InventoryItem) => void;
  onItemDeleted?: (deletedId: string) => void;
  onUsageLogged?: (data: { event: UsageEvent; updatedProduct: InventoryItem }) => void;
}) {
  const [telemetry, setTelemetry] = useState<RealtimeTelemetryState>({
    isConnected: false,
    latencyMs: 14,
    ollamaStatus: 'online',
    activeClients: 1,
    lastEventTime: null,
    lastEventType: null,
  });

  const callbacksRef = useRef(params);
  callbacksRef.current = params;

  useEffect(() => {
    if (!params.userId) {
      setTelemetry(prev => ({ ...prev, isConnected: false }));
      return;
    }

    const cleanup = subscribeRealtimeStream({
      onConnect: data => {
        setTelemetry(prev => ({
          ...prev,
          isConnected: true,
          lastEventTime: new Date().toLocaleTimeString(),
          lastEventType: 'CONNECTED',
        }));
      },
      onHeartbeat: data => {
        setTelemetry(prev => ({
          ...prev,
          isConnected: true,
          latencyMs: data.latencyMs ?? 14,
          ollamaStatus: data.ollamaStatus ?? 'online',
          lastEventTime: new Date().toLocaleTimeString(),
          lastEventType: 'HEARTBEAT',
        }));
      },
      onStateUpdated: data => {
        setTelemetry(prev => ({
          ...prev,
          lastEventTime: new Date().toLocaleTimeString(),
          lastEventType: data.action || 'STATE_UPDATED',
        }));
        if (data.item) {
          callbacksRef.current.onItemUpdated?.(data.item);
        }
      },
      onItemAdded: item => {
        setTelemetry(prev => ({
          ...prev,
          lastEventTime: new Date().toLocaleTimeString(),
          lastEventType: 'ITEM_ADDED',
        }));
        callbacksRef.current.onItemAdded?.(item);
      },
      onItemUpdated: item => {
        setTelemetry(prev => ({
          ...prev,
          lastEventTime: new Date().toLocaleTimeString(),
          lastEventType: 'ITEM_UPDATED',
        }));
        callbacksRef.current.onItemUpdated?.(item);
      },
      onItemDeleted: id => {
        setTelemetry(prev => ({
          ...prev,
          lastEventTime: new Date().toLocaleTimeString(),
          lastEventType: 'ITEM_DELETED',
        }));
        callbacksRef.current.onItemDeleted?.(id);
      },
      onUsageLogged: data => {
        setTelemetry(prev => ({
          ...prev,
          lastEventTime: new Date().toLocaleTimeString(),
          lastEventType: 'USAGE_LOGGED',
        }));
        callbacksRef.current.onUsageLogged?.(data);
      },
    });

    return () => cleanup();
  }, [params.userId]);

  const triggerQuickAction = useCallback(
    async (actionParams: {
      itemId: string;
      action: 'pump' | 'bar_wash' | 'custom_delta' | 'restock';
      amount?: number;
      newQuantity?: number;
    }) => {
      try {
        const result = await quickUsageAction(actionParams);
        if (result.updatedProduct) {
          callbacksRef.current.onItemUpdated?.(result.updatedProduct);
        }
        if (result.event && result.updatedProduct) {
          callbacksRef.current.onUsageLogged?.({
            event: result.event,
            updatedProduct: result.updatedProduct,
          });
        }
        return result;
      } catch (err) {
        console.error('Quick action failed:', err);
        throw err;
      }
    },
    []
  );

  return {
    telemetry,
    triggerQuickAction,
  };
}
