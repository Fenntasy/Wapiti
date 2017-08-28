# Okapi

Integration testing based on [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Okapi is aimed at single page apps that rely on APIs.
The goal is to be able to use the VCR pattern in order to first mock the API on your local tests and then be able to commit the results and test it on your continuous integration.

## Example

```javascript
const path = require("path");
const Okapi = require("../index");

test("it should get the content of elements of the page", async () => {
  const result = await Okapi.prepare()
    .goto("file://" + path.join(__dirname, "getH1.html"))
    .capture(() => document.querySelector("h1").textContent)
    .capture(() => document.querySelector("h2").textContent)
    .run();
  expect(result).toEqual(["content of h1", "content of h2"]);
});
```

## API

`Okapi.prepare()`

Start the chain of events you want to send for your test.

`Okapi.goto(url)`

Go to a URL and resolve when there is no more network requests.

`Okapi.click(selector)`

Click on the first result returned by `document.querySelector(selector)`.

`Okapi.capture(func)`

Execute `func` on the current page and add an entry to the end result.
If only one `capture` call is done, the end result will be its value.
If several calls are made, the end result will be an array with all captures.

`Okapi.run()`

Really start the chain of events and return a promise with that should resolve with either the result of the `capture` call or an array with the results of the `capture` calls.
