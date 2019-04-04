const Koa = require("koa");
const router = require("./routes");
const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const koaqs = require("koa-qs");
const errorHandler = require("koa-better-error-handler");
const koa404Handler = require("koa-404-handler");

const app = new Koa();

// override koa's undocumented error handler
app.context.onerror = errorHandler;

// specify that this is our api
app.context.api = true;

// Use the qs library instead of querystring to support nested objects.
koaqs(app);

app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app;
