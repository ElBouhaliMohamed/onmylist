const Router = require('koa-router');
const markets = new Router();

const models = require('../models');

markets.get('/withOffers', async (ctx, next) => {
	const allmarkets = await models.market.findAll({
		include: [
		  {
			model: models.offer
		  }
		]
	  });

	ctx.body = allmarkets;
	await next();
});

markets.get('/', async (ctx, next) => {
	const allmarkets = await models.market.findAll({});

	ctx.body = allmarkets;
	await next();
});

markets.get('/search/byId/:id', async (ctx, next) => {
	const market = await models.market.findById(ctx.params.id, {
		include: [
		  {
			model: models.offer
		  }
		]
	});	

	ctx.body = market;
	await next();
});

markets.get("/search/:key", async (ctx, next) => {
  try {
    const key = ctx.params.key.replace('_',' ');

     const markets = await models.market.findAll({
      where: {
        address: {
          [Op.like]: `%${key}%`
        }
      }
     });

     if(markets.length == 0) {
      ctx.status = 404;
     }

     ctx.body = markets;
     await next();
  }catch(err) {
    ctx.throw(Boom.badRequest(err));
  }
});

markets.post('/add', async (ctx, next) => {
	const market = await models.market.create(ctx.request.body);

	ctx.body = market;
	await next();
});

markets.patch('/update/:id', async (ctx, next) => {
	const market = await models.market.findById(ctx.params.id);
	const updatedmarket = await market.update(ctx.request.body);

	ctx.body = updatedmarket;
	await next();
});

markets.delete('/delete/:id', async (ctx, next) => {
	const market = await models.market.findById(ctx.params.id);
	const deleted = await market.destroy();

	ctx.body = deleted;
	await next();
});

module.exports = markets;