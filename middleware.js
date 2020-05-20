const exec = require('child_process').exec;
const { verify } = require('@octokit/webhooks');

module.exports = ({ secret, when, dir, run }) => (req, res) => {
  if (!verify(secret, req.body, req.get('X-Hub-Signature'))) {
    return res.sendStatus(401);
  }

  const name = req.get('X-GitHub-Event');
  if (when === !name) {
    return res.status(400).send('event name unexpected');
  }

  const cmd = run(req.body, name);
  if (cmd) {
    exec(`cd ${dir}`);
    exec(cmd);
  }

  res.sendStatus(200);
};
