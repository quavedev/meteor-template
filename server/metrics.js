/* eslint-disable no-console */
import { collectDefaultMetrics, register } from 'prom-client';
import { WebApp } from 'meteor/webapp';

const authMetrics = (req, res, next) => {
  const authUser = process.env.AUTH_USER || 'user';
  const authPasswd = process.env.AUTH_PASSWD || 'passwd';
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64')
    .toString()
    .split(':');

  if (authUser && authPasswd && login === authUser && password === authPasswd) {
    next();
    return;
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="401"');
  res.writeHead(401);
  res.end('Authentication required.');
};

export const registerMetrics = ({ path, useAuth }) => {
  collectDefaultMetrics({ timeout: 5000 });
  console.log({ useAuth });
  if (useAuth) {
    WebApp.handlers.get(path, authMetrics);
  }
  WebApp.handlers.get(path, async (req, res) => {
    const promClientMetrics = await register.metrics();
    res.end(promClientMetrics);
  });
};
