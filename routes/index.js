const Router = require('koa-router');
const router = new Router();

const offers = require('./offers');
const markets = require('./markets');
const categorys = require('./categorys');

router.use('/offers', offers.routes());
router.use('/markets', markets.routes());
router.use('/categorys', categorys.routes());

router.get('/404', ctx => ctx.throw(404));
router.get('/500', ctx => ctx.throw(500));

module.exports = router;
