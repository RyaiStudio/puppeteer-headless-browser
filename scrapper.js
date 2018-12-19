const puppeteer = require('puppeteer');
const axios = require('axios');
const md5 = require('crypto-js/md5');

(async () => {

    class PuppetScraper {

        constructor(data) {
            this.$page_id = data.page_id
            this.$url    = data.url
        }

        async scrap() {
            
            const awaitData = new Promise( async (resolve, reject) => {
                const goData = await this.goLaunch();
                goData.page_id = parseInt(this.$page_id);
                goData.bodyHash = md5(goData.bodyHash).toString();
                resolve(goData)
            })

            awaitData.then(response => {

                axios.post('http://jaderabbit.local/api/v1/web-scraping', response
                ).then(httpRes => {
                    // get body data
                    console.log(httpRes.data)
                }).catch( httpErr => {
                    console.log(httpErr.data)
                });
            })
        }

        async goLaunch() {

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // disable images and CSS to speedup scraping
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (req.resourceType() == 'stylesheet' || 
                    req.resourceType() == 'font' || 
                    req.resourceType() == 'image') {
                    req.abort();
                } else { req.continue(); }
            });

            await page.goto(this.$url);

            // Get the "viewport" of the page, as reported by the page.
            const pagesScrap = await page.evaluate(() => {

                const h1 = document.querySelectorAll('h1');
                const h2 = document.querySelectorAll('h2');
                const meta_desc = document.querySelector('meta[name="description"]');
                const title = document.querySelector('title');
                const bodyEl = document.querySelector('body');

                return {
                    title: (title) ? title.textContent : '',
                    metaDesc: (meta_desc) ? meta_desc.getAttribute("content") : '',
                    tagH1: (h1.length>0) ? Array.from(h1).map(el => el.textContent) : [],
                    tagH2: (h2.length>0) ? Array.from(h2).map(el => el.textContent) : [],
                    wordCount: bodyEl.textContent.trim().split(' ').filter(el => (el != "")).length,
                    bodyHash: bodyEl.textContent.trim()
                }
            });

            await browser.close();
            
            return pagesScrap;
        }
    }

    const pagesData = {
        page_id: process.argv[2],
        url: process.argv[3]
    }
    const pupet = new PuppetScraper(pagesData);
    pupet.scrap()

})();