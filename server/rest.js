/* eslint-disable no-console */
import express from 'express';
import { registerMetrics } from './metrics.js';
import { WebApp } from 'meteor/webapp';

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

WebApp.connectHandlers.use('/api/', app);
