# Okapi

Integration testing based on [Puppeteer](https://github.com/GoogleChrome/puppeteer).

Okapi is aimed at single page apps that rely on APIs.
The goal is to be able to use the [VCR pattern](https://github.com/vcr/vcr) in order to first mock the API on your local tests and then be able to commit the results and test it on your continuous integration.
VCR is optional and can be setup for each tests.

## Example

In theory, you could use Okapi with any test framework, here is an example with [Jest](https://facebook.github.io/jest/)

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

##### Table of Contents

* [Okapi.prepare()](#okapiprepare)
* [Okapi.setupVCR(options)](#okapisetupvcroptions)
* [Okapi.goto(url)](#okapigotourl)
* [Okapi.click(selector)](#okapiclickselector)
* [Okapi.typeIn(selector, value)](#okapitypeinselector-value)
* [Okapi.fillForm(data)](#okapifillformdata)
* [Okapi.capture(func)](#okapicapturefunc)
* [Okapi.captureUrl()](#okapicaptureurl)
* [Okapi.puppeteer(func)](#okapipuppeteerfunc)
* [Okapi.run()](#okapirun)

#### Okapi.prepare()

Start the chain of events you want to send for your test.

#### Okapi.setupVCR(options)

Use the VCR for this test.

`options` can be omited and defaults to `{fixturePath: "./_fixtures", mode: "cache"}`.
The `fixturePath` will be created if it does not exists and can be an absolute or relative path (starting from where you launch your tests).
`mode` can be either `cache` (attempts to read from the VCR and fetch it if not present), `record` (always fetch and record) or `playback` (always read from the VCR).

The VCR mode is still in development and will only work with calls done with `fetch` in your web app.
Furthermore, the promise produced by `fetch` can only use the `json` and `text` function in the ensuing `then`.
Please make an issue if you need something else.

#### Okapi.goto(url)

Go to a URL and resolve when there is no more network requests.

#### Okapi.click(selector)

Click on the first result returned by `document.querySelector(selector)`.

#### Okapi.typeIn(selector, value)

Will insert `value` in the input found by `selector`.

#### Okapi.fillForm(data)

Handle the work of filling a form and submiting it.
`data` is an object with input selectors as key and the desired input value as value.


```javascript
Okapi.goto("http://localhost"))
  .fillForm({
    "#firstInput": "test1", // will result in <input id="firstInput" value="test1" />
    ".secondInput": "test2" // will result in <input class="secondInput" value="test2" />
  })
```

The form in which these input belong will then be submitted and the resulting page will be waited for.
Please note that this function will only work if there is a real navigation occuring, if the submit event is hijacked, you will need to use `Okapi.insert` and `Okapi.click` instead.

#### Okapi.capture(func)

Execute `func` on the current page and add an entry to the end result.
If only one `capture` call is done, the end result will be its value.
If several calls are made, the end result will be an array with all captures.

#### Okapi.captureUrl()

Convenience function for getting the URL of the page and adding it to the captures.
Functionnally equivalent to `Okapi.capture(() => document.location.href)`

#### Okapi.puppeteer(func)

Allows you to use the puppeteer API yourself.
`func` will be passed the `page` object and you can use any method of the [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md).

In most cases, you should not need to wait for something with Okapi (the defaults try to be enough) but if you need it, you can do it like this:

```javascript
Okapi.goto("http://localhost"))
  .puppeteer(page => page.waitFor(2000))
```

#### Okapi.run()

Really start the chain of events and return a promise with that should resolve with either the result of the `capture` call or an array with the results of the `capture` calls.
