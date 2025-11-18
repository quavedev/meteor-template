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
        rss: health.memory.rss,
        totalSystem: health.memory.totalSystem,
        heapUsagePercentage: health.memory.heapUsagePercentage,
        rssPercentageOfSystem: health.memory.rssPercentageOfSystem,
      },
      threshold: health.threshold,
    };
  },
});
