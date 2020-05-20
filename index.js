const process = require('process');
const http = require('http');
const exec = require('child_process').exec;

var nodeCleanup = require('node-cleanup');
const { Webhooks } = require('@octokit/webhooks');

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

  const hook = new Webhooks({ secret }).on(when, handler);
  return () => hook.removeListener(when, handler);
});

const server = http
  .createServer(webhooks.middleware)
  .listen(process.env.PORT || 8080);

nodeCleanup(() => {
  server.close();
  hooks.forEach(clean => clean());
});
