# githooks

nodejs script to run commands from git web hooks

## Getting started

Create a `repos.js` at this root like:

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
    secret: '5678',
    when: 'push',
    dir: '/var/www/my-website',

    // with conditionals > if result is falsy, won't execute
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

Then you will have exposed the following routes:

- `POST http://localhost:3000/awesome-api`: as webhook
- `POST http://localhost:3000/my-website`: as webhook
- `GET http://localhost:3000/healthcheck`: a quick healthcheck of the service

You should use pm2 on production env.

## How it works

[TODO]

## Contribute

Running tests:

```bash
npm install
npm test
```

The purpose behind it is to make re-deploys from github repo using docker as easier as possible.

My idea is to move this script into a Docker Image but I have to put more thinking in it first (I want to avoid doing a git pull in this image)
