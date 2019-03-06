const Router = require("koa-router");
const offers = new Router();

const models = require("../models");
const Boom = require("boom");

offers.get("/", async (ctx, next) => {
  try {
    const alloffers = await models.offer.findAll({
      include: [
        {
          model: models.category
        },
        {
          model: models.market
        }
      ]
    });

    // for(let offer in alloffers) {
    //   for(let categories of offer.categories) {
    //     delete categories.OfferCategories;
    //   }
    // }

    ctx.body = alloffers;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

offers.get("/byId/:id", async (ctx, next) => {
  try {
    const offer = await models.offer.findById(ctx.params.id, {
      include: [
        {
          model: models.category
        },
        {
          model: models.market
        }
      ]
    });

    ctx.body = offer;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});


offers.post("/add", async (ctx, next) => {
  try {
    // format date to ISO Date
    const dateArray = ctx.request.body.offer.dueDate.split('.');
    const date = new Date(Date.parse(`${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`));
    ctx.request.body.offer.dueDate = date;

    // check if offer exists already or create
    const foundOffer = await models.offer
      .findOrCreate({
        where: { name: ctx.request.body.offer.name },
        defaults: ctx.request.body.offer
      })
      .spread((offer, created) => {
        return { offer, created };
      });


    // find market
    const foundMarket = await models.market.findOne({
      where: { address: ctx.request.body.market.address }
    });

    if (!foundMarket) {
      // create and associate market with offer
      await foundOffer.offer.createMarket(ctx.request.body.market);
    } else {
      if (foundOffer.created) {
        // associate existing market with offer
        await foundOffer.offer.setMarket(foundMarket);
      }
    }

    // parse categories and create if not exisiting
    const categories = ctx.request.body.categories;
    const createdCategories = [];

    for (let category of categories) {
      let foundCategory = await models.category
        .findOrCreate({ where: { name: category.name }, defaults: category })
        .spread((createdCategory, created) => {
          return { createdCategory, created };
        });

      createdCategories.push(foundCategory.createdCategory);
    }

    // associate all the categories with the offer
    foundOffer.offer.setCategories(createdCategories);
    
    ctx.body = { offer: foundOffer.offer, market: foundMarket, categories: createdCategories };

    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

offers.patch("/update/:id", async (ctx, next) => {
  try {
    const offer = await models.offer.findById(ctx.params.id);
    const updatedoffer = await offer.update(ctx.request.body);

    ctx.body = updatedoffer;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

offers.delete("/delete/:id", async (ctx, next) => {
  try {
    const offer = await models.offer.findById(ctx.params.id);
    const deleted = await offer.destroy();

    ctx.body = deleted;
    await next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err));
  }
});

module.exports = offers;
