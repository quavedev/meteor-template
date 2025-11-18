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

export function ServerStatus() {
  const [serverInfo, setServerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

      if (data.needsReconnection) {
        setServerInfo((prev) => ({
          ...prev,
          status: 'overloaded',
          hostname: data.hostname,
        }));
      }
    } catch (err) {
      // Silent fail for reconnection check
    }
  }, []);

  useEffect(() => {
    fetchServerStatus();

    const intervalId = setInterval(() => {
      checkReconnection();
      fetchServerStatus();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchServerStatus, checkReconnection]);

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
    </div>
  );
}
