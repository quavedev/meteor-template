/* eslint-disable no-console */
import { registerMetrics } from './metrics';
import { WebApp } from 'meteor/webapp';
import { ClicksCollection } from '../app/clicks/ClicksCollection';
import { getServerHealth } from './health';

registerMetrics({
  path: '/api/metrics',
  useAuth: process.env.USE_METRICS_AUTH,
});

let count = 0;

const fibonacci = (num) => {
  if (num <= 1) {
    if (count++ % 100 === 0) {
      console.log(`fibonacci temp ${num}`);
      count = 0;
    }
    return num;
  }
  return fibonacci(num - 1) + fibonacci(num - 2);
};

WebApp.handlers.get('/api/load-fibonacci', (req, res) => {
  res.set('Content-type', 'application/json');
  const { num, timing } = req.query;
  if (!num) {
    res.status(400).send(
      JSON.stringify({
        status: 'error',
        message: 'num query param is required',
      })
    );
    return;
  }
  const start = new Date();
  console.log(`fibonacci ${num}`);
  const fib = fibonacci(num);
  const message = `fibonacci ${num}=${fib}, ${new Date() - start}ms`;
  console.log(message);

  if (timing) {
    res.status(200).send(JSON.stringify({ status: 'success', message }));
    return;
  }

  res.set('Content-type', 'application/json');
  res.status(200).send(JSON.stringify({ status: 'success' }));
});

WebApp.handlers.get('/api/load-data', async (req, res) => {
  res.set('Content-type', 'application/json');
  const { num, timing } = req.query;
  if (!num) {
    res.status(400).send(
      JSON.stringify({
        status: 'error',
        message: 'num query param is required',
      })
    );
    return;
  }
  const start = new Date();
  console.log(`data ${num}`);
  let clicks = (await ClicksCollection.findOneAsync()) || { counts: 0 };

  const loopSize = Array.from(Array(+num).keys());
  console.log('loopSize', loopSize);

  // eslint-disable-next-line no-restricted-syntax
  for await (const i of loopSize) {
    await ClicksCollection.upsertAsync({}, { $inc: { count: 1 } });
    clicks = (await ClicksCollection.findOneAsync()) || { counts: 0 };
    console.log(`iteration ${i}=${clicks.count}`);
  }
  const message = `data ${num}=${clicks.count}, ${new Date() - start}ms`;
  console.log(message);

  if (timing) {
    res.status(200).send(JSON.stringify({ status: 'success', message }));
    return;
  }

  res.set('Content-type', 'application/json');
  res.status(200).send(JSON.stringify({ status: 'success' }));
});

WebApp.handlers.get('/api', (req, res) => {
  res.set('Content-type', 'application/json');
  res.status(200).send(JSON.stringify({ status: 'success' }));
});

WebApp.handlers.get('/api/check-reconnection', (req, res) => {
  res.set('Content-type', 'application/json');

  const health = getServerHealth();

  if (health.needsReconnection) {
    res.clearCookie('__zcloud_sticky_sess', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    console.log(
      `[Health] Server ${health.hostname} is overloaded (${health.memory.heapUsagePercentage}% heap usage). Clearing sticky session cookie.`
    );

    res.status(200).send(
      JSON.stringify({
        status: 'overloaded',
        needsReconnection: true,
        hostname: health.hostname,
        memory: health.memory,
        message:
          'Server is overloaded. Sticky session cleared for load redistribution.',
      })
    );
    return;
  }

  res.status(200).send(
    JSON.stringify({
      status: 'healthy',
      needsReconnection: false,
      hostname: health.hostname,
      memory: health.memory,
    })
  );
});
