/* global test expect */

const path = require("path");
const Wapiti = require("../../index");

test("it should get the content of elements of the page", async () => {
  const result = await Wapiti.goto(
    "file://" + path.join(__dirname, "form1.html")
  )
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
