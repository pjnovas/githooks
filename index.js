const process = require('process');
const exec = require('child_process').exec;

const express = require('express');
const healthcheck = require('healthcheck-middleware');
const nodeCleanup = require('node-cleanup');
const { Webhooks } = require('@octokit/webhooks');

const repos = require('./repos');
const port = process.env.PORT || 8080;

const app = express();

app.use('/healthcheck', healthcheck());

const hooks = Object.keys(repos).map(key => {
  const { secret, when, dir, run } = repos[key];

  const handler = ({ name, payload }) => {
    const cmd = run(payload, name);

    if (cmd) {
      exec(`cd ${dir}`);
      exec(cmd);
    }
  };

  const webhooks = new Webhooks({ secret });

  app.post(`/${key}`, webhooks.middleware);
  webhooks.on(when, handler);

  return {
    webhooks,
    clean: () => webhooks.removeListener(when, handler)
  };
});

app.listen(port, () => console.log(`listening at ${port} port`));

nodeCleanup(() => {
  hooks.forEach(({ clean }) => clean());
});
