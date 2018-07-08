/* global jest test expect */

const path = require("path");
const Wapiti = require("../../index");

jest.setTimeout(30000);

test("it should redirect with the form when a submit is present", async () => {
  expect.assertions(1);
  const result = await Wapiti()
    .goto("file://" + path.join(__dirname, "form1.html"))
    .fillForm({
      "#firstInput": "test1",
      ".secondInput": "test2"
    })
    .captureUrl()
    .run();

  expect(result).toEqual(
    "file://" + path.join(__dirname, "form2.html?first=test1&second=test2")
  );
});
