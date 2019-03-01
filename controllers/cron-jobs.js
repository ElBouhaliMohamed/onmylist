const CronJob = require("cron").CronJob;
const webscraping = require('./webscraping.js');

new CronJob(
  "0 0 13 * 2 *",
  webscraping,
  null,
  true
);