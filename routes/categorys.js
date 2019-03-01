const Router = require("koa-router");
const categorys = new Router();

const models = require("../models");
const Boom = require("boom");

categorys.get("/", async (ctx, next) => {
  try {
    const allcategorys = await models.category.findAll({
      include: [
        {
          model: models.offer
        }
      ]
    });

    // for(let category in allcategorys) {
    //   for(let categories of category.categories) {
    //     delete categories.categoryCategorys;
    //   }
    // }

    ctx.body = allcategorys;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

categorys.get("/byId/:id", async (ctx, next) => {
  try {
    const category = await models.category.findById(ctx.params.id, {
      include: [
        {
          model: models.offer
        }
      ]
    });

    ctx.body = category;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});


categorys.post("/add", async (ctx, next) => {
  try {
	const category = await models.category.create(ctx.request.body);

	ctx.body = category;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

categorys.patch("/update/:id", async (ctx, next) => {
  try {
    const category = await models.category.findById(ctx.params.id);
    const updatedcategory = await category.update(ctx.request.body);

    ctx.body = updatedcategory;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

categorys.delete("/delete/:id", async (ctx, next) => {
  try {
    const category = await models.category.findById(ctx.params.id);
    const deleted = await category.destroy();

    ctx.body = deleted;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

module.exports = categorys;
