/* global jest test expect document */

const path = require("path");
const Wapiti = require("../../index");

jest.setTimeout(12000);

test("it should use the Wapiti fetch", async () => {
  const result = await Wapiti.setupVCR()
    .goto("file://" + path.join(__dirname, "fetch.html"))
    .capture(() => document.querySelector("#result").textContent)
    .run();

  expect(result).toEqual("9919"); // ID of github user on github
});
