/* global document window fetch */
const fs = require("fs-extra");
const path = require("path");
const puppeteer = require("puppeteer");

const Wapiti = (function() {
  let commands = [];
  const VCR = {
    active: false,
    fixturePath: "./_fixtures",
    mode: "cache"
  };

  return {
    setupVCR(options = {}) {
      VCR.active = true;
      if (options.fixturePath) {
        VCR.fixturePath = options.fixturePath;
      }
      if (options.mode) {
        VCR.mode = options.mode;
      }
      fs.ensureDir(VCR.fixturePath);
      return this;
    },
    puppeteer(fun) {
      commands.push(page => fun(page));
      return this;
    },
    goto(url) {
      commands.push(page => page.goto(url, { waitUntil: "networkidle" }));
      return this;
    },
    click(selector, options = { button: "left", clickCount: 1, delay: 0 }) {
      commands.push(page => page.click(selector, options));
      return this;
    },
    typeIn(selector, value) {
      commands.push(async page => {
        await page.focus(selector);
        await page.type(value);
        return page;
      });
      return this;
    },
    fillForm(options) {
      const selectors = Object.keys(options);
      commands.push(async page => {
        for (let i = 0; i < selectors.length; i++) {
          await page.focus(selectors[i]);
          await page.type(options[selectors[i]]);
        }
        await page.evaluate(
          firstInput => document.querySelector(firstInput).form.submit(),
          selectors[0]
        );
        await page.waitForNavigation({ waitUntil: "networkidle" });
        return page;
      });
      return this;
    },
    capture(func) {
      commands.push(async (page, results) => {
        results.push(await page.evaluate(func));
        return page;
      });
      return this;
    },
    captureUrl() {
      commands.push(async (page, results) => {
        results.push(await page.url());
        return page;
      });
      return this;
    },
    run: async function() {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      const results = [];
      if (VCR.active) {
        await page.exposeFunction("readfile", async (root, filename) =>
          new Promise((resolve, reject) =>
            fs.readFile(
              path.join(__dirname, root, filename),
              "utf8",
              (err, text) => {
                if (err) reject(err);
                else resolve(text);
              }
            )
          ).catch(() => {})
        );
        await page.exposeFunction("writefile", async (root, filename, buffer) =>
          new Promise((resolve, reject) =>
            fs.writeFile(
              path.join(__dirname, root, filename),
              buffer,
              (err, text) => {
                if (err) reject(err);
                else resolve(text);
              }
            )
          ).catch(() => {})
        );
        const fetchVCR = await new Promise((resolve, reject) =>
          fs.readFile(
            "fetch-vcr-browser-bundle.js",
            "utf8",
            (err, data) => (err ? reject(err) : resolve(data))
          )
        );
        await page.evaluateOnNewDocument(fetchVCR);
        await page.evaluateOnNewDocument(VCR => {
          window.fetch = window.fetchVCR;
          fetch.configure({
            fixturePath: VCR.fixturePath,
            mode: VCR.mode
          });
        }, VCR);
      }

      for (let i = 0; i < commands.length; i++) {
        try {
          await commands[i](page, results);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(e);
        }
      }
      browser.close();

      // Reset Wapiti
      commands = [];
      VCR.active = false;

      return Promise.resolve(results.length === 1 ? results[0] : results);
    }
  };
})();

module.exports = Wapiti;
