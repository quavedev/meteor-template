/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';

const CHECK_INTERVAL_MS = 30000;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function formatTime(isoString) {
  if (!isoString) return 'never';
  const date = new Date(isoString);
  return date.toLocaleTimeString();
}

export function ServerStatus() {
  const [serverInfo, setServerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stickyCookie, setStickyCookie] = useState(null);
  const [previousStickyCookie, setPreviousStickyCookie] = useState(null);
  const [currentHostname, setCurrentHostname] = useState(null);
  const [previousHostname, setPreviousHostname] = useState(null);
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [lastReconnectionStatus, setLastReconnectionStatus] = useState(null);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [leakStatus, setLeakStatus] = useState({
    isLeaking: false,
    leakedChunks: 0,
  });
  const [isLeakActionPending, setIsLeakActionPending] = useState(false);

  const fetchServerStatus = useCallback(async () => {
    try {
      const status = await Meteor.callAsync('server.getStatus');
      setServerInfo(status);
      if (status.leakStatus) {
        setLeakStatus(status.leakStatus);
      }
      setError(null);
    } catch (err) {
      setError(err.reason || 'Failed to fetch server status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearStickySession = useCallback(async () => {
    try {
      setIsClearing(true);
      console.log('[StickySession] Calling server to clear sticky session');

      const response = await fetch('/api/clear-sticky-session', {
        method: 'POST',
      });
      const data = await response.json();

      console.log('[StickySession] Clear response:', data);

      setStickyCookie(data.stickySession);
      setPreviousStickyCookie(data.previousStickySession);
    } catch (err) {
      console.error('[StickySession] Error clearing sticky session:', err);
    } finally {
      setIsClearing(false);
    }
  }, []);

  const checkReconnection = useCallback(async () => {
    try {
      const response = await fetch('/api/check-reconnection');
      const data = await response.json();

      console.log('[StickySession] Check reconnection response:', data);

      // Update cookie state from server response
      setStickyCookie(data.stickySession);
      setPreviousStickyCookie(data.previousStickySession);
      setCurrentHostname(data.currentHostname);
      setPreviousHostname(data.previousHostname);
      setLastReconnectionStatus(data.needsReconnection);
      setLastCheckedAt(data.checkedAt);

      if (data.needsReconnection) {
        console.log('[StickySession] Server needs reconnection');

        setServerInfo((prev) => ({
          ...prev,
          status: 'overloaded',
          hostname: data.hostname,
        }));

        // Auto cleanup if enabled
        if (autoCleanup) {
          console.log('[StickySession] Auto cleanup enabled, clearing cookie');
          await clearStickySession();
        } else {
          console.log(
            '[StickySession] Manual cleanup mode, waiting for user action'
          );
        }
      }
    } catch (err) {
      console.error('[StickySession] Error checking reconnection:', err);
    }
  }, [autoCleanup, clearStickySession]);

  useEffect(() => {
    fetchServerStatus();
    checkReconnection();

    const intervalId = setInterval(() => {
      checkReconnection();
      fetchServerStatus();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchServerStatus, checkReconnection]);

  const handleToggleAutoCleanup = useCallback(() => {
    setAutoCleanup((prev) => {
      const newValue = !prev;
      console.log(
        `[StickySession] Auto cleanup ${newValue ? 'enabled' : 'disabled'}`
      );
      return newValue;
    });
  }, []);

  const handleManualClear = useCallback(async () => {
    console.log('[StickySession] Manual clear requested');
    await clearStickySession();
  }, [clearStickySession]);

  const handleStartLeak = useCallback(async () => {
    try {
      setIsLeakActionPending(true);
      console.log('[MemoryLeak] Starting memory leak');
      const response = await fetch('/api/memory-leak/start', {
        method: 'POST',
      });
      const data = await response.json();
      console.log('[MemoryLeak] Start response:', data);
      await fetchServerStatus();
    } catch (err) {
      console.error('[MemoryLeak] Error starting leak:', err);
    } finally {
      setIsLeakActionPending(false);
    }
  }, [fetchServerStatus]);

  const handleStopLeak = useCallback(async () => {
    try {
      setIsLeakActionPending(true);
      console.log('[MemoryLeak] Stopping memory leak');
      const response = await fetch('/api/memory-leak/stop', { method: 'POST' });
      const data = await response.json();
      console.log('[MemoryLeak] Stop response:', data);
      await fetchServerStatus();
    } catch (err) {
      console.error('[MemoryLeak] Error stopping leak:', err);
    } finally {
      setIsLeakActionPending(false);
    }
  }, [fetchServerStatus]);

  const handleCleanupLeak = useCallback(async () => {
    try {
      setIsLeakActionPending(true);
      console.log('[MemoryLeak] Cleaning up memory leak');
      const response = await fetch('/api/memory-leak/cleanup', {
        method: 'POST',
      });
      const data = await response.json();
      console.log('[MemoryLeak] Cleanup response:', data);
      await fetchServerStatus();
    } catch (err) {
      console.error('[MemoryLeak] Error cleaning up leak:', err);
    } finally {
      setIsLeakActionPending(false);
    }
  }, [fetchServerStatus]);

  const handleCheckNow = useCallback(async () => {
    console.log('[StickySession] Manual check requested');
    await checkReconnection();
    await fetchServerStatus();
  }, [checkReconnection, fetchServerStatus]);

  if (isLoading) {
    return <div className="text-xs text-gray-400">Loading server info...</div>;
  }

  if (error) {
    return <div className="text-xs text-red-400">Error: {error}</div>;
  }

  if (!serverInfo) {
    return null;
  }

  const statusColor =
    serverInfo.status === 'healthy' ? 'text-green-500' : 'text-red-500';
  const statusIcon = serverInfo.status === 'healthy' ? '●' : '⚠';

  const { memory, hostMemory } = serverInfo;

  return (
    <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <span className={statusColor}>{statusIcon}</span>
        <span className="font-medium">{serverInfo.hostname}</span>
      </div>

      {/* Node.js Memory Info */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span>
          Heap: {formatBytes(memory.heapUsed)} /{' '}
          {formatBytes(memory.heapSizeLimit)} ({memory.heapUsagePercentage}%)
        </span>
        <span className="text-gray-400">|</span>
        <span>Allocated: {formatBytes(memory.heapTotal)}</span>
        <span className="text-gray-400">|</span>
        <span>RSS: {formatBytes(memory.rss)}</span>
      </div>

      {/* Additional Node.js Memory Details */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-gray-600">
        <span>External: {formatBytes(memory.external)}</span>
        <span className="text-gray-400">|</span>
        <span>ArrayBuffers: {formatBytes(memory.arrayBuffers)}</span>
      </div>

      {/* Host Machine Memory */}
      {hostMemory && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-gray-600">
          <span className="text-gray-400">Host:</span>
          <span>
            {formatBytes(hostMemory.used)} / {formatBytes(hostMemory.total)} (
            {hostMemory.usagePercentage}%)
          </span>
          <span className="text-gray-400">|</span>
          <span>Free: {formatBytes(hostMemory.free)}</span>
          <span className="text-gray-400">|</span>
          <span>RSS/Host: {hostMemory.rssPercentageOfSystem}%</span>
        </div>
      )}

      {/* Memory Leak Status */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <span>
          <span className="text-gray-400">Leak Status:</span>{' '}
          <span
            className={leakStatus.isLeaking ? 'text-red-500' : 'text-green-500'}
          >
            {leakStatus.isLeaking ? 'LEAKING' : 'Idle'}
          </span>
        </span>
        {leakStatus.leakedChunks > 0 && (
          <>
            <span className="text-gray-400">|</span>
            <span>
              <span className="text-gray-400">Leaked:</span> ~
              {leakStatus.leakedChunks * 50}MB ({leakStatus.leakedChunks}{' '}
              chunks)
            </span>
          </>
        )}
      </div>

      {/* Memory Leak Controls */}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleStartLeak}
          disabled={isLeakActionPending || leakStatus.isLeaking}
          className="rounded bg-red-600 px-2 py-0.5 text-white hover:bg-red-700 disabled:opacity-50"
        >
          Start Leak
        </button>
        <button
          type="button"
          onClick={handleStopLeak}
          disabled={isLeakActionPending || !leakStatus.isLeaking}
          className="rounded bg-yellow-600 px-2 py-0.5 text-white hover:bg-yellow-700 disabled:opacity-50"
        >
          Stop Leak
        </button>
        <button
          type="button"
          onClick={handleCleanupLeak}
          disabled={isLeakActionPending || leakStatus.leakedChunks === 0}
          className="rounded bg-green-600 px-2 py-0.5 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Cleanup
        </button>
      </div>

      {/* Sticky Session Info */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <span>
          <span className="text-gray-400">Sticky Session:</span>{' '}
          {stickyCookie || <span className="text-gray-600">none</span>}
        </span>
        {previousStickyCookie && (
          <>
            <span className="text-gray-400">|</span>
            <span>
              <span className="text-gray-400">Previous:</span>{' '}
              {previousStickyCookie}
            </span>
          </>
        )}
      </div>

      {/* Hostname Tracking */}
      {previousHostname && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <span>
            <span className="text-gray-400">Current Host:</span>{' '}
            {currentHostname || 'unknown'}
          </span>
          <span className="text-gray-400">|</span>
          <span>
            <span className="text-gray-400">Previous Host:</span>{' '}
            {previousHostname}
          </span>
        </div>
      )}

      {/* Last Reconnection Status */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <span>
          <span className="text-gray-400">Last Check:</span>{' '}
          {formatTime(lastCheckedAt)}
        </span>
        <button
          type="button"
          onClick={handleCheckNow}
          className="rounded bg-blue-600 px-1.5 py-0.5 text-white hover:bg-blue-700"
        >
          Check Now
        </button>
        <span className="text-gray-400">|</span>
        <span>
          <span className="text-gray-400">Needs Reconnection:</span>{' '}
          <span
            className={
              lastReconnectionStatus ? 'text-red-500' : 'text-green-500'
            }
          >
            {lastReconnectionStatus === null
              ? 'unknown'
              : lastReconnectionStatus
                ? 'yes'
                : 'no'}
          </span>
        </span>
      </div>

      {/* Auto Cleanup Controls */}
      <div className="mt-2 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-1">
          <input
            type="checkbox"
            checked={autoCleanup}
            onChange={handleToggleAutoCleanup}
            className="h-3 w-3"
          />
          <span className="text-gray-400">Auto cleanup</span>
        </label>

        {!autoCleanup && (
          <button
            type="button"
            onClick={handleManualClear}
            disabled={isClearing}
            className="rounded bg-red-600 px-2 py-0.5 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isClearing ? 'Clearing...' : 'Clear Sticky Session'}
          </button>
        )}
      </div>
    </div>
  );
}
