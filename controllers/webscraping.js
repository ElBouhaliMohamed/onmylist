const $ = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const Spinner = require('cli-spinner').Spinner;

const nettoMaerkteListe = {
        item: 'Netto', 
        url: 'https://www.netto-online.de/filialangebote/;pgid=FR9oqjEuPDNSRpiU2YiUJ30l0000CfItt-E1;sid=XubOweazvIGDwbrfOOyf6PYfIAJGEXf3tBT58gf1'
};

const urls = [
    {
        item: 'REWE Bundesweit', 
        url: 'https://www.rewe.de/angebote/nationale-angebote/'
    },
    {
        item: 'REWE Standorte', 
        url: 'https://www.rewe.de/marktseite/duesseldorf/'
    }
];

const wait = async function(stallTime) {
    await new Promise(resolve => setTimeout(resolve, stallTime));
};

async function main() {
    // parse and write to files
    for(entry of urls) {

        switch(entry.item) {
            case 'REWE Bundesweit':
                await loadWebsite(entry.url , parseReweNationalAngebote);
            case 'REWE Standorte':
                await loadWebsite(entry.url, parseReweStandorte);
            case 'Netto':
                await loadWebsite(entry.url, parseNettoAngebote);
            break;
        }
    }

    console.log("done parsing and writing to files");
}

function parseReweStandorte(html) {
    return new Promise(function(resolve, reject) {
        try {
            let maerkte = [];

            $('market-tile', html).each(function(i, markt) {
                let info = $(markt).attr('market');

                maerkte[i] = JSON.parse(info);
            });
    
            fs.writeFile(`rewestandorte.json`, JSON.stringify(maerkte), function(err) {
                if(err) reject(err);
                resolve(maerkte);
            });
            
        }catch(err) {
            reject(err);
        }
    });
}

function parseReweNationalAngebote(html) {
    return new Promise(function(resolve, reject) {
        try {
            let angebote = [];

            let dueDate = $(html).find('div.drm-stage').find('div.content').find('div.headline-container').find('div.font-style-body').text().split(" ")[5];

            $('div.card', html).each(function(i, product) {
                let picture = $(product).find('.card-header').find('img').attr('src');
                let name = $(product).find('.card-body').find('p.headline > span').text();
                let priceEuro = $(product).find('div.body-content > div > div.price-offer > div.price > div.price-euro').text();
                let priceCent = $(product).find('div.body-content > div > div.price-offer > div.price > div.price-cent').text();
                let infos = [];

                $(product).find('.card-body')
                .find('div.body-content > div.font-style-caption')
                .children()
                .each(function(i, detail) {
                    if($(detail).text() != null && $(detail).text() != '') {
                        infos[i] = $(detail).text();
                    }
                });

                angebote[i] = {
                    name,
                    pic_url: picture,
                    price: priceEuro + priceCent,
                    information: infos,
                    market: 'REWE Bundesweit',
                    dueDate: dueDate
                }
            });
    
            fs.writeFile(`rewenational.json`, JSON.stringify(angebote), function(err) {
                if(err) reject(err);
                resolve(angebote);
            });
            
        }catch(err) {
            reject(err);
        }
    });
}

function parseNettoAngebote(html) {
    return new Promise(function(resolve, reject) {
        try {
            let angebote = [];

           // let dueDate = $(html).find('div.drm-stage').find('div.content').find('div.headline-container').find('div.font-style-body').text().split(" ")[5];

            $('.product', html).each(function(i, product) {
                let picture = $(product).find('.product__image-wrapper').find('img').attr('src');
                let name = $(product).find('.product__content').find('.product__info-wrapper > .product__title').text();
                let priceEuro = $(product).find('.product__content > .product__price-wrapper > .product__price-wrapper__inner > .product__current-price > .product__current-price--digits-before-comma').text();
                let priceCent = $(product).find('.product__content > .product__price-wrapper > .product__price-wrapper__inner > .product__current-price > .product__current-price--digits-after-comma').text();
                let infos = [];

                $(product).find('.product__content')
                .find('product__info-wrapper > .product__base-price')
                .children()
                .each(function(i, detail) {
                    if($(detail).text() != null && $(detail).text() != '') {
                        infos[i] = $(detail).text();
                    }
                });

                angebote[i] = {
                    name,
                    bild: picture,
                    preis: priceEuro + priceCent,
                    infos,
                    markt: 'Netto',
                    dueDate: dueDate
                }
            });
    
            fs.writeFile(`nettoangebote.json`, JSON.stringify(angebote), function(err) {
                if(err) reject(err);
                resolve(angebote);
            });
            
        }catch(err) {
            reject(err);
        }
    });
}

async function loadWebsite(url, callback) {
    try{
        const spinner = new Spinner(`verarbeite.. ${url}`);
        spinner.setSpinnerString('|/-\\');
        spinner.start();

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: ['load','networkidle0','networkidle2']});

        // bilder sind meistens lazyloaded daher müssen wir scrolling simulieren
        const bodyHandle = await page.$('body');
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
        const result = await callback(html);
        await browser.close();
        await spinner.stop(true);
        return result;
    }catch(err) {
        console.log(err);
    }
}

module.exports = main;