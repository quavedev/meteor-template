/* eslint-disable no-console */
import { collectDefaultMetrics, register } from 'prom-client';
import { Meteor } from 'meteor/meteor';

// eslint-disable-next-line no-undef
const Fibers = Npm.require('fibers');

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

export const registerMetrics = ({ app, path, useAuth }) => {
  collectDefaultMetrics({ timeout: 5000 });
  console.log({ useAuth });
  if (useAuth) {
    app.use(path, authMetrics);
  }
  app.use(
    path,
    Meteor.bindEnvironment((req, res) => {
      const promClientMetrics = Promise.await(register.metrics());
      const meteorMetrics = `# HELP nodejs_fibers_created Fibers created
# TYPE nodejs_fibers_created gauge
nodejs_fibers_created ${Fibers.fibersCreated}

# HELP nodejs_fibers_pool_size Fibers pool size
# TYPE nodejs_fibers_pool_size counter
nodejs_fibers_pool_size ${Fibers.poolSize}`;
      res.end(`${promClientMetrics}\n${meteorMetrics}`);
    })
  );
};
