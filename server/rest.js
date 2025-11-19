/* eslint-disable no-console */
import { registerMetrics } from './metrics';
import { WebApp } from 'meteor/webapp';
import { ClicksCollection } from '../app/clicks/ClicksCollection';
import {
  getServerHealth,
  startMemoryLeak,
  stopMemoryLeak,
  cleanupMemoryLeak,
} from './health';

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

const STICKY_SESSION_COOKIE = '__zcloud_sticky_sess';
const STICKY_SESSION_PREVIOUS_COOKIE = '__zcloud_sticky_sess_previous';
const HOSTNAME_COOKIE = '__zcloud_current_hostname';
const HOSTNAME_PREVIOUS_COOKIE = '__zcloud_previous_hostname';

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    const value = rest.join('=').trim();
    if (name) {
      cookies[name.trim()] = value;
    }
  });

  return cookies;
}

WebApp.handlers.get('/api/check-reconnection', (req, res) => {
  res.set('Content-type', 'application/json');

  // Get threshold from query param, default to 50
  const threshold = parseInt(req.query.threshold, 10) || 50;

  const health = getServerHealth({ threshold });
  const cookies = parseCookies(req.headers.cookie);
  const stickySession = cookies[STICKY_SESSION_COOKIE] || null;
  const previousStickySession = cookies[STICKY_SESSION_PREVIOUS_COOKIE] || null;
  const currentHostname = cookies[HOSTNAME_COOKIE] || null;
  const previousHostname = cookies[HOSTNAME_PREVIOUS_COOKIE] || null;

  // Update hostname cookies if hostname changed
  if (currentHostname !== health.hostname) {
    if (currentHostname) {
      // Save current hostname as previous
      res.cookie(HOSTNAME_PREVIOUS_COOKIE, currentHostname, {
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      console.log(
        `[Health] Hostname changed from ${currentHostname} to ${health.hostname}`
      );
    }
    // Set new current hostname
    res.cookie(HOSTNAME_COOKIE, health.hostname, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  const baseResponse = {
    hostname: health.hostname,
    memory: health.memory,
    stickySession,
    previousStickySession,
    currentHostname: health.hostname,
    previousHostname:
      currentHostname !== health.hostname ? currentHostname : previousHostname,
    checkedAt: new Date().toISOString(),
  };

  if (health.needsReconnection) {
    console.log(
      `[Health] Server ${health.hostname} is overloaded (${health.memory.heapUsagePercentage}% heap usage). Client should clear sticky session.`
    );

    res.status(200).send(
      JSON.stringify({
        ...baseResponse,
        status: 'overloaded',
        needsReconnection: true,
        message:
          'Server is overloaded. Clear sticky session for load redistribution.',
      })
    );
    return;
  }

  res.status(200).send(
    JSON.stringify({
      ...baseResponse,
      status: 'healthy',
      needsReconnection: false,
    })
  );
});

WebApp.handlers.post('/api/clear-sticky-session', (req, res) => {
  res.set('Content-type', 'application/json');

  const cookies = parseCookies(req.headers.cookie);
  const currentStickySession = cookies[STICKY_SESSION_COOKIE] || null;
  const previousStickySession = cookies[STICKY_SESSION_PREVIOUS_COOKIE] || null;
  const health = getServerHealth();

  console.log('=== [StickySession] CLEAR COOKIE REQUEST RECEIVED ===');
  console.log('[StickySession] Timestamp:', new Date().toISOString());
  console.log('[StickySession] Server hostname:', health.hostname);
  console.log(
    '[StickySession] Current __zcloud_sticky_sess:',
    currentStickySession
  );
  console.log(
    '[StickySession] Previous __zcloud_sticky_sess_previous:',
    previousStickySession
  );
  console.log('[StickySession] Current memory state:');
  console.log('[StickySession]   Heap used:', health.memory.heapUsed);
  console.log('[StickySession]   Heap limit:', health.memory.heapSizeLimit);
  console.log(
    '[StickySession]   Heap usage %:',
    health.memory.heapUsagePercentage
  );
  console.log('[StickySession]   RSS:', health.memory.rss);

  if (currentStickySession) {
    console.log(
      '[StickySession] ACTION: Clearing current cookie and saving to previous'
    );
    console.log(
      '[StickySession] Saving value to __zcloud_sticky_sess_previous:',
      currentStickySession
    );
    console.log('[StickySession] Clearing __zcloud_sticky_sess cookie');

    // Set previous cookie with the current value
    res.cookie(STICKY_SESSION_PREVIOUS_COOKIE, currentStickySession, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Clear the current sticky session cookie
    res.clearCookie(STICKY_SESSION_COOKIE, { path: '/' });

    console.log('[StickySession] Cookie operations completed');
    console.log('=== [StickySession] CLEAR COOKIE SUCCESS ===');

    res.status(200).send(
      JSON.stringify({
        status: 'success',
        message: 'Sticky session cookie cleared',
        previousStickySession: currentStickySession,
        stickySession: null,
      })
    );
  } else {
    console.log('[StickySession] ACTION: No cookie to clear');
    console.log('[StickySession] __zcloud_sticky_sess was already null/empty');
    console.log('=== [StickySession] CLEAR COOKIE - NO ACTION NEEDED ===');

    res.status(200).send(
      JSON.stringify({
        status: 'success',
        message: 'No sticky session cookie to clear',
        previousStickySession,
        stickySession: null,
      })
    );
  }
});

// Memory leak control endpoints
WebApp.handlers.post('/api/memory-leak/start', (req, res) => {
  res.set('Content-type', 'application/json');
  // Get chunk size from query param, default to 50
  const chunkSize = parseInt(req.query.chunkSize, 10) || 50;
  const result = startMemoryLeak({ chunkSize });
  res.status(200).send(JSON.stringify(result));
});

WebApp.handlers.post('/api/memory-leak/stop', (req, res) => {
  res.set('Content-type', 'application/json');
  const result = stopMemoryLeak();
  res.status(200).send(JSON.stringify(result));
});

WebApp.handlers.post('/api/memory-leak/cleanup', (req, res) => {
  res.set('Content-type', 'application/json');
  const result = cleanupMemoryLeak();
  res.status(200).send(JSON.stringify(result));
});
