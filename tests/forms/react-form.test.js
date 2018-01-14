/* global jest test expect document */

const path = require("path");
const Wapiti = require("../../index");

jest.setTimeout(12000);

test("it should submit a form with a React app", () => {
  expect.assertions(1);
  return Wapiti.goto("file://" + path.join(__dirname, "react-form.html"))
    .fillForm({ "#myInput": "test" }, { waitForPageLoad: false })
    .capture(() => document.querySelector("#data").textContent)
    .run()
    .then(result => expect(result).toBe("test"));
});
