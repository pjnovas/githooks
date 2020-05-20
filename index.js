const process = require('process');
const exec = require('child_process').exec;

const express = require('express');
const healthcheck = require('healthcheck-middleware');
const { verify } = require('@octokit/webhooks');

const repos = require('./repos');
const port = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use('/healthcheck', healthcheck());

Object.keys(repos).forEach(key => {
  const { secret, when, dir, run } = repos[key];

  app.post(`/${key}`, (req, res) => {
    if (verify(secret, req.body, req.get('X-Hub-Signature'))) {
      const name = req.get('X-GitHub-Event');

      if (when === name) {
        const cmd = run(payload, name);

        if (cmd) {
          exec(`cd ${dir}`);
          exec(cmd);
        }

        res.sendStatus(200);
        return;
      }

      res.status(400).send('event name unexpected');
      return;
    }

    res.sendStatus(401);
  });
});

app.listen(port, () => console.log(`listening at ${port} port`));
