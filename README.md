# githooks

nodejs script to run commands from git web hooks

## Getting started

Create a `repos.json` at this root like:

```js
module.exports = {
  awesome-api: {
    secret: '1234', // webhook secret
    when: 'release.published', // event name
    dir: '/var/www/awesome-api', // working directory

    // receives the payload from the hook
    // returns the string to execute
    run: ({ release: { tag_name } }) =>
      `git fetch && git checkout ${tag_name} && docker-compose up --build --remove-orphans -d`
  },
  my-website: {
    secret: '1234',
    when: 'push',
    dir: '/var/www/my-website',

    // with conditionals > if return is falsy, wont execute
    run: ({ ref }) =>
      ref === 'refs/heads/master'
        ? 'git pull origin master && pm2 restart my-website'
        : ''
  },
};
```

Install dependencies and start script:

```bash
npm install --production
PORT=3000 npm start
```

You should use pm2 on production env.

## How it works

When a web hook calls in if get the expected repo from `repos.json` and run the following commands as the user which this script is run with.

```bash
cd [repo]
git pull
docker-compose up --build --remove-orphans -d
```

## Contribute

Running tests:

```bash
npm install
npm test
```

The purpose behind it is to make re-deploys from github repo using docker as easier as possible.

My idea is to move this script into a Docker Image but I have to put more thinking in it first (I want to avoid doing a git pull in this image)
