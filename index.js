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
  goto(url) {
    this.commands.push(["GOTO", url]);
    return this;
  },
  click(selector, options = { button: "left", clickCount: 1, delay: 0 }) {
    this.commands.push(["CLICK", selector, options]);
    return this;
  },
  capture(fun) {
    this.commands.push(["EVAL", fun]);
    return this;
  },

  run: async function() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const results = [];

    for (let i = 0; i < this.commands.length; i++) {
      let [command, ...args] = this.commands[i];
      switch (command) {
        case "GOTO":
          try {
            await page.goto(args[0], { waitUntil: "networkidle" });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Error trying to go to the page", args[0], e);
          }
          break;
        case "CLICK":
          try {
            await page.click(...args);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Error trying to click on ", args[0], e);
          }
          break;
        case "EVAL":
          try {
            const result = await page.evaluate(...args);
            results.push(result);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("Error trying to evaluate function", e);
          }
          break;
        default:
          break;
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
