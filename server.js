const app = require("./app.js");
const db = require("../models");
const config = require("../config/config.json");

if (config.api.initDatabase) {
  db.sequelize.sync().then(async () => {
    app.listen(3000);
  });
} else {
  app.listen(3000);
}
