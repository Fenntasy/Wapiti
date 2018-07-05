/* global window */
const fs = require("fs-extra");
const path = require("path");
const puppeteer = require("puppeteer");
const { submitFormAndWait } = require("./dom");

const readFile = (root, filename) =>
  new Promise((resolve, reject) =>
    fs.readFile(
      path.join(__dirname, root, filename),
      "utf8",
      (err, text) => (err ? reject(err) : resolve(text))
    )
  ).catch(() => {});

const writeFile = (root, filename, buffer) =>
  new Promise((resolve, reject) =>
    fs.writeFile(
      path.join(__dirname, root, filename),
      buffer,
      (err, text) => (err ? reject(err) : resolve(text))
    )
  ).catch(() => {});

const setupVCR = (browser, page, VCR) =>
  page
    .exposeFunction("readfile", readFile)
    .then(() => page.exposeFunction("writefile", writeFile))
    .then(() => readFile(".", "fetch-vcr-browser-bundle.js"))
    .then(fetchVCR => page.evaluateOnNewDocument(fetchVCR))
    .then(() =>
      page.evaluateOnNewDocument(VCR => {
        window.fetch = window.fetchVCR;
        window.fetch.configure({
          fixturePath: VCR.fixturePath,
          mode: VCR.mode
        });
      }, VCR)
    )
    .then(() => [browser, page]);

const foldP = (pred, list) =>
  list.reduce((acc, elt) => acc.then(() => pred(elt)), Promise.resolve());

const Wapiti = function() {
  return {
    _commands: [],
    _VCR: {
      active: false,
      fixturePath: "./_fixtures",
      mode: "cache"
    },
    capture(func) {
      const command = (page, results) =>
        page.evaluate(func).then(evaluation => results.push(evaluation));

      return { ...this, _commands: [...this._commands, command] };
    },
    captureUrl() {
      const command = (page, results) =>
        Promise.resolve(results.push(page.url()));
      return { ...this, _commands: [...this._commands, command] };
    },
    click(selector, options = { button: "left", clickCount: 1, delay: 0 }) {
      const command = page => page.click(selector, options);
      return { ...this, _commands: [...this._commands, command] };
    },
    clickAndWaitForNewTab(
      selector,
      options = { button: "left", clickCount: 1, delay: 0 }
    ) {
      const command = (page, _, browser) => {
        page.click(selector, options);
        return new Promise(resolve => {
          browser.on("targetcreated", resolve);
        });
      };
      return { ...this, _commands: [...this._commands, command] };
    },
    fillForm(formValues, options = {}) {
      const { submitForm = true, waitForPageLoad = true } = options;
      if (waitForPageLoad && !submitForm) {
        // eslint-disable-next-line no-console
        console.warn(
          "Warning: waitForPageLoad is set to true but submitForm is not" +
            "\nwaitForPageLoad is only here to wait for a page load and won't be used if the form is not submitted"
        );
      }
      const selectors = Object.keys(formValues);
      const command = page =>
        foldP(
          selector => page.type(selector, formValues[selector]),
          selectors
        ).then(() =>
          submitFormAndWait(page, selectors, submitForm, waitForPageLoad)
        );
      return { ...this, _commands: [...this._commands, command] };
    },
    goto(url) {
      const command = page => page.goto(url, { waitUntil: "networkidle0" });

      return { ...this, _commands: [...this._commands, command] };
    },
    nextTab() {
      const command = (page, _, browser) => {
        return browser.pages().then(pages => {
          if (pages.length === 1) {
            // eslint-disable-next-line no-console
            console.warn(
              "Warning, attempting to change tab when there is only one \n" +
                "You may need to call clickAndWaitForNewTab() before switching tab"
            );
          }
          return {
            newWapitiPage:
              pages[(pages.findIndex(p => p === page) + 1) % pages.length]
          };
        });
      };
      return { ...this, _commands: [...this._commands, command] };
    },
    previousTab() {
      const command = (page, _, browser) => {
        return browser.pages().then(pages => {
          if (pages.length === 1) {
            // eslint-disable-next-line no-console
            console.warn(
              "Warning, attempting to change tab when there is only one \n" +
                "You may need to call clickAndWaitForNewTab() before switching tab"
            );
          }
          return {
            newWapitiPage:
              pages[
                Math.abs(pages.findIndex(p => p === page) - 1) % pages.length
              ]
          };
        });
      };
      return { ...this, _commands: [...this._commands, command] };
    },
    puppeteer(fun) {
      const command = (page, _, browser) => Promise.resolve(fun(page, browser));
      return { ...this, _commands: [...this._commands, command] };
    },
    run: function() {
      return doRun(this._commands, this._VCR);
    },
    debugRun: function() {
      return doRun(this._commands, this._VCR, {
        headless: false,
        closeBrowserOnEnd: false
      });
    },
    setupVCR(options = {}) {
      fs.ensureDir(this._VCR.fixturePath);
      return {
        ...this,
        _VCR: {
          ...this._VCR,
          active: true,
          fixturePath: options.fixturePath
            ? options.fixturePath
            : this._VCR.fixturePath,
          mode: options.mode ? options.mode : this._VCR.mode
        }
      };
    },
    typeIn(selector, value) {
      const command = page => page.type(selector, value, { delay: 10 });
      return { ...this, _commands: [...this._commands, command] };
    }
  };
};

const doRun = (commands, VCR, options = { closeBrowserOnEnd: true }) => {
  const noSandbox = process.env.IN_CI || process.env.IN_DOCKER;
  options = noSandbox ? { ...options, args: ["--no-sandbox"] } : options;
  let browserRef;
  return puppeteer
    .launch(options)
    .then(browser => {
      browserRef = browser;
      return Promise.all([browser, browser.pages()]);
    })
    .then(([browser, pages]) =>
      Promise.all([browser, pages.length > 0 ? pages[0] : browser.newPage()])
    )
    .then(
      ([browser, page]) =>
        VCR.active ? setupVCR(browser, page, VCR) : [browser, page]
    )
    .then(([browser, page]) => {
      let results = [];
      return foldP(
        command =>
          command(page, results, browser).then(data => {
            if (
              data !== undefined &&
              data !== null &&
              data.newWapitiPage !== undefined
            ) {
              page = data.newWapitiPage;
            }
            return Promise.resolve();
          }),
        commands
      )
        .then(() => {
          if (options.closeBrowserOnEnd) {
            browser.close();
          }
        })
        .then(() =>
          Promise.resolve(results.length === 1 ? results[0] : results)
        );
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      if (options.closeBrowserOnEnd) {
        browserRef.close();
      }
    });
};

module.exports = Wapiti;
