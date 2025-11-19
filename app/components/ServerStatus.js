/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';

const CHECK_INTERVAL_MS = 30000;

// Cookie names for settings
const COOKIE_AUTO_CLEANUP = '__zcloud_auto_cleanup';
const COOKIE_CHUNK_SIZE = '__zcloud_chunk_size';
const COOKIE_HEALTH_THRESHOLD = '__zcloud_health_threshold';

// Default values
const DEFAULT_AUTO_CLEANUP = false;
const DEFAULT_CHUNK_SIZE = 50;
const DEFAULT_HEALTH_THRESHOLD = 50;

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

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

function loadSettingsFromCookies() {
  const autoCleanupCookie = getCookie(COOKIE_AUTO_CLEANUP);
  const chunkSizeCookie = getCookie(COOKIE_CHUNK_SIZE);
  const healthThresholdCookie = getCookie(COOKIE_HEALTH_THRESHOLD);

  const autoCleanup =
    autoCleanupCookie !== null
      ? autoCleanupCookie === 'true'
      : DEFAULT_AUTO_CLEANUP;

  const chunkSize =
    chunkSizeCookie !== null
      ? parseInt(chunkSizeCookie, 10)
      : DEFAULT_CHUNK_SIZE;

  const healthThreshold =
    healthThresholdCookie !== null
      ? parseInt(healthThresholdCookie, 10)
      : DEFAULT_HEALTH_THRESHOLD;

  // Initialize cookies if they don't exist
  if (autoCleanupCookie === null) {
    setCookie(COOKIE_AUTO_CLEANUP, DEFAULT_AUTO_CLEANUP.toString());
  }
  if (chunkSizeCookie === null) {
    setCookie(COOKIE_CHUNK_SIZE, DEFAULT_CHUNK_SIZE.toString());
  }
  if (healthThresholdCookie === null) {
    setCookie(COOKIE_HEALTH_THRESHOLD, DEFAULT_HEALTH_THRESHOLD.toString());
  }

  return { autoCleanup, chunkSize, healthThreshold };
}

export function ServerStatus() {
  const [serverInfo, setServerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stickyCookie, setStickyCookie] = useState(null);
  const [previousStickyCookie, setPreviousStickyCookie] = useState(null);
  const [currentHostname, setCurrentHostname] = useState(null);
  const [previousHostname, setPreviousHostname] = useState(null);
  const [lastReconnectionStatus, setLastReconnectionStatus] = useState(null);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [leakStatus, setLeakStatus] = useState({
    isLeaking: false,
    leakedChunks: 0,
  });
  const [isLeakActionPending, setIsLeakActionPending] = useState(false);

  // Settings loaded from cookies
  const [autoCleanup, setAutoCleanup] = useState(() => {
    const settings = loadSettingsFromCookies();
    return settings.autoCleanup;
  });
  const [chunkSize, setChunkSize] = useState(() => {
    const settings = loadSettingsFromCookies();
    return settings.chunkSize;
  });
  const [healthThreshold, setHealthThreshold] = useState(() => {
    const settings = loadSettingsFromCookies();
    return settings.healthThreshold;
  });

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
      console.log('=== [StickySession] CLEAR COOKIE REQUEST ===');
      console.log('[StickySession] Sending POST to /api/clear-sticky-session');
      console.log('[StickySession] Timestamp:', new Date().toISOString());

      const response = await fetch('/api/clear-sticky-session', {
        method: 'POST',
      });
      const data = await response.json();

      console.log('[StickySession] Server response received:');
      console.log('[StickySession] Status:', data.status);
      console.log('[StickySession] Message:', data.message);
      console.log(
        '[StickySession] Previous sticky session (saved):',
        data.previousStickySession
      );
      console.log(
        '[StickySession] Current sticky session (cleared):',
        data.stickySession
      );
      console.log('=== [StickySession] CLEAR COOKIE COMPLETE ===');

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
      const response = await fetch(
        `/api/check-reconnection?threshold=${healthThreshold}`
      );
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
        console.log('=== [StickySession] RECONNECTION NEEDED ===');
        console.log('[StickySession] Server hostname:', data.hostname);
        console.log(
          '[StickySession] Heap usage:',
          `${data.memory.heapUsagePercentage}%`
        );
        console.log('[StickySession] Threshold:', `${healthThreshold}%`);
        console.log(
          '[StickySession] Current sticky session:',
          data.stickySession
        );
        console.log(
          '[StickySession] Previous sticky session:',
          data.previousStickySession
        );
        console.log('[StickySession] Memory details:', {
          heapUsed: data.memory.heapUsed,
          heapSizeLimit: data.memory.heapSizeLimit,
          rss: data.memory.rss,
        });

        setServerInfo((prev) => ({
          ...prev,
          status: 'overloaded',
          hostname: data.hostname,
        }));

        // Auto cleanup if enabled
        if (autoCleanup) {
          console.log(
            '[StickySession] Auto cleanup ENABLED - triggering cookie clear'
          );
          console.log(
            '[StickySession] Clearing __zcloud_sticky_sess cookie...'
          );
          await clearStickySession();
          console.log('[StickySession] Cookie clear request sent to server');
        } else {
          console.log(
            '[StickySession] Auto cleanup DISABLED - waiting for manual action'
          );
          console.log(
            '[StickySession] User must click "Clear Sticky Session" button'
          );
        }
        console.log('=== [StickySession] RECONNECTION CHECK COMPLETE ===');
      }
    } catch (err) {
      console.error('[StickySession] Error checking reconnection:', err);
    }
  }, [autoCleanup, clearStickySession, healthThreshold]);

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
      setCookie(COOKIE_AUTO_CLEANUP, newValue.toString());
      console.log(
        `[StickySession] Auto cleanup ${newValue ? 'enabled' : 'disabled'}`
      );
      return newValue;
    });
  }, []);

  const handleChunkSizeChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= 500) {
      setChunkSize(value);
      setCookie(COOKIE_CHUNK_SIZE, value.toString());
      console.log(`[MemoryLeak] Chunk size changed to ${value}MB`);
    }
  }, []);

  const handleHealthThresholdChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= 100) {
      setHealthThreshold(value);
      setCookie(COOKIE_HEALTH_THRESHOLD, value.toString());
      console.log(`[Health] Threshold changed to ${value}%`);
    }
  }, []);

  const handleManualClear = useCallback(async () => {
    console.log('[StickySession] Manual clear requested');
    await clearStickySession();
  }, [clearStickySession]);

  const handleStartLeak = useCallback(async () => {
    try {
      setIsLeakActionPending(true);
      console.log(
        `[MemoryLeak] Starting memory leak with ${chunkSize}MB chunks`
      );
      const response = await fetch(
        `/api/memory-leak/start?chunkSize=${chunkSize}`,
        {
          method: 'POST',
        }
      );
      const data = await response.json();
      console.log('[MemoryLeak] Start response:', data);
      await fetchServerStatus();
    } catch (err) {
      console.error('[MemoryLeak] Error starting leak:', err);
    } finally {
      setIsLeakActionPending(false);
    }
  }, [fetchServerStatus, chunkSize]);

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

      {/* Settings */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <label className="flex items-center gap-1">
          <span className="text-gray-400">Threshold:</span>
          <input
            type="number"
            value={healthThreshold}
            onChange={handleHealthThresholdChange}
            min="1"
            max="100"
            className="w-12 rounded border border-gray-600 bg-gray-800 px-1 text-center text-white"
          />
          <span className="text-gray-400">%</span>
        </label>
        <label className="flex items-center gap-1">
          <span className="text-gray-400">Chunk:</span>
          <input
            type="number"
            value={chunkSize}
            onChange={handleChunkSizeChange}
            min="1"
            max="500"
            className="w-12 rounded border border-gray-600 bg-gray-800 px-1 text-center text-white"
          />
          <span className="text-gray-400">MB</span>
        </label>
      </div>

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
              <span className="text-gray-400">Leaked:</span>{' '}
              {leakStatus.leakedChunks} chunks
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
