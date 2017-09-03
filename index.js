const puppeteer = require("puppeteer");

puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.goto("https://www.google.com");
  // other actions...
  browser.close();
});

const Okapi = {
  commands: [],
  prepare() {
    return this;
  },
  puppeteer(fun) {
    this.commands.push(page => fun(page));
    return this;
  },
  goto(url) {
    this.commands.push(page => page.goto(url, { waitUntil: "networkidle" }));
    return this;
  },
  click(selector, options = { button: "left", clickCount: 1, delay: 0 }) {
    this.commands.push(page => page.click(selector, options));
    return this;
  },
  capture(func) {
    this.commands.push(async (page, results) => {
      results.push(await page.evaluate(func));
      return page;
    });
    return this;
  },

  run: async function() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const results = [];

    for (let i = 0; i < this.commands.length; i++) {
      try {
        await this.commands[i](page, results);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
    }
    browser.close();

    if (results.length === 1) {
      return Promise.resolve(results[0]);
    } else {
      return Promise.resolve(results);
    }
  }
};

module.exports = Okapi;
