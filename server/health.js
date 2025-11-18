import os from 'os';

const RAM_THRESHOLD_PERCENTAGE = 50;

export function getServerHealth() {
  const memoryUsage = process.memoryUsage();
  const totalSystemMemory = os.totalmem();
  const nodeHeapUsed = memoryUsage.heapUsed;
  const nodeHeapTotal = memoryUsage.heapTotal;
  const nodeRss = memoryUsage.rss;

  const heapUsagePercentage = (nodeHeapUsed / nodeHeapTotal) * 100;
  const rssPercentageOfSystem = (nodeRss / totalSystemMemory) * 100;

  const isOverloaded = heapUsagePercentage > RAM_THRESHOLD_PERCENTAGE;
  const hostname = process.env.HOSTNAME || os.hostname();

  return {
    hostname,
    isOverloaded,
    needsReconnection: isOverloaded,
    memory: {
      heapUsed: nodeHeapUsed,
      heapTotal: nodeHeapTotal,
      rss: nodeRss,
      totalSystem: totalSystemMemory,
      heapUsagePercentage: Math.round(heapUsagePercentage * 100) / 100,
      rssPercentageOfSystem: Math.round(rssPercentageOfSystem * 100) / 100,
    },
    threshold: RAM_THRESHOLD_PERCENTAGE,
  };
}

export function shouldClearStickySession() {
  const health = getServerHealth();
  return health.isOverloaded;
}
