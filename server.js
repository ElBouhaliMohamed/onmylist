const app = require('./app');
const db = require('./models');
require('./controllers/cron-jobs.js');

db.sequelize.sync().then(() => {
	app.listen(3000);
});