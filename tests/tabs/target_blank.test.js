/* global jest test expect document */

const path = require("path");
const Wapiti = require("wapiti");

jest.setTimeout(30000);

test("it should get the content of elements of the page", async () => {
  expect.assertions(1);
  const result = await Wapiti()
    .goto("file://" + path.join(__dirname, "index.html"))
    .clickAndWaitForNewTab("#link")
    .nextTab()
    .capture(() => document.querySelector("h1").textContent)
    .previousTab()
    .capture(() => document.querySelector("h1").textContent)
    .run();
  expect(result).toEqual(["blank page", "first page"]);
});
