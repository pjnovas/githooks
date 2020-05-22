const exec = require('child_process').exec;
const { verify } = require('@octokit/webhooks');

module.exports = ({ secret, when, dir, run }) => (req, res) => {
  if (!verify(secret, req.body, req.get('X-Hub-Signature'))) {
    return res.sendStatus(401);
  }

  const name = req.get('X-GitHub-Event');
  console.log('received event', name);

  // TODO: support an array on "when"
  const [event, action] = when.split('.');
  if (name !== event) {
    return res.status(400).send('event name unexpected');
  }

  if (action && action !== req.body.action) {
    console.log('ignored event because of action', action);
    return res.status(200).send('OK, but ignoring action');
  }

  console.log('executing event', name);

  const cmd = run(req.body, name);
  if (cmd) {
    exec(`cd ${dir}`);
    exec(cmd);
  }

  res.sendStatus(200);
};
