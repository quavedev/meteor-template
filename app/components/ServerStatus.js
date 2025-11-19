/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';

const CHECK_INTERVAL_MS = 30000;
const STICKY_SESSION_COOKIE = '__zcloud_sticky_sess';
const STICKY_SESSION_PREVIOUS_COOKIE = '__zcloud_sticky_sess_previous';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function ServerStatus() {
  const [serverInfo, setServerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stickyCookie, setStickyCookie] = useState(null);
  const [previousStickyCookie, setPreviousStickyCookie] = useState(null);

  const updateCookieState = useCallback(() => {
    const current = getCookie(STICKY_SESSION_COOKIE);
    const previous = getCookie(STICKY_SESSION_PREVIOUS_COOKIE);
    setStickyCookie(current);
    setPreviousStickyCookie(previous);
    console.log('[StickySession] Current cookie:', current);
    console.log('[StickySession] Previous cookie:', previous);
  }, []);

  const clearStickySessionCookie = useCallback(() => {
    const currentValue = getCookie(STICKY_SESSION_COOKIE);

    if (currentValue) {
      console.log(
        '[StickySession] Saving current cookie to previous:',
        currentValue
      );
      setCookie(STICKY_SESSION_PREVIOUS_COOKIE, currentValue);

      console.log(
        '[StickySession] Clearing sticky session cookie due to server overload'
      );
      deleteCookie(STICKY_SESSION_COOKIE);

      updateCookieState();
    } else {
      console.log('[StickySession] No sticky session cookie to clear');
    }
  }, [updateCookieState]);

  const fetchServerStatus = useCallback(async () => {
    try {
      const status = await Meteor.callAsync('server.getStatus');
      setServerInfo(status);
      setError(null);
    } catch (err) {
      setError(err.reason || 'Failed to fetch server status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkReconnection = useCallback(async () => {
    try {
      const response = await fetch('/api/check-reconnection');
      const data = await response.json();

      console.log('[StickySession] Check reconnection response:', data);

      if (data.needsReconnection) {
        console.log(
          '[StickySession] Server needs reconnection, clearing sticky session'
        );
        clearStickySessionCookie();

        setServerInfo((prev) => ({
          ...prev,
          status: 'overloaded',
          hostname: data.hostname,
        }));
      } else {
        updateCookieState();
      }
    } catch (err) {
      console.error('[StickySession] Error checking reconnection:', err);
    }
  }, [clearStickySessionCookie, updateCookieState]);

  useEffect(() => {
    updateCookieState();
    fetchServerStatus();

    const intervalId = setInterval(() => {
      checkReconnection();
      fetchServerStatus();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchServerStatus, checkReconnection, updateCookieState]);

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

  const { memory } = serverInfo;

  return (
    <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <span className={statusColor}>{statusIcon}</span>
        <span className="font-medium">{serverInfo.hostname}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span>
          Heap: {formatBytes(memory.heapUsed)} / {formatBytes(memory.heapTotal)}{' '}
          ({memory.heapUsagePercentage}%)
        </span>
        <span className="text-gray-400">|</span>
        <span>RSS: {formatBytes(memory.rss)}</span>
        <span className="text-gray-400">|</span>
        <span>System: {formatBytes(memory.totalSystem)}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
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
    </div>
  );
}
