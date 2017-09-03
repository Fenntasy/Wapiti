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

##### Table of Contents

* [Okapi.prepare()](#okapiprepare)
* [Okapi.goto(url)](#okapigotourl)
* [Okapi.click(selector)](#okapiclickselector)
* [Okapi.insert(selector, value)](#okapiinsertselector-value)
* [Okapi.fillForm(data)](#okapifillformdata)
* [Okapi.capture(func)](#okapicapturefunc)
* [Okapi.puppeteer(func)](#okapipuppeteerfunc)
* [Okapi.run()](#okapirun)

#### Okapi.prepare()

Start the chain of events you want to send for your test.

#### Okapi.goto(url)

Go to a URL and resolve when there is no more network requests.

#### Okapi.click(selector)

Click on the first result returned by `document.querySelector(selector)`.

#### Okapi.insert(selector, value)

Will insert `value` in the input found by `selector`.

#### Okapi.fillForm(data)

Handle the work of filling a form and submiting it.
`data` is an object with input selectors as key and the desired input value as value.


```javascript
Okapi.prepare()
  .goto("http://localhost"))
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

#### Okapi.puppeteer(func)

Allows you to use the puppeteer API yourself.
`func` will be passed the `page` object and you can use any method of the [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)

#### Okapi.run()

Really start the chain of events and return a promise with that should resolve with either the result of the `capture` call or an array with the results of the `capture` calls.


## To Do

* Add a VCR to deal with API
