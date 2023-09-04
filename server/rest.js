/* eslint-disable no-console */
import express from 'express';
import { registerMetrics } from './metrics.js';
import { WebApp } from 'meteor/webapp';
import { ClicksCollection } from '../app/clicks/ClicksCollection';

const app = express();

registerMetrics({
  app,
  path: '/metrics',
  useAuth: process.env.USE_METRICS_AUTH,
});

app.get('/', (req, res) => {
  res.set('Content-type', 'application/json');
  res.status(200).send(JSON.stringify({ status: 'success' }));
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

app.get('/load-fibonacci', (req, res) => {
  res.set('Content-type', 'application/json');
  const { num, timing, noFibers } = req.query;
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
  const fib = noFibers ? fibonacci(num) : Promise.await(fibonacci(num));
  const message = `fibonacci ${num}=${fib}, ${new Date() - start}ms`;
  console.log(message);

  if (timing) {
    res.status(200).send(JSON.stringify({ status: 'success', message }));
    return;
  }

  res.set('Content-type', 'application/json');
  res.status(200).send(JSON.stringify({ status: 'success' }));
});

app.get('/load-data', (req, res) => {
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
  let clicks = ClicksCollection.findOne() || { counts: 0 };

  const loopSize = Array.from(Array(+num).keys());
  console.log('loopSize', loopSize);

  // eslint-disable-next-line no-restricted-syntax
  for (const i of loopSize) {
    ClicksCollection.upsert({}, { $inc: { count: 1 } });
    clicks = ClicksCollection.findOne() || { counts: 0 };
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

WebApp.connectHandlers.use('/api/', app);
