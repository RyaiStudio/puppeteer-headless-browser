const puppeteer = require('puppeteer');

(async () => {

  class PuppetScraper {

    constructor(arr) {
      this.$arr = arr
      this.variabels()
    }

    variabels() {
      this.$scrapData = [];
    }

    async run() {
      this.$arr.forEach(async (url) => {
        this.$scrapData.push( await this.goLaunch(url) );
      }).then(() => {
        console.log(this.$scrapData)
      });
    }

    async goLaunch(singleURL) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto('https://www.spiralytics.com/');

      // Get the "viewport" of the page, as reported by the page.
      const pageResult = await page.evaluate(() => {

        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');

        return {
          title: document.querySelector('title').textContent,
          meta_desc: document.querySelector('meta[name="description"]').getAttribute("content"),
          tag_h1: (h1) ? h1.textContent : null,
          tag_h2: (h2) ? h2.textContent : null
        }

      });

      await browser.close();

      return pageResult;
    }
  }

  const pages = ["https://www.spiralytics.com/"]

  const pupet = new PuppetScraper(pages);

  pupet.run()

})();