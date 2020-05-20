const process = require('process');
const http = require('http');
const exec = require('child_process').exec;

var nodeCleanup = require('node-cleanup');
const { createMiddleware } = require('@octokit/webhooks');

const repos = require('./repos');

const hooks = Object.keys(repos).map(key => {
  const { secret, when, dir, run } = repos[key];

  const handler = ({ name, payload }) => {
    const cmd = run(payload, name);

    if (cmd) {
      exec(`cd ${dir}`);
      exec(cmd);
    }
  };

  const middleware = createMiddleware({
    secret,
    path: `/${key}`
  });

  middleware.on(when, handler);

  return {
    middleware,
    clean: () => middleware.removeListener(when, handler)
  };
});

const server = http
  .createServer(hooks.map(({ middleware }) => middleware))
  .listen(process.env.PORT || 8080);

nodeCleanup(() => {
  server.close();
  hooks.forEach(({ clean }) => clean());
});
