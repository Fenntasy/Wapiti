/* global test expect document */

const path = require("path");
const Wapiti = require("../../index");

test("it should get the content of elements of the page", async () => {
  const result = await Wapiti.puppeteer(page =>
    page.goto("file://" + path.join(__dirname, "getH1.html"))
  )
    .capture(() => document.querySelector("h1").textContent)
    .capture(() => document.querySelector("h2").textContent)
    .run();
  expect(result).toEqual(["content of h1", "content of h2"]);
});
