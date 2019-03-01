const Router = require('koa-router');
const markets = new Router();

const models = require('../models');

markets.get('/', async (ctx, next) => {
	const allmarkets = await models.market.findAll();

	ctx.body = allmarkets;
	await next();
});

markets.get('/byId/:id', async (ctx, next) => {
	const market = await models.market.findById(ctx.params.id);	

	ctx.body = market;
	await next();
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