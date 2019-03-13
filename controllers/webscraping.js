const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");
const Spinner = require("cli-spinner").Spinner;
const models = require("../models");

// const nettoMaerkteListe = {
//   item: "Netto",
//   url:
//     "https://www.netto-online.de/filialangebote/;pgid=FR9oqjEuPDNSRpiU2YiUJ30l0000CfItt-E1;sid=XubOweazvIGDwbrfOOyf6PYfIAJGEXf3tBT58gf1"
// };

const urls = [
  {
    item: "REWE Standorte",
    url: "https://www.rewe.de/marktseite/duesseldorf/"
  },
  {
    item: "REWE Lokale Angebote",
    url: "https://www.rewe.de/marktseite/duesseldorf/"
  }
];

let reweStandorte = [];

const wait = async function(stallTime) {
  await new Promise(resolve => setTimeout(resolve, stallTime));
};

(async function main() {
  try {
    // parse and write to files
    for (entry of urls) {
      switch (entry.item) {
        case "REWE Bundesweit":
          await loadWebsite(entry.item, entry.url, parseReweAngebote);
        case "REWE Standorte":
          await loadWebsite(entry.item, entry.url, parseReweStandorte);
        case "REWE Lokale Angebote":
          await parseRewe();
        case "Netto":
          await loadWebsite(entry.item, entry.url, parseNettoAngebote);
          break;
      }
    }

    console.log("done parsing and writing to files");
  } catch (err) {
    console.log("Error while parsing");
    console.log(err);
  }
})();

function parseReweStandorte(html) {
  return new Promise(function(resolve, reject) {
    try {
      let maerkte = [];

      $("market-tile", html).each(function(i, markt) {
        let info = JSON.parse($(markt).attr("market"));

        maerkte[i] = info;
      });

      reweStandorte = maerkte;

      fs.appendFile(`rewestandorte.json`, JSON.stringify(maerkte), function(
        err
      ) {
        if (err) reject(err);
        resolve(maerkte);
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function parseRewe() {
  try {
    let offerLinks = await parseReweOfferLinks();
    if (offerLinks) {
      for (let [index, offerLink] of offerLinks.entries()) {
        await loadWebsite(
          `REWE Markt Nr.${index + 1}/${offerLinks.length}`,
          offerLink,
          parseReweAngebote
        );
      }
    }
  } catch (err) {
    throw err;
  }
}

async function parseReweOfferLinks() {
  try {
    // https://www.rewe.de/marktseite/*stadt*/*id*/rewe-*type(city,markt)*-*address*-*houseNumber*/

    let offerLinks = [];

    for (let markt of reweStandorte) {
      let address = markt.address.street.toLowerCase().replace(" ", "-") + "-" + markt.address.houseNumber.toLowerCase().replace(" ", "-");
      let link = `https://www.rewe.de/angebote/${markt.address.city.toLowerCase()}/${markt.id}/rewe-${markt.type.id.toLowerCase() == "rewe" ? "markt" : "city"}-${address}`;
      await offerLinks.push(link);
    }

    if (offerLinks.length == 0) throw "Empty offerLinks Error";

    return offerLinks;
  } catch (err) {
    throw err;
  }
}

function findReweMarket(market) {
  return new Promise(function(resolve, reject) {
    try {
      let street = market.split(",")[0];

      for (let entry of reweStandorte) {
        if (entry.address.streetWithNumber == street) {
          resolve({
            name: entry.name,
            PhoneNumber: entry.phone,
            address: `${entry.address.streetWithNumber}, ${
              entry.address.postalCode
            } ${entry.address.city}`,
            GeoLocation: entry.geoLocation,
            OpeningTimes: entry.openingHours.condensed[0]
          });
        }
      }

      resolve(null);
    } catch (err) {
      reject(err);
    }
  });
}

function findCategoriesForProduct(productName) {
    try {
      const categories = [
        {
          saft: "Getraenk",
          cola: "Getraenk",
          sekt: "Getraenk",
          secco: "Getraenk",
          drink: "Getraenk",
          limo: "Getraenk",
          fleisch: "Fleisch",
          steak: "Fleisch",
          knoblauch: "Getraenk"
        }
      ];

      let categoriesFound = [];

      for (let category in categories) {
        if (productName.includes(category)) {
          categoriesFound.push({ name: categories[category] });
        } else {
          categoriesFound.push({ name: "Sonstiges" });
        }
      }

      return categoriesFound;
    } catch (err) {
      throw err;
    }
}

async function parseReweAngebote(html) {
  try {
    let angebote = {};

    let dueDate = $(html)
      .find("div.drm-stage")
      .find("div.content")
      .find("div.headline-container")
      .find("div.font-style-body")
      .text()

    let dueDateIndex = dueDate.search(/\d{2}(\.|-)\d{2}(\.|-)\d{4}/g);

    if(dueDateIndex != -1) {
      dueDate = dueDate.slice(dueDateIndex, dueDateIndex+10);
    }else {
      dueDate = null;
    }

    let market = $(html)
      .find(
        "div.drm-stage > div.content > div.market-box-container > div.market-box > div.market-box-content > div.market-box-header > div.font-style-caption"
      )
      .text()
      .replace("\n", "")
      .trim();

    if (market) {
      market = await findReweMarket(market);
    } else {
      market = {
        name: 'REWE Bundesweit',
        PhoneNumber: '',
        address: 'REWE Bundesweit',
        GeoLocation: '',
        OpeningTimes: ''
      };
    }

    $("div.card", html).each(function(i, product) {
      let picture = $(product)
        .find(".card-header")
        .find("img")
        .attr("src");
      let name = $(product)
        .find(".card-body")
        .find("p.headline > span")
        .text()
        .replace("\n", " ")
        .trim();

      let categories = findCategoriesForProduct(name);

      let priceEuro = $(product)
        .find(
          "div.body-content > div > div.price-offer > div.price > div.price-euro"
        )
        .text();
      let priceCent = $(product)
        .find(
          "div.body-content > div > div.price-offer > div.price > div.price-cent"
        )
        .text();
      let infos = {};
      let unit = '';
      let volume = '';

      $(product)
        .find(".card-body")
        .find("div.body-content > div.font-style-caption")
        .children()
        .each(function(i, detail) {
          if ($(detail).text() != null && $(detail).text() != "") {
            infos[i] = $(detail).text();

            // if(infos[i].contains('je ')) {
            //   let volumeIndex = infos[i].search(/^(\d|,)*\.?\d*$/g);
            //   volume = infos[i].slice(volumeIndex);
            // }
          }
        });

      if (name != "") {
          angebote[name] = {
            name: name,
            dueDate: dueDate,
            pic_url: picture,
            price: priceEuro + priceCent,
            information: infos,
            market: market,
            categories: categories
          };

      }
    });

    for(const angebot of Object.values(angebote)) {
      await addOffer(angebot);
    }

  } catch (err) {
    throw err;
  }
}

function parseNettoAngebote(html) {
  return new Promise(function(resolve, reject) {
    try {
      let angebote = [];

      // let dueDate = $(html).find('div.drm-stage').find('div.content').find('div.headline-container').find('div.font-style-body').text().split(" ")[5];

      $(".product", html).each(function(i, product) {
        let picture = $(product)
          .find(".product__image-wrapper")
          .find("img")
          .attr("src");
        let name = $(product)
          .find(".product__content")
          .find(".product__info-wrapper > .product__title")
          .text();
        let priceEuro = $(product)
          .find(
            ".product__content > .product__price-wrapper > .product__price-wrapper__inner > .product__current-price > .product__current-price--digits-before-comma"
          )
          .text();
        let priceCent = $(product)
          .find(
            ".product__content > .product__price-wrapper > .product__price-wrapper__inner > .product__current-price > .product__current-price--digits-after-comma"
          )
          .text();
        let infos = [];
        let unit = '';
        let volume = '';
            
        $(product)
          .find(".product__content")
          .find("product__info-wrapper > .product__base-price")
          .children()
          .each(function(i, detail) {
            if ($(detail).text() != null && $(detail).text() != "") {
              infos[i] = $(detail).text();

              if(infos[i].contains('je')){

              }
            }
          });

        angebote[i] = {
          name,
          bild: picture,
          preis: priceEuro + priceCent,
          infos,
          markt: "Netto",
          dueDate: dueDate
        };
      });

      fs.appendFile(`netto.json`, JSON.stringify(angebote), function(err) {
        if (err) reject(err);
        resolve(angebote);
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function addOffer(entry) {
  try {
    // format date to ISO Date
    const dateArray = entry.dueDate.split('.');
    const date = new Date(Date.parse(`${dateArray[2]}-${dateArray[1]}-${dateArray[0]}`));
    entry.dueDate = date;

    // check if offer exists already or create
    const foundOffer = await models.offer
      .findOrCreate({
        where: { name: entry.name },
        defaults: entry
      })
      .spread((offer, created) => {
        return { offer, created };
      });

    // find market

    let foundMarket = await models.market
    .findOrCreate({ where: { address: entry.market.address }, defaults: entry.market })
    .spread((createdMarket, created) => {
      return { createdMarket, created };
    });

    foundOffer.offer.addMarket(foundMarket.createdMarket);

    // parse categories and create if not exisiting
    const categories = entry.categories;
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
    foundOffer.offer.addCategories(createdCategories);

    return { offer: foundOffer.offer, market: foundMarket, categories: createdCategories };

  } catch (err) {
    throw err;
  }
}

async function loadWebsite(name, url, callback) {
  const spinner = new Spinner(`verarbeite.. ${name}, ${url}`);
  spinner.setSpinnerString("|/-\\");
  spinner.start();

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();

    // page.on('request', r => {
    //     console.log(`\n${r.resourceType()}:  ${r.url()}`);
    // });

    await page.goto(url, {
      waitUntil: ["networkidle2"]
    });

    // bilder sind meistens lazyloaded daher müssen wir scrolling simulieren
    const bodyHandle = await page.$("body");
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    const viewportHeight = page.viewport().height;
    let viewportIncr = 0;
    while (viewportIncr + viewportHeight < height) {
      await page.evaluate(_viewportHeight => {
        window.scrollBy(0, _viewportHeight);
      }, viewportHeight);
      await wait(2000);
      viewportIncr = viewportIncr + viewportHeight;
    }

    const html = await page.content();
    let result = page.url();

    if (callback) {
      result = await callback(html, page);
    }

    await browser.close();
    await spinner.stop(true);
    return result;
  } catch (err) {
    browser.close();
    spinner.stop(true);
    throw err;
  }
}