const process = require('process');
const express = require('express');
const healthcheck = require('healthcheck-middleware');

const repos = require('./repos');
const port = process.env.PORT || 8080;
const middleware = require('./middleware');

const app = express();

app.use(express.json());
app.use('/healthcheck', healthcheck());

console.group('Exposed WebHooks');

Object.keys(repos).forEach(key => {
  const route = `/${key}`;
  app.post(route, middleware(repos[key]));
  console.log(`POST ${route} > ${repos[key].when}`);
});

console.groupEnd('Exposed WebHooks');

app.listen(port, () => console.log(`listening at ${port} port`));
