/* global jest test expect document */

const path = require("path");
const Wapiti = require("wapiti");

jest.setTimeout(12000);

test("it should get the content of elements of the page", async () => {
  expect.assertions(2);
  let output = undefined;
  // eslint-disable-next-line no-console
  console.warn = jest.fn(warn => {
    output = warn;
  });
  const result = await Wapiti.goto(
    "file://" + path.join(__dirname, "index.html")
  )
    .click("#link")
    .nextTab()
    .puppeteer(
      (page, browser) =>
        new Promise(resolve => {
          browser.on("targetcreated", resolve);
        })
    )
    .capture(() => document.querySelector("h1").textContent)
    .previousTab()
    .capture(() => document.querySelector("h1").textContent)
    .run()
    .then(result => {
      expect(output).toBe(
        "Warning, attempting to change tab when there is only one \n" +
          "You may need to call clickAndWaitForNewTab() before switching tab"
      );
      return result;
    });
  expect(result).toEqual(["first page", "blank page"]);
});
