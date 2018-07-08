/* global jest test expect document */

const path = require("path");
const Wapiti = require("../../index");

jest.setTimeout(30000);

test("it should get the content of elements of the page when the submit event is prevented", () => {
  expect.assertions(1);
  return Wapiti()
    .goto("file://" + path.join(__dirname, "hijacked-form.html"))
    .fillForm(
      {
        "#firstInput": "test1",
        ".secondInput": "test2"
      },
      { waitForPageLoad: false }
    )
    .capture(() => document.querySelector("#data").textContent)
    .run()
    .then(result => expect(result).toBe("test1|test2"));
});
