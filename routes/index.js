const Router = require('koa-router');
const router = new Router();

const offers = require('./offers');
const markets = require('./markets');
const categorys = require('./categorys');

const config = require('../config/config');

router.use(async function(ctx, next) {
    console.log(ctx.headers);
    console.log(config.api.token);
    if(ctx.headers.token === config.api.token) {
        console.log('daqwdwq');
        await next();
    }else {
        ctx.throw(401);
    }
});


router.use('/offers', offers.routes());
router.use('/markets', markets.routes());
router.use('/categorys', categorys.routes());

router.get('/', ctx => ctx.body = 'onmylist api');

router.get('/404', ctx => ctx.throw(404));
router.get('/500', ctx => ctx.throw(500));
router.get('/401', ctx => ctx.throw(401));

module.exports = router;
