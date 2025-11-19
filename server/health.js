/* eslint-disable no-console */
import os from 'os';
import v8 from 'v8';

const DEFAULT_THRESHOLD_PERCENTAGE = 50;

// Memory leak simulation storage
let leakedMemory = [];
let leakIntervalId = null;
let currentChunkSize = 50;

export function getServerHealth({
  threshold = DEFAULT_THRESHOLD_PERCENTAGE,
} = {}) {
  const memoryUsage = process.memoryUsage();
  const heapStats = v8.getHeapStatistics();

  const { heapUsed } = memoryUsage;
  const { heapTotal } = memoryUsage;
  const heapSizeLimit = heapStats.heap_size_limit;
  const { rss } = memoryUsage;
  const { external } = memoryUsage;
  const { arrayBuffers } = memoryUsage;

  // Host machine memory
  const totalSystemMemory = os.totalmem();
  const freeSystemMemory = os.freemem();
  const usedSystemMemory = totalSystemMemory - freeSystemMemory;

  // Calculate percentage based on heap_size_limit (max available heap)
  const heapUsagePercentage = (heapUsed / heapSizeLimit) * 100;
  const rssPercentageOfSystem = (rss / totalSystemMemory) * 100;
  const systemMemoryUsagePercentage =
    (usedSystemMemory / totalSystemMemory) * 100;

  const isOverloaded = heapUsagePercentage > threshold;
  const hostname = process.env.HOSTNAME || os.hostname();

  return {
    hostname,
    isOverloaded,
    needsReconnection: isOverloaded,
    memory: {
      heapUsed,
      heapTotal,
      heapSizeLimit,
      rss,
      external,
      arrayBuffers,
      heapUsagePercentage: Math.round(heapUsagePercentage * 100) / 100,
    },
    hostMemory: {
      total: totalSystemMemory,
      free: freeSystemMemory,
      used: usedSystemMemory,
      usagePercentage: Math.round(systemMemoryUsagePercentage * 100) / 100,
      rssPercentageOfSystem: Math.round(rssPercentageOfSystem * 100) / 100,
    },
    threshold,
    leakStatus: {
      isLeaking: leakIntervalId !== null,
      leakedChunks: leakedMemory.length,
      chunkSize: currentChunkSize,
    },
  };
}

export function shouldClearStickySession() {
  const health = getServerHealth();
  return health.isOverloaded;
}

export function startMemoryLeak({ chunkSize = 50 } = {}) {
  if (leakIntervalId !== null) {
    console.log('[MemoryLeak] Already leaking memory');
    return {
      status: 'already_running',
      message: 'Memory leak is already running',
    };
  }

  currentChunkSize = chunkSize;

  console.log(
    `[MemoryLeak] Starting controlled memory leak (adding ~${chunkSize}MB to heap every 5 seconds)`
  );

  leakIntervalId = setInterval(() => {
    // Allocate heap memory using arrays of objects (not Buffers which go to external memory)
    // Each object with a string takes heap space
    const chunk = [];
    const itemsPerChunk = currentChunkSize * 1024; // ~1KB per item
    for (let i = 0; i < itemsPerChunk; i++) {
      chunk.push({
        data: 'x'.repeat(1024), // 1KB string per object
        index: i,
        timestamp: Date.now(),
      });
    }
    leakedMemory.push(chunk);
    console.log(
      `[MemoryLeak] Added chunk ${leakedMemory.length}, total leaked: ~${leakedMemory.length * currentChunkSize}MB`
    );
  }, 5000);

  return {
    status: 'started',
    message: `Memory leak started with ${chunkSize}MB chunks`,
    chunkSize,
  };
}

export function stopMemoryLeak() {
  if (leakIntervalId === null) {
    console.log('[MemoryLeak] No memory leak running');
    return { status: 'not_running', message: 'Memory leak is not running' };
  }

  clearInterval(leakIntervalId);
  leakIntervalId = null;
  const totalMB = leakedMemory.length * currentChunkSize;
  console.log(
    `[MemoryLeak] Stopped memory leak. ${leakedMemory.length} chunks retained (~${totalMB}MB)`
  );

  return {
    status: 'stopped',
    message: 'Memory leak stopped',
    retainedChunks: leakedMemory.length,
    totalMB,
  };
}

export function cleanupMemoryLeak() {
  const chunksCleared = leakedMemory.length;
  const mbCleared = chunksCleared * currentChunkSize;

  // Stop leak if running
  if (leakIntervalId !== null) {
    clearInterval(leakIntervalId);
    leakIntervalId = null;
  }

  // Clear the leaked memory
  leakedMemory = [];

  // Force garbage collection if available (requires --expose-gc flag)
  if (global.gc) {
    global.gc();
    console.log('[MemoryLeak] Forced garbage collection');
  }

  console.log(
    `[MemoryLeak] Cleaned up ${chunksCleared} chunks (~${mbCleared}MB)`
  );

  return {
    status: 'cleaned',
    message: `Cleaned up ${chunksCleared} chunks (~${mbCleared}MB)`,
    chunksCleared,
    mbCleared,
  };
}
