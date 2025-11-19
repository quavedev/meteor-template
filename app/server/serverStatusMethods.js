import { Meteor } from 'meteor/meteor';
import { getServerHealth } from '../../server/health';

Meteor.methods({
  'server.getStatus': async function getStatus() {
    const health = getServerHealth();

    return {
      hostname: health.hostname,
      status: health.isOverloaded ? 'overloaded' : 'healthy',
      memory: {
        heapUsed: health.memory.heapUsed,
        heapTotal: health.memory.heapTotal,
        heapSizeLimit: health.memory.heapSizeLimit,
        rss: health.memory.rss,
        external: health.memory.external,
        arrayBuffers: health.memory.arrayBuffers,
        heapUsagePercentage: health.memory.heapUsagePercentage,
      },
      threshold: health.threshold,
      leakStatus: health.leakStatus,
    };
  },
});
